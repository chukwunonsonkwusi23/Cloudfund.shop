This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:


## Marketplace Supabase Setup

The marketplace uses Supabase Auth, PostgreSQL, and Storage. The older food/blog routes still use the existing Firebase Realtime Database; the marketplace does not use Firebase Storage.

1. Create a Supabase project on the Free plan.
2. In the Supabase dashboard, open **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it. This creates the marketplace tables, row-level security policies, signup/activity triggers, and the public `product-images` bucket configuration.
3. Run the contents of `supabase/storage.sql` to create the public 5 MB `product-images` bucket and its Storage RLS policies.
4. In **Project Settings → API**, copy the Project URL and the publishable/anon key. Create `.env.local` in the project root using `.env.example` as a template:

	```env
	NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
	NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
	```

	These browser keys are intended to be public; access is restricted by database and Storage RLS. Never put a `service_role` key in a `NEXT_PUBLIC_` variable or client code.
5. In **Authentication → URL Configuration**, set the local Site URL to `http://localhost:3000` and allow that URL for email confirmation redirects. Enable email/password sign-in.
6. Create your owner account through Supabase Auth, then find its user UUID in **Authentication → Users**. In SQL Editor, replace the placeholder UUID and run:

	```sql
	delete from public.profiles where id = 'OWNER_AUTH_USER_UUID';
	insert into public.marketplace_admins (user_id)
	values ('OWNER_AUTH_USER_UUID');
	```

	The owner uses `/admin/login`; vendors use `/vendor/login`. The marketplace admin table is not writable through the public client, so only an SQL Editor/database administrator can grant owner access.
7. Restart the development server after creating `.env.local`. Register a vendor, sign in as the owner at `/admin/login`, approve the vendor at `/admin/monitoring`, and then upload a product photo from the vendor dashboard.

Supabase's Free plan currently includes 1 GB of file storage and 5 GB of egress. Free projects may pause after a week of inactivity; review [Supabase pricing](https://supabase.com/pricing) for current limits. The Firebase Auth/Realtime Database data used by the older legacy pages is not automatically migrated to Supabase.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
