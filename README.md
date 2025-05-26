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

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```
eatery
├─ @types
├─ app
│  ├─ (checkout)
│  │  ├─ checkout
│  │  │  └─ page.tsx
│  │  └─ layout.tsx
│  ├─ (root)
│  │  ├─ @modal
│  │  │  ├─ (.)product
│  │  │  │  └─ [id]
│  │  │  │     └─ page.tsx
│  │  │  ├─ default.tsx
│  │  │  └─ [...catchAll]
│  │  │     └─ page.tsx
│  │  ├─ about
│  │  │  └─ page.tsx
│  │  ├─ bonus
│  │  │  └─ page.tsx
│  │  ├─ checkout-empty
│  │  │  └─ page.tsx
│  │  ├─ delivery
│  │  │  └─ page.tsx
│  │  ├─ feedback
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ not-auth
│  │  │  └─ page.tsx
│  │  ├─ page.tsx
│  │  ├─ privacy
│  │  │  └─ page.tsx
│  │  ├─ product
│  │  │  └─ [id]
│  │  │     └─ page.tsx
│  │  ├─ profile
│  │  │  ├─ data
│  │  │  │  └─ page.tsx
│  │  │  └─ page.tsx
│  │  └─ reset-password
│  │     └─ page.tsx
│  ├─ actions.ts
│  ├─ admin
│  │  ├─ (dashboard)
│  │  │  ├─ categories
│  │  │  │  └─ page.tsx
│  │  │  ├─ feedbacks
│  │  │  │  └─ page.tsx
│  │  │  ├─ layout.tsx
│  │  │  ├─ orders
│  │  │  │  ├─ create
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ [id]
│  │  │  │     └─ page.tsx
│  │  │  ├─ products
│  │  │  │  └─ page.tsx
│  │  │  └─ users
│  │  │     └─ page.tsx
│  │  ├─ components
│  │  │  ├─ admin-container.tsx
│  │  │  ├─ bonus-options.tsx
│  │  │  ├─ date-time-picker.tsx
│  │  │  ├─ order-summary.tsx
│  │  │  ├─ product-selector-edit.tsx
│  │  │  ├─ product-selector.tsx
│  │  │  └─ user-select.tsx
│  │  └─ lib
│  │     └─ functions.ts
│  ├─ api
│  │  ├─ admin
│  │  │  ├─ categories
│  │  │  │  ├─ route.ts
│  │  │  │  └─ [id]
│  │  │  │     └─ route.ts
│  │  │  ├─ feedbacks
│  │  │  │  └─ [id]
│  │  │  │     └─ route.ts
│  │  │  ├─ orders
│  │  │  │  ├─ route.ts
│  │  │  │  └─ [id]
│  │  │  │     └─ route.ts
│  │  │  ├─ products
│  │  │  │  ├─ route.ts
│  │  │  │  ├─ stock
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ [id]
│  │  │  │     └─ route.ts
│  │  │  └─ users
│  │  │     ├─ route.ts
│  │  │     └─ [id]
│  │  │        └─ route.ts
│  │  ├─ auth
│  │  │  ├─ me
│  │  │  │  └─ route.ts
│  │  │  ├─ reset-password
│  │  │  │  ├─ confirm
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ route.ts
│  │  │  ├─ verify
│  │  │  │  └─ route.ts
│  │  │  └─ [...nextauth]
│  │  │     └─ route.ts
│  │  ├─ cart
│  │  │  ├─ merge
│  │  │  │  └─ route.ts
│  │  │  ├─ repeat
│  │  │  │  └─ route.ts
│  │  │  ├─ route.ts
│  │  │  └─ [id]
│  │  │     └─ route.ts
│  │  ├─ checkout
│  │  │  └─ callback
│  │  │     └─ route.ts
│  │  ├─ feedbacks
│  │  │  └─ route.ts
│  │  ├─ products
│  │  │  └─ [id]
│  │  │     └─ route.ts
│  │  └─ yandex
│  │     └─ yandex-suggest
│  │        └─ route.ts
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ providers
│     └─ react-query.tsx
├─ components.json
├─ eslint.config.mjs
├─ hooks
│  ├─ index.ts
│  ├─ use-breakpoints.ts
│  ├─ use-cart.ts
│  └─ use-scroll-direction.ts
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ prisma
│  ├─ migrations
│  ├─ prisma-client.ts
│  ├─ schema.prisma
│  └─ seed.ts
├─ public
│  ├─ assets
│  │  └─ images
│  │     ├─ empty-box.png
│  │     ├─ lock.png
│  │     ├─ not-found.png
│  │     └─ phone-icon.png
│  ├─ dashboard.png
│  ├─ geo
│  │  └─ delivery-zones.geojson
│  ├─ images
│  │  ├─ content
│  │  │  ├─ cafe1.jpg
│  │  │  ├─ cafe2.jpg
│  │  │  └─ cafe3.jpg
│  ├─ logo.png
│  └─ logobig.png
├─ shared
│  ├─ components
│  │  ├─ buttons
│  │  ├─ cart
│  │  ├─ checkout
│  │  ├─ email-templates
│  │  ├─ form
│  │  ├─ index.ts
│  │  ├─ main-components
│  │  ├─ modals
│  │  ├─ product-menu
│  │  ├─ profile
│  │  ├─ service-components
│  │  └─ ui
│  ├─ constants
│  ├─ lib
│  ├─ schemas
│  │  ├─ authSchemas.ts
│  │  ├─ checkout-form-schema.ts
│  │  ├─ feedback.ts
│  │  ├─ order-form-schema.ts
│  │  └─ reset-password.ts
│  ├─ services
│  │  ├─ api-clients.ts
│  │  ├─ auth.ts
│  │  ├─ cart.ts
│  │  ├─ categories.ts
│  │  ├─ dto
│  │  │  └─ cart.dto.ts
│  │  ├─ feedbacks.ts
│  │  ├─ instance.ts
│  │  ├─ orders.ts
│  │  ├─ products.ts
│  │  ├─ reset-password.ts
│  │  └─ users.ts
│  └─ store
│     ├─ cart.ts
│     ├─ category.ts
│     └─ index.ts
├─ tailwind.config.ts
└─ tsconfig.json

```