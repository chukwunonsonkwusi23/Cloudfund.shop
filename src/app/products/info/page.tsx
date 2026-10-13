"use server";

import { get, ref } from "firebase/database";
import ProductClientContent from "../../../../components/ProductClientContent";
import { database } from "../../../../firebase";

export async function generateMetadata({ searchParams }: any) {
  try {
    return get(ref(database, `product/${searchParams?.slug}`)).then((res) => {
      return {
        title: res.val()?.title,
        description: res.val()?.description,
        openGraph: {
          title: res.val()?.title,

          description: res.val()?.description,
          images: [
            {
              url: res.val()?.img,
              width: 800,
              height: 600,
              alt: "OG Image Alt",
            },
          ],
        },
        icons: {
          icon: res.val()?.img,
        },
      };
    });
  } catch (error) {
    return {
      title: "Error",
      description: "An error occurred while fetching the blogs.",
      openGraph: {
        title: "Error",
        description: "An error occurred while fetching the blogs.",
        images: [],
      },
      icons: {
        icon: "/app/favicon.ico",
      },
    };
  }
}
export default async function Page({
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  try {
    const snapshot = await get(
      ref(database, `product/${searchParams?.slug}`)
    );
    const product = snapshot.val();

    if (!product) {
      return (
        <main className="flex min-h-[60vh] items-center justify-center px-6 text-center">
          <div>
            <h1 className="text-2xl font-semibold text-[#203c35]">Product not found</h1>
            <p className="mt-2 text-neutral-600">This product may have been removed or is no longer available.</p>
          </div>
        </main>
      );
    }

    return <ProductClientContent data={product} />;
  } catch (error) {
    console.error("Unable to load product details:", error);
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold text-[#203c35]">We could not load this product</h1>
          <p className="mt-2 text-neutral-600">Please try again in a moment.</p>
        </div>
      </main>
    );
  }
}
