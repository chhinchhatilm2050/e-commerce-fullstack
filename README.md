# ChhatStore — Full-Stack E-Commerce

[![CI Pipeline](https://github.com/chhinchhatilm2050/e-commerce-fullstack/actions/workflows/ci.yml/badge.svg)](https://github.com/chhinchhatilm2050/e-commerce-fullstack/actions/workflows/ci.yml)

ChhatStore is a full-stack e-commerce application with a Vue storefront and an administrative dashboard, backed by a REST API and MongoDB.

## Features

### Storefront

- Browse products by category, search products, and view product details.
- Manage a shopping cart and wishlist.
- Create an account, sign in, verify an email address, and reset a password.
- Sign in with Google, GitHub, or Facebook.
- Manage a customer profile and saved address.
- Check out using cash on delivery (COD) or ABA PayWay.
- View orders, order details, and order status.
- Submit and manage product reviews.

### Security

- Apply rate limits to login (5 attempts per 15 minutes), registration (5 attempts per 15 minutes), email verification (5 attempts per minute), and password-reset/code-verification endpoints (5 attempts per 2 minutes) to reduce abuse and repeated code attempts.
- Sanitize request input with `sanitize-html`, removing HTML tags and attributes as a defense-in-depth measure against XSS.
- Use Helmet, MongoDB query sanitization, and HTTP parameter pollution protection as additional request-security measures.
- Protect API routes with authentication and role-based authorization.

These measures contribute to mitigating risks covered by the OWASP Top 10; they are not a claim of OWASP compliance or complete protection against every vulnerability.

### Administration

- Review dashboard analytics and sales charts.
- Manage products, images, stock, and product status.
- Manage categories and category hierarchy.
- Review orders and update their status.
- Manage users and account statuses.

## Technology

- **Frontend:** Vue 3, TypeScript, Vite, Pinia, Vue Router, Tailwind CSS
- **Backend:** Node.js, Express 5, TypeScript, Mongoose
- **Database:** MongoDB
- **Integrations:** Cloudinary for image uploads, Resend for email, ABA PayWay for online payments, and Passport OAuth strategies

## Requirements

- Node.js `^20.19.0` or `>=22.12.0`
- npm
- A MongoDB database
- Credentials for any third-party services you want to enable

## Getting Started

The frontend and backend are separate npm applications. Run their commands from their respective directories.

### 1. Install dependencies

```sh
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure environment variables

Create `backend/.env.dev`. The backend loads this file when it starts.

```dotenv
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

MONGO_DB=
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRE_IN=
JWT_REFRESH_EXPIRE_IN=

# Email verification and password reset
RESEND_API_KEY=
MAIL_FROM=

# Image uploads
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_ROOT_FOLDER=

# Optional social sign-in providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
FACEBOOK_CALLBACK_URL=

# ABA PayWay
PAYWAY_MERCHANT_ID=
PAYWAY_API_KEY=
PAYWAY_BASE_URL=https://checkout-sandbox.payway.com.kh

# Used by the seed:admin script
ADMIN_FIRST_NAME=
ADMIN_LAST_NAME=
ADMIN_PHONE=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

Set the secrets and service-specific values in your local environment file; do not commit them. Social sign-in, email, image uploads, and payment processing require their corresponding provider credentials.

Create `frontend/.env.local` if the API is not running at the default URL:

```dotenv
VITE_BACKEND_URL=http://localhost:3000/api
```

The frontend defaults to `http://localhost:3000/api` when `VITE_BACKEND_URL` is not set.

### 3. Start the backend

```sh
cd backend
npm run dev
```

The API is served under `/api` (by default, `http://localhost:3000/api`).

### 4. Start the frontend

In another terminal:

```sh
cd frontend
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Useful Commands

### Frontend

```sh
npm run dev          # Start the Vite development server
npm run build        # Type-check and create a production build
npm run type-check   # Run Vue/TypeScript type checks
npm run lint         # Run ESLint
```

### Backend

```sh
npm run dev          # Start the API in development mode
npm run build        # Compile TypeScript
npm start            # Run the compiled API
npm run lint         # Run ESLint
npm run seed:admin   # Create the configured admin account
npm run seed         # Seed sample products and categories
npm run seed:users   # Seed sample users
npm run seed:clean   # Clean seeded products
```

Run the seed commands from `backend/` after configuring the database and any required seed environment variables.

## Project Structure

```text
backend/
  src/
    config/        # Database and service configuration
    controllers/   # API request handlers
    middlewares/   # Authentication, authorization, and request middleware
    model/         # Mongoose models
    routes/        # REST API routes
    scripts/       # Database seed and cleanup scripts
    validators/    # Request validation
frontend/
  src/
    components/    # Reusable UI components
    layouts/       # Application layouts
    router/        # Vue Router configuration
    stores/        # Pinia stores
    views/         # Storefront, account, checkout, and admin pages
```

## Notes

- Most API routes require authentication; administrative operations additionally require an admin account.
- The backend uses MongoDB database name `e-commerce-fullstack`.
- Configure OAuth callback URLs with the matching provider settings and local/deployed backend URLs.
- The backend test script is currently a placeholder; no automated backend test suite is configured by that script.
