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


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Memories gallery setup

The `/memories` page reads public entries from the Firestore `memories` collection and uploads image files directly to Cloudinary with an unsigned preset. Configure these variables in the local development environment and production host:

- Firebase client configuration: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, and `NEXT_PUBLIC_FIREBASE_APP_ID`.
- Cloudinary: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.

In Firebase Console, create or enable a **Cloud Firestore** database. From the project root, select the Firebase project with the Firebase CLI, then deploy only the included gallery rules:

```sh
firebase use <firebase-project-id>
firebase deploy --only firestore:rules
```

Each new `memories` document stores the Cloudinary image metadata (`url`, `publicId`, `width`, `height`, `bytes`, `format`, and server `createdAt`), an optional `title`, and a required lowercase `category` (`hackathons`, `friends`, `family`, or `events`). The rules allow anyone to read gallery entries and create entries only when their fields, Cloudinary image URL, dimensions, format, category, optional title, byte count (at most 10 MiB), and server timestamp match the gallery schema. Older entries without a category remain visible as Uncategorized. Direct client updates and deletes remain denied. Because this project uses Next.js static export, saved photo editing and deletion are not available; enabling them safely requires a separate authenticated server-side mutation service. Do not enable public Firestore updates or deletes.

In Cloudinary Console, create an upload preset under **Settings → Upload → Upload presets**. Set its signing mode to **Unsigned**, allow only `jpg`, `jpeg`, `png`, `webp`, `gif`, and `avif`, and set the preset's maximum original file size to **10 MiB (10,485,760 bytes)**. Keep overwriting disabled and use a generated public ID. Set the two Cloudinary environment variables above to the account cloud name and this preset name. The page also rejects unsupported MIME types and files larger than 10 MiB in the browser; the preset limit is required because client-side checks can be bypassed.
