# Zenn — E-commerce Store

A full-stack online store built with **Next.js 15 (App Router)**, **Prisma** and **PostgreSQL**. Customers can browse products with colour and size options, keep a bag that follows them across devices, check out with **Paystack** or pay on delivery, and track their orders. Admins run the store from a dashboard with sales charts, product and category management, order and customer views, and an activity log.

Prices are in Nigerian Naira (₦).

---

## Features

### Storefront
- **Product catalogue** with categories, featured products, a new-arrivals page and recently added items.
- **Product variants**: colour and size options, each with its own price and stock, and per-colour image galleries.
- **Discounts**: a percentage discount per product, shown as a sale price throughout the store.
- **Search and filters**: search by name or description, filter by category and price range (filters are kept in the URL, so results can be shared).
- **Light and dark mode**, responsive layout, and loading skeletons.

### Bag (cart)
- Works for guests (identified by a secure, HTTP-only cookie) and for signed-in users (stored against the account, so it is available on any device).
- **Guest bag is merged into the account** when the user signs in. Matching items have their quantities added together, capped at available stock.
- Add, increase, decrease and remove items. Items stay in the order they were added.
- **Prices are always calculated on the server** from the database (variant or product price, minus any discount), never taken from the browser. Totals are recalculated after every change.
- Stock is checked per variant and against the total quantity already in the bag.
- Delivery: ₦1,000, free on orders over ₦500,000.

### Checkout and payments
- **Paystack** online payments, or **pay on delivery**.
- The server builds each order from the signed-in user's bag and re-prices it at checkout. Customers only submit their contact and delivery details.
- Each order stores the price actually paid per item.
- Payments are confirmed two ways, both handled by the same code so an order is only processed once:
  - when the customer returns from Paystack (`/checkout/complete`), and
  - through a **signed Paystack webhook** (`/api/paystack/webhook`).
- A payment is only accepted if the amount and currency match the order total.
- On payment: the order is marked paid, stock is taken, the bag is cleared and a **receipt email** is sent.
- Pay-on-delivery orders take stock in a single database transaction and are rejected if an item has just sold out.

### Accounts and authentication (Auth.js v5)
- Email and password sign-up with **email verification**, plus **Sign in with Google**.
- **Password reset** by email: single-use, hashed tokens that expire after 15 minutes, with request limits.
- Changing a password signs out the account's other sessions.
- After signing in, users are returned to the page they came from (for example, checkout).
- Roles: `USER`, `ADMIN`, `SUPER_ADMIN`.

### Customer account area
- **Profile**: name, address and avatar upload.
- **Security**: change password.
- **Orders**: order history with separate **payment** and **delivery** status badges, and an order details page showing items, subtotal, delivery and total.

### Admin dashboard (`/admin`)
- **Overview**: total sales, orders, customers and products, a 12-month revenue chart, top products and recent sales.
- **Products**: create and edit products with images, variants (colour, size, price, stock) and discounts. Products are **archived, never deleted**: archiving hides a product from the store (and blocks it at checkout) while keeping it for past orders and records, and it can be restored at any time.
- **Categories**: create and edit categories with cover images and assigned products.
- **Homepage banners**: manage the hero slides (image, headline, text, button label and link), set their order, show or hide them, and schedule start and end dates. The homepage falls back to built-in slides when none are live.
- **Orders**: all orders in a paginated table.
- **Customers**: customer list and per-customer details, order history and account management.
- **Activity log**: a record of admin changes (what changed, by whom and when).
- **Settings**: store details and shipping settings.
- Every admin page and admin server action checks for an admin session on the server.

### Emails (Nodemailer)
- Email verification, welcome email, password reset and password-changed notices, payment receipts, and a new-user notification to admins.

---

## Tech stack

