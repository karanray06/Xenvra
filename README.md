<div align="center">

<img src="public/logos/xenvra-icon.png" alt="Xenvra" width="80" />

# Xenvra

**AI-Powered Resume Builder**

Build professional, ATS-friendly resumes in minutes — not hours.

[![Live Demo](https://img.shields.io/badge/Live-xenvra.kareixo.me-F97316?style=for-the-badge)](https://xenvra.kareixo.me)
[![Next.js](https://img.shields.io/badge/Next.js-16-000?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3FCF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)

</div>

---

## ✨ Features

- **Split-Pane Editor** — Forms on the left, live A4 preview on the right. What you type is what you get.
- **Multiple Templates** — Modern, Minimalist, ATS-Optimized, Professional, and more. Switch with one click.
- **Autosave** — Every change is debounced and saved to the cloud automatically. Never lose work.
- **PDF Export** — Download a pixel-perfect PDF of your resume, ready to submit.
- **Real Authentication** — Sign in with Google OAuth or email magic links via Supabase Auth.
- **Row-Level Security** — Your data is yours. Every database query is scoped to your user ID.

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 |
| **Auth & DB** | Supabase (PostgreSQL + Auth + RLS) |
| **Hosting** | Vercel |
| **Icons** | Lucide React |
| **Validation** | Zod |

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── login/page.tsx              # Auth (Google + Magic Link)
│   ├── dashboard/
│   │   ├── page.tsx                # Resume list
│   │   ├── builder/page.tsx        # Resume editor
│   │   ├── templates/page.tsx      # Template gallery
│   │   └── settings/page.tsx       # Account settings
│   ├── terms/page.tsx              # Terms of Service
│   ├── privacy/page.tsx            # Privacy Policy
│   └── refund/page.tsx             # Refund Policy
├── components/
│   ├── builder/
│   │   ├── resume-provider.tsx     # State management + autosave
│   │   ├── resume-form.tsx         # Editor form sections
│   │   ├── resume-preview.tsx      # Live A4 preview
│   │   ├── builder-toolbar.tsx     # Title, template picker, PDF
│   │   └── builder-client.tsx      # Split-pane layout
│   ├── templates/
│   │   ├── registry.ts             # Template metadata + registry
│   │   ├── template-renderer.tsx   # Template ID → component mapper
│   │   ├── modern-1.tsx            # Modern Classic (two-column)
│   │   ├── minimal-1.tsx           # Minimalist (centered)
│   │   └── ats-1.tsx               # ATS Optimized (plain text)
│   └── dashboard/
│       └── dashboard-shell.tsx     # Dashboard layout wrapper
└── lib/
    ├── schemas/resume.ts           # Zod schemas + types
    ├── supabase/
    │   ├── client.ts               # Browser Supabase client
    │   ├── server.ts               # Server Supabase client
    │   └── middleware.ts           # Session refresh logic
    └── types/index.ts              # Shared TypeScript types
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- (Optional) Google OAuth credentials for social login

### 1. Clone & Install

```bash
git clone https://github.com/karanray06/Xenvra.git
cd Xenvra
npm install
```

### 2. Environment Variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Database Setup

Run the migration in your Supabase SQL Editor:

```bash
# Copy the contents of this file into Supabase → SQL Editor → Run
supabase/migrations/001_initial_schema.sql
```

This creates all tables (`profiles`, `resumes`, `entitlements`, `payments`) with Row-Level Security policies.

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### 5. Build for Production

```bash
npm run build
```

## 🔐 Authentication Setup

### Email Magic Links
Works out of the box with Supabase. Users enter their email and receive a sign-in link.

### Google OAuth
1. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Add `https://your-project.supabase.co/auth/v1/callback` as an authorized redirect URI
3. Enable Google provider in Supabase → Authentication → Providers

## 📄 Resume Templates

| Template | Style | Free |
|----------|-------|------|
| **Modern Classic** | Two-column with colored sidebar | ✅ |
| **Minimalist** | Centered, elegant typography | ✅ |
| **ATS Optimized** | Plain text, maximum parsability | ✅ |
| **Executive** | Traditional corporate layout | 🔒 Pro |
| **Gradient Edge** | Bold gradients, modern spacing | 🔒 Pro |

## 🌐 Deployment

This project is designed for **Vercel**:

1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Add the environment variables in Vercel → Settings → Environment Variables
3. Deploy — Vercel auto-builds on every push to `main`

For custom domain setup (e.g. `xenvra.kareixo.me`):
- Add a CNAME record pointing to `cname.vercel-dns.com`
- Add the domain in Vercel → Settings → Domains

## 📜 Legal

- [Terms of Service](/terms)
- [Privacy Policy](/privacy)
- [Refund Policy](/refund)

## 📬 Contact

For questions or support: **support@kareixo.me**

---

<div align="center">
  <sub>Built with ☕ by <a href="https://github.com/karanray06">karanray06</a></sub>
</div>
