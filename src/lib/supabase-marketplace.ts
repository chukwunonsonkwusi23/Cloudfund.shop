import type { RealtimeChannel, User } from "@supabase/supabase-js";
import { getSupabaseClient } from "./supabase";

const PRODUCT_IMAGE_BUCKET = "product-images";
export const MAX_PRODUCT_IMAGE_SIZE = 5 * 1024 * 1024;
export const SUPPORTED_PRODUCT_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type VendorStatus = "pending" | "approved" | "suspended";

export type MarketVendor = {
  id: string;
  fullName: string;
  storeName: string;
  email: string;
  role: "vendor";
  status: VendorStatus;
  createdAt: string;
};

export type MarketProduct = {
  id: string;
  vendorId: string;
  vendorName: string;
  storeName: string;
  vendorStatus: VendorStatus;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  createdAt: string;
};

export type MarketActivity = {
  id: string;
  vendorId?: string;
  actorUid: string;
  actor: string;
  type: string;
  description: string;
  createdAt: string;
};

type ProductInput = {
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  imageFile?: File | null;
};

type ProfileRow = {
  id: string;
  full_name: string;
  store_name: string;
  email: string;
  role: string;
  status: VendorStatus;
  created_at: string;
};

type ProductRow = {
  id: string;
  vendor_id: string;
  vendor_name: string;
  store_name: string;
  vendor_status: VendorStatus;
  name: string;
  category: string;
  description: string;
  price: number | string;
  stock: number;
  image_url: string;
  created_at: string;
};

type ActivityRow = {
  id: string;
  vendor_id: string | null;
  actor_uid: string | null;
  actor: string;
  type: string;
  description: string;
  created_at: string;
};

function toVendor(profile: ProfileRow): MarketVendor {
  return {
    id: profile.id,
    fullName: profile.full_name,
    storeName: profile.store_name,
    email: profile.email,
    role: "vendor",
    status: profile.status,
    createdAt: profile.created_at,
  };
}

function toProduct(product: ProductRow): MarketProduct {
  return {
    id: product.id,
    vendorId: product.vendor_id,
    vendorName: product.vendor_name,
    storeName: product.store_name,
    vendorStatus: product.vendor_status,
    name: product.name,
    category: product.category,
    description: product.description,
    price: Number(product.price),
    stock: product.stock,
    image: product.image_url,
    createdAt: product.created_at,
  };
}

function toActivity(activity: ActivityRow): MarketActivity {
  return {
    id: activity.id,
    vendorId: activity.vendor_id ?? undefined,
    actorUid: activity.actor_uid ?? "",
    actor: activity.actor,
    type: activity.type,
    description: activity.description,
    createdAt: activity.created_at,
  };
}

