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
│  ├─ feedback.d.ts
│  ├─ global.d.ts
│  ├─ next-auth.d.ts
│  ├─ orders.d.ts
│  ├─ prisma.ts
│  ├─ product-types.ts
│  ├─ user.d.ts
│  ├─ yandex.d.ts
│  └─ yookassa.ts
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
│  │  ├─ 20250306083453_first_migration
│  │  │  └─ migration.sql
│  │  ├─ 20250312073156_full_bd_1
│  │  │  └─ migration.sql
│  │  ├─ 20250312091513_is_available
│  │  │  └─ migration.sql
│  │  ├─ 20250312170342_cart_complete13_03
│  │  │  └─ migration.sql
│  │  ├─ 20250319094147_json_withuut
│  │  │  └─ migration.sql
│  │  ├─ 20250321102153_verified
│  │  │  └─ migration.sql
│  │  ├─ 20250323113336_changed_order
│  │  │  └─ migration.sql
│  │  ├─ 20250328092329_bonus
│  │  │  └─ migration.sql
│  │  ├─ 20250328120009_delivery
│  │  │  └─ migration.sql
│  │  ├─ 20250328124147_payment_method
│  │  │  └─ migration.sql
│  │  ├─ 20250328133841_ready
│  │  │  └─ migration.sql
│  │  ├─ 20250330135323_stock_quantity
│  │  │  └─ migration.sql
│  │  ├─ 20250331173128_add_feedback_model
│  │  │  └─ migration.sql
│  │  ├─ 20250401111943_full_name_to_name
│  │  │  └─ migration.sql
│  │  ├─ 20250401115113_delete_total_amount
│  │  │  └─ migration.sql
│  │  ├─ 20250401154639_order_items
│  │  │  └─ migration.sql
│  │  ├─ 20250402071123_order_user_id
│  │  │  └─ migration.sql
│  │  ├─ 20250402082319_token_unique
│  │  │  └─ migration.sql
│  │  ├─ 20250402185311_providor_id_unique
│  │  │  └─ migration.sql
│  │  ├─ 20250402213112_delete_google
│  │  │  └─ migration.sql
│  │  ├─ 20250403092912_add_google
│  │  │  └─ migration.sql
│  │  ├─ 20250403130306_add_user_phone
│  │  │  └─ migration.sql
│  │  ├─ 20250406125410_cascade
│  │  │  └─ migration.sql
│  │  ├─ 20250406130402_map_delete
│  │  │  └─ migration.sql
│  │  ├─ 20250408071227_order_item_product
│  │  │  └─ migration.sql
│  │  ├─ 20250410110743_token_added
│  │  │  └─ migration.sql
│  │  ├─ 20250410135015_delete_cascade
│  │  │  └─ migration.sql
│  │  ├─ 20250411113812_password_reset_token
│  │  │  └─ migration.sql
│  │  ├─ 20250411141342_super_admin
│  │  │  └─ migration.sql
│  │  ├─ 20250416171928_varchar
│  │  │  └─ migration.sql
│  │  ├─ 20250416184702_varchar2
│  │  │  └─ migration.sql
│  │  └─ migration_lock.toml
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
│  │  └─ items
│  │     ├─ 1
│  │     │  └─ product-1.jpg
│  │     ├─ 10
│  │     │  └─ product-10.jpg
│  │     ├─ 11
│  │     │  └─ product-11.jpg
│  │     ├─ 12
│  │     │  └─ product-12.jpg
│  │     ├─ 13
│  │     │  └─ product-13.jpg
│  │     ├─ 14
│  │     │  └─ product-14.jpg
│  │     ├─ 15
│  │     │  └─ product-15.jpg
│  │     ├─ 16
│  │     │  └─ product-16.jpg
│  │     ├─ 17
│  │     │  └─ product-17.jpg
│  │     ├─ 18
│  │     │  └─ product-18.jpg
│  │     ├─ 19
│  │     │  └─ product-19.jpg
│  │     ├─ 2
│  │     │  └─ product-2.jpg
│  │     ├─ 20
│  │     │  └─ product-20.jpg
│  │     ├─ 21
│  │     │  └─ product-21.jpg
│  │     ├─ 22
│  │     │  └─ product-22.jpg
│  │     ├─ 23
│  │     │  └─ product-23.jpg
│  │     ├─ 24
│  │     │  └─ product-24.jpg
│  │     ├─ 25
│  │     │  └─ product-25.jpg
│  │     ├─ 26
│  │     │  └─ product-26.jpg
│  │     ├─ 27
│  │     │  └─ product-27.jpg
│  │     ├─ 28
│  │     │  └─ product-28.jpg
│  │     ├─ 29
│  │     │  └─ product-29.jpg
│  │     ├─ 3
│  │     │  └─ product-3.jpg
│  │     ├─ 30
│  │     │  └─ product-30.jpg
│  │     ├─ 31
│  │     │  └─ product-31.jpg
│  │     ├─ 32
│  │     │  └─ product-32.jpg
│  │     ├─ 33
│  │     │  └─ product-33.jpg
│  │     ├─ 34
│  │     │  └─ product-34.jpg
│  │     ├─ 35
│  │     │  └─ product-35.jpg
│  │     ├─ 4
│  │     │  └─ product-4.jpg
│  │     ├─ 5
│  │     │  └─ product-5.jpg
│  │     ├─ 6
│  │     │  └─ product-6.jpg
│  │     ├─ 7
│  │     │  └─ product-7.jpg
│  │     ├─ 8
│  │     │  └─ product-8.jpg
│  │     └─ 9
│  │        └─ product-9.jpg
│  ├─ logo.png
│  └─ logobig.png
├─ README.md
├─ shared
│  ├─ components
│  │  ├─ buttons
│  │  │  ├─ cart-button.tsx
│  │  │  ├─ clear-button.tsx
│  │  │  ├─ count-button-product.tsx
│  │  │  ├─ count-button.tsx
│  │  │  ├─ count-icon-button.tsx
│  │  │  ├─ index.ts
│  │  │  └─ profile-button.tsx
│  │  ├─ cart
│  │  │  ├─ cart-drawer-item.tsx
│  │  │  ├─ cart-drawer.tsx
│  │  │  ├─ cart-item-details
│  │  │  │  ├─ cart-item-details-image.tsx
│  │  │  │  ├─ cart-item-details-price.tsx
│  │  │  │  ├─ cart-item-details.types.ts
│  │  │  │  ├─ cart-item-info.tsx
│  │  │  │  └─ index.ts
│  │  │  └─ index.ts
│  │  ├─ checkout
│  │  │  ├─ address-checkout.tsx
│  │  │  ├─ bonus-options.tsx
│  │  │  ├─ checkout-address-form.tsx
│  │  │  ├─ checkout-cart.tsx
│  │  │  ├─ checkout-item-details.tsx
│  │  │  ├─ checkout-item-skeleton.tsx
│  │  │  ├─ checkout-item.tsx
│  │  │  ├─ checkout-personal-form.tsx
│  │  │  ├─ delivery-map.tsx
│  │  │  ├─ delivery-time-picker.tsx
│  │  │  ├─ index.ts
│  │  │  ├─ payment-method-options.tsx
│  │  │  └─ phone-input.tsx
│  │  ├─ email-templates
│  │  │  ├─ choose-and-send-email.tsx
│  │  │  ├─ email-order-template.tsx
│  │  │  ├─ index.ts
│  │  │  ├─ order-created.tsx
│  │  │  ├─ order-success.tsx
│  │  │  ├─ pay-order.tsx
│  │  │  ├─ reset-password.tsx
│  │  │  └─ verification-user.tsx
│  │  ├─ form
│  │  │  ├─ form-address.tsx
│  │  │  ├─ form-input.tsx
│  │  │  ├─ form-select.tsx
│  │  │  ├─ form-textarea.tsx
│  │  │  ├─ index.ts
│  │  │  └─ reset-password.tsx
│  │  ├─ index.ts
│  │  ├─ main-components
│  │  │  ├─ container.tsx
│  │  │  ├─ floating-checkout.tsx
│  │  │  ├─ footer.tsx
│  │  │  ├─ gray-block.tsx
│  │  │  ├─ header.tsx
│  │  │  ├─ index.ts
│  │  │  ├─ mobile-dashboard-menu.tsx
│  │  │  ├─ mobile-menu.tsx
│  │  │  ├─ title.tsx
│  │  │  ├─ top-bar.tsx
│  │  │  └─ white-block.tsx
│  │  ├─ modals
│  │  │  ├─ auth-modal
│  │  │  │  ├─ auth-modal.tsx
│  │  │  │  ├─ forms
│  │  │  │  │  ├─ forgot-password-form.tsx
│  │  │  │  │  ├─ login-form.tsx
│  │  │  │  │  └─ register-form.tsx
│  │  │  │  └─ index.ts
│  │  │  ├─ index.tsx
│  │  │  └─ see-product-modal.tsx
│  │  ├─ product-menu
│  │  │  ├─ categories.tsx
│  │  │  ├─ index.ts
│  │  │  ├─ product-card.tsx
│  │  │  ├─ product-view.tsx
│  │  │  ├─ products-group-list.tsx
│  │  │  └─ see-product-form.tsx
│  │  ├─ profile
│  │  │  ├─ index.ts
│  │  │  ├─ my-orders.tsx
│  │  │  ├─ profile-form.tsx
│  │  │  └─ profile-layout.tsx
│  │  ├─ service-components
│  │  │  ├─ cart-merger.tsx
│  │  │  ├─ error-text.tsx
│  │  │  ├─ index.ts
│  │  │  ├─ info-block.tsx
│  │  │  ├─ providers.tsx
│  │  │  ├─ required-symbol.tsx
│  │  │  ├─ verify-toast-handler.tsx
│  │  │  └─ yandex-suggest-loader.tsx
│  │  └─ ui
│  │     ├─ button.tsx
│  │     ├─ card.tsx
│  │     ├─ carousel.tsx
│  │     ├─ dialog.tsx
│  │     ├─ drawer.tsx
│  │     ├─ index.ts
│  │     ├─ input.tsx
│  │     ├─ popover.tsx
│  │     ├─ select.tsx
│  │     ├─ sheet.tsx
│  │     ├─ skeleton.tsx
│  │     ├─ slider.tsx
│  │     └─ textarea.tsx
│  ├─ constants
│  │  ├─ auth-options.ts
│  │  ├─ global-constants.ts
│  │  └─ index.ts
│  ├─ lib
│  │  ├─ calc-cart-item-total-price.ts
│  │  ├─ calc-time.ts
│  │  ├─ create-payment.ts
│  │  ├─ find-or-create-cart.ts
│  │  ├─ get-cart-details.ts
│  │  ├─ get-user-session.ts
│  │  ├─ index.ts
│  │  ├─ send-email.ts
│  │  └─ utils.ts
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