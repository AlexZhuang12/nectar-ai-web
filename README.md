# Nectar AI — Global Web Workspace

A modern Next.js 15 App Router dashboard for key information extraction and dual-language alignment, powered by OpenRouter AI and Supabase.

## Features

- **Multilingual UI** — zh-TW, en-US, ja-JP, es-ES
- **Key Information Extractor** — AI-powered extraction from text or URLs
- **Dual-Language Alignment** — bilingual sentence/phrase alignment pairs
- **Credit System** — balance tracking with Pro upgrade modal (Stripe simulation)
- **Knowledge History** — persisted extraction records via Supabase

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local
# Edit .env.local with your Supabase and OpenRouter credentials

# Run Supabase schema (in Supabase SQL Editor)
# See supabase/schema.sql

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI extraction |
| `NEXT_PUBLIC_APP_URL` | App URL (optional, for OpenRouter referer) |

Without `OPENROUTER_API_KEY`, the app runs in demo mode with mock extraction results.

## Project Structure

```
app/
  actions/extract.ts   # Server Actions (AI + Supabase)
  page.tsx             # Dashboard page
  layout.tsx           # Root layout
components/
  Header.tsx           # Header with i18n + credits
  ExtractorPanel.tsx   # Core extraction UI
  ProUpgradeModal.tsx  # Stripe checkout simulation
  KnowledgeHistory.tsx # Supabase-synced history list
lib/
  supabase.ts          # Supabase client helpers
  i18n.ts              # UI translations
  types.ts             # Shared TypeScript types
```

## Tech Stack

- Next.js 15 (App Router)
- Tailwind CSS 3
- Lucide React + Font Awesome icons
- Supabase (PostgreSQL)
- OpenRouter API (GPT-4o-mini)