async function isMarketplaceAdmin(userId: string) {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("marketplace_admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

async function getVendorProfile(vendorId: string) {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", vendorId)
    .eq("role", "vendor")
    .maybeSingle();
  if (error) throw error;
  return data ? toVendor(data as ProfileRow) : null;
}

async function emitAuthState(
  user: User | null,
  onChange: (vendor: MarketVendor | null, error?: string) => void
) {
  if (!user) {
    onChange(null);
    return;
  }

  try {
    onChange(await getVendorProfile(user.id));
  } catch (error) {
    onChange(
      null,
      error instanceof Error ? error.message : "Unable to load vendor profile."
    );
  }
}

export function getProductImageValidationError(file: File) {
  if (!SUPPORTED_PRODUCT_IMAGE_TYPES.includes(file.type as (typeof SUPPORTED_PRODUCT_IMAGE_TYPES)[number])) {
    return "Choose a JPG, PNG, or WebP image.";
  }
  if (file.size === 0 || file.size > MAX_PRODUCT_IMAGE_SIZE) {
    return "Choose an image smaller than 5 MB.";
  }
  return "";
}

export async function registerVendor(payload: {
  fullName: string;
  storeName: string;
  email: string;
  password: string;
}) {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.signUp({
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    options: {
      data: {
        full_name: payload.fullName.trim(),
        store_name: payload.storeName.trim(),
      },
    },
  });
  if (error) throw error;
  if (!data.user) throw new Error("Supabase did not return a new vendor account.");

  return { needsEmailConfirmation: !data.session };
}

export async function loginVendor(email: string, password: string) {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
  if (!data.user) throw new Error("Supabase did not return a signed-in user.");

  const vendor = await getVendorProfile(data.user.id);
  if (!vendor) {
    await client.auth.signOut();
    throw new Error("This account is not registered as a vendor.");
  }
  return vendor;
}

export async function loginMarketplaceAdmin(email: string, password: string) {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
  if (!data.user || !(await isMarketplaceAdmin(data.user.id))) {
    await client.auth.signOut();
    throw new Error("This account does not have marketplace owner access.");
  }
}

export function subscribeToVendorSession(
  onChange: (vendor: MarketVendor | null, error?: string) => void
) {
  let active = true;
  let profileChannel: RealtimeChannel | null = null;
  let client;
  try {
    client = getSupabaseClient();
  } catch (error) {
    onChange(
      null,
      error instanceof Error ? error.message : "Supabase is not configured."
    );
    return () => {
      active = false;
    };
  }
  const { data } = client.auth.onAuthStateChange((_event, session) => {
    if (profileChannel) {
      void client.removeChannel(profileChannel);
      profileChannel = null;
    }
    if (session?.user) {
      const user = session.user;
      profileChannel = client
        .channel(`vendor-profile-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${user.id}`,
          },
          () => void emitAuthState(user, onChange)
        )
        .subscribe();
    }
    queueMicrotask(() => {
      if (active) void emitAuthState(session?.user ?? null, onChange);
    });
  });

  return () => {
    active = false;
    data.subscription.unsubscribe();
    if (profileChannel) void client.removeChannel(profileChannel);
  };
}

export function subscribeToAdminSession(
  onChange: (isAdmin: boolean, error?: string) => void
) {
  let active = true;
  let client;
  try {
    client = getSupabaseClient();
  } catch (error) {
    onChange(
      false,
      error instanceof Error ? error.message : "Supabase is not configured."
    );
    return () => {
      active = false;
    };
  }
  const { data } = client.auth.onAuthStateChange((_event, session) => {
    queueMicrotask(() => {
      void (async () => {
        if (!active || !session?.user) {
          if (active) onChange(false);
          return;
        }
        try {
          onChange(await isMarketplaceAdmin(session.user.id));
        } catch (error) {
          onChange(
            false,
            error instanceof Error ? error.message : "Unable to verify owner access."
          );
        }
      })();
    });
  });

  return () => {
    active = false;
    data.subscription.unsubscribe();
  };
}

export async function logoutVendor() {
  const { error } = await getSupabaseClient().auth.signOut();
  if (error) throw error;
}

export async function getAllVendors() {
  const { data, error } = await getSupabaseClient()
    .from("profiles")
    .select("*")
    .eq("role", "vendor")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((profile) => toVendor(profile as ProfileRow));
}

export async function setVendorStatus(
  vendor: MarketVendor,
  status: VendorStatus
) {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  if (!data.user || !(await isMarketplaceAdmin(data.user.id))) {
    throw new Error("Only the marketplace owner can review vendors.");
  }

  const { error: reviewError } = await client.rpc("review_vendor", {
    p_vendor_id: vendor.id,
    p_status: status,
  });
  if (reviewError) throw reviewError;
}

export async function getAllProducts() {
  const { data, error } = await getSupabaseClient()
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((product) => toProduct(product as ProductRow));
}

export async function getAllProductsForAdmin() {
  return getAllProducts();
}

export async function getVendorProducts(vendorId: string) {
  const { data, error } = await getSupabaseClient()
    .from("products")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((product) => toProduct(product as ProductRow));
}

export async function addProductToVendor(
  vendor: MarketVendor,
  input: ProductInput
) {
  const client = getSupabaseClient();
  const { data: authData, error: authError } = await client.auth.getUser();
  if (authError) throw authError;
  if (!authData.user || authData.user.id !== vendor.id) {
    throw new Error("Sign in to this vendor account before publishing products.");
  }
  if (vendor.status !== "approved") {
    throw new Error("Your vendor account must be approved before publishing products.");
  }
  if (!input.imageFile) {
    throw new Error("Choose a product photo before publishing.");
  }

  const imageValidationError = getProductImageValidationError(input.imageFile);
  if (imageValidationError) throw new Error(imageValidationError);

  const extensionByType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const imagePath = `${vendor.id}/${crypto.randomUUID()}.${extensionByType[input.imageFile.type]}`;
  const storage = client.storage.from(PRODUCT_IMAGE_BUCKET);
  const { error: uploadError } = await storage.upload(imagePath, input.imageFile, {
    cacheControl: "31536000",
    contentType: input.imageFile.type,
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const imageUrl = storage.getPublicUrl(imagePath).data.publicUrl;
  const { data, error } = await client
    .from("products")
    .insert({
      vendor_id: vendor.id,
      vendor_name: vendor.fullName,
      store_name: vendor.storeName,
      vendor_status: "approved",
      name: input.name.trim(),
      category: input.category.trim(),
      description: input.description.trim(),
      price: Number(input.price),
      stock: Number(input.stock),
      image_url: imageUrl,
      image_path: imagePath,
    })
    .select("*")
    .single();

  if (error) {
    await storage.remove([imagePath]);
    throw error;
  }
  return toProduct(data as ProductRow);
}

export async function getAllActivityLogs() {
  const { data, error } = await getSupabaseClient()
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((activity) => toActivity(activity as ActivityRow));
}

export async function getVendorActivities(vendorId: string) {
  const { data, error } = await getSupabaseClient()
    .from("activity_logs")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((activity) => toActivity(activity as ActivityRow));
}
