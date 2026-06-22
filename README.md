This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel (Moeen Platform Specifics)

To deploy this project on Vercel, you need to configure the following environment variables in your Vercel Project Settings:

1.  **DATABASE_URL**: Your PostgreSQL connection string (e.g., from Supabase or Vercel Postgres).
2.  **JWT_SECRET**: A long, secure random string for JWT session signing.

### Steps to Deploy:
1.  Push your code to GitHub.
2.  Import the project in Vercel.
3.  Add the environment variables mentioned above.
4.  The build command is automatically set to `prisma generate && next build` via `package.json`.
5.  Ensure your database is accessible from Vercel.

### Important Note on Avatars:
The current avatar upload system writes to the local filesystem (`public/uploads/avatars`), which is **not supported** on Vercel's serverless functions. For production, you should use an external storage service like **Supabase Storage** or **AWS S3**.


The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
