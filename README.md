# Bangle Tracking Application

A full-stack web application for tracking bangle products through manufacturing steps. Built with Next.js 14, TypeScript, Prisma, and NextAuth.js.

## Features

- **Two User Roles**:
  - **Admin**: Can create, edit, delete products, and update product status
  - **User**: Can view products and track their status through manufacturing steps

- **Product Management**:
  - Add products with name and photo
  - Track products through 7 manufacturing steps
  - Search and filter products
  - View product history and timeline

- **Manufacturing Steps**:
  1. Raw Material
  2. Material Preparation
  3. Shaping
  4. Polishing
  5. Decoration
  6. Quality Check
  7. Finished Product

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **UI Components**: shadcn/ui (Radix UI)

## Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Git

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/bangle_tracking?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# Node Environment
NODE_ENV="development"
```

**Important**: 
- Replace `user`, `password`, and `bangle_tracking` with your PostgreSQL credentials
- Generate a secure `NEXTAUTH_SECRET` (you can use `openssl rand -base64 32`)

### 3. Set Up Database

```bash
# Push the Prisma schema to your database
npx prisma db push

# Seed the database with default manufacturing steps
npm run db:seed
```

### 4. Create Initial Users

Create your first admin user using the provided script:

```bash
npm run create-user admin@example.com your-password ADMIN "Admin Name"
```

Or create a regular user:

```bash
npm run create-user user@example.com your-password USER "User Name"
```

You can also use Prisma Studio to manage users:

```bash
npm run db:studio
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes (admin/user)
│   ├── api/              # API routes
│   └── layout.tsx        # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                   # Utility functions
├── prisma/               # Prisma schema and migrations
├── public/               # Static files
│   └── uploads/          # Product photos
└── types/                # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push Prisma schema to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:seed` - Seed database with default steps
- `npm run db:studio` - Open Prisma Studio
- `npm run create-user <email> <password> <role> [name]` - Create a new user (ADMIN or USER)

## Database Schema

- **User**: Stores user accounts (admin/user roles)
- **Product**: Stores product information and current step
- **Step**: Stores manufacturing step definitions
- **ProductHistory**: Audit trail of product status changes

## Authentication

The app uses NextAuth.js with credentials provider. Users authenticate with email and password. Passwords are hashed using bcryptjs.

## File Uploads

Product photos are stored in `/public/uploads/`. The upload API validates:
- File type (JPEG, PNG, WebP only)
- File size (max 5MB)

## Deployment

1. Set up a PostgreSQL database (e.g., on Vercel Postgres, Supabase, or Railway)
2. Update `DATABASE_URL` in your environment variables
3. Set `NEXTAUTH_URL` to your production URL
4. Generate a secure `NEXTAUTH_SECRET`
5. Deploy to Vercel, Netlify, or your preferred platform

## Notes

- The `public/uploads` directory should be created automatically on first upload
- Make sure to add `public/uploads` to your `.gitignore` if you don't want to commit uploaded files
- For production, consider using cloud storage (AWS S3, Cloudinary) instead of local file storage

## License

MIT