| Area | Tools |
|---|---|
| Framework | Next.js 15 (App Router, Server Components, Server Actions), React 19, TypeScript |
| Database | PostgreSQL on [Neon](https://neon.tech), Prisma ORM 6 (Neon serverless adapter) |
| Auth | Auth.js (NextAuth v5): credentials and Google, JWT sessions, Prisma adapter |
| Payments | Paystack (transaction initialise, verify and webhook) |
| Media | Cloudinary (image uploads), `next/image` |
| UI | Tailwind CSS 4, shadcn/ui (Radix UI), Lucide icons, Motion, Sonner toasts, next-themes |
| Forms and validation | React Hook Form, Zod |
| Tables and charts | TanStack Table, Recharts |
| Email | Nodemailer (SMTP, for example Gmail with an app password) |

---

## Getting started

### Prerequisites
- Node.js 20 or later, and npm
- A PostgreSQL database (a free [Neon](https://neon.tech) project works)
- A [Paystack](https://paystack.com) account (test keys are fine for development)
- A [Cloudinary](https://cloudinary.com) account
- A Google OAuth client, for "Sign in with Google"
- An SMTP account for sending email (for example Gmail with an [app password](https://support.google.com/accounts/answer/185833))

### 1. Install

```bash
git clone https://github.com/nemesisvoid/zenn-ecommerce.git
cd zenn-ecommerce
npm install        # also runs `prisma generate`
```

### 2. Configure environment variables

Create a `.env` file in the project root. It is git-ignored; never commit it.

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Base URL of the app, for example `http://localhost:3000`. Used in email links and the Paystack callback. |
| `DATABASE_URL` | PostgreSQL connection string (include `sslmode=require` for Neon). |
| `AUTH_SECRET` | Secret for signing sessions. Generate one with `npx auth secret`. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials. Local redirect URI: `http://localhost:3000/api/auth/callback/google` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name. |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Upload preset for the image upload widget. |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_VARIANTS` | Upload preset for variant images. |
| `EMAIL_HOST` / `EMAIL_PORT` | SMTP server, for example `smtp.gmail.com` and `465`. |
| `EMAIL_USER` / `EMAIL_PASSWORD` | SMTP login (for Gmail, use an app password). |
| `EMAIL_FROM` | Sender address shown on outgoing emails. |
| `PAYSTACK_SECRET_KEY` | Paystack secret key (`sk_test_…` for development). |

**Cloudinary presets.** Besides the two presets above, the code uploads with these preset names, so create them in Cloudinary (Settings → Upload → Upload presets) as **unsigned** presets: `product-images`, `category-images` and `user-avatar`.

### 3. Set up the database

```bash
npx prisma db push          # create the tables from prisma/schema.prisma
```

The store starts empty. Add categories and products from the admin dashboard once you have an admin account (next steps).

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Make yourself an admin

No admin account is created automatically. Register and verify an account, then change its role:

```bash
npx prisma studio
```

Open the `User` table, set your user's `role` to `ADMIN`, save, then sign out and back in. The dashboard is at `/admin/dashboard`.

### 6. Paystack webhook

In the Paystack dashboard (Settings → API Keys & Webhooks), set the webhook URL to:

```
https://<your-domain>/api/paystack/webhook
```

The webhook is optional for local development, because payments are also confirmed when the customer returns to `/checkout/complete`. To test the webhook locally, expose your dev server with a tunnel such as [ngrok](https://ngrok.com) and use that URL.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server. |
| `npm run build` | Generate the Prisma client and build for production. |
| `npm start` | Run the production build. |
| `npm run lint` | Run ESLint. |
| `npm run test:password-reset` | Run the password reset tests. |
| `npx tsc --noEmit` | Type-check the project. |

---

## Project structure

```
app/
  (root)/            Storefront: home, product list, product, search, cart, checkout, orders, account area
  (admin)/admin/     Admin dashboard: products, categories, orders, users, activity, settings
  (auth)/auth/       Login, register, verify email, forgot and reset password
  api/
    auth/            Auth.js handlers and the email-verification link
    paystack/        Paystack webhook
actions/             Server Actions (cart, orders, payments, products, users, categories, settings…)
lib/
  cart.ts            Server-side pricing, cart totals, stock and guest-cart merging
  payments.ts        Shared Paystack payment handling (checkout return and webhook)
  auth-guards.ts     Session and admin checks for server actions
  prisma.ts          Prisma client (Neon adapter)
components/          UI components (storefront, admin, auth, shadcn/ui)
prisma/              Database schema
schemas/             Zod validation schemas
helper/              Formatting, email sending and email templates
auth.ts, auth.config.ts, middleware.ts, routes.ts   Authentication and route protection
```

---

## Roadmap

These are in the database or the interface but not finished yet:

- **Wishlist**: the account page is placeholder UI.
- **Product reviews**: the data model exists; there is no customer-facing review form yet.
- **Shipping settings**: the admin shipping fee and free-shipping threshold aren't applied yet (delivery is a fixed ₦1,000, free over ₦500,000).
- **Maintenance mode**: can be saved in settings but isn't enforced.
- **Login rate limiting.**
