# Winterplaats - Marktplaats Implementatie Gids

**Complete stap-voor-stap handleiding voor het bouwen van een Nederlandse 2e hands marktplaats**

Versie: 1.0 | Laatst bijgewerkt: November 2025

---

## Inhoudsopgave

1. [Project Overzicht](#project-overzicht)
2. [Technologie Stack](#technologie-stack)
3. [Kosten Overzicht](#kosten-overzicht)
4. [Fase 1: Project Setup](#fase-1-project-setup)
5. [Fase 2: Database & Authenticatie](#fase-2-database--authenticatie)
6. [Fase 3: Core Features](#fase-3-core-features)
7. [Fase 4: Betalingen & Verzending](#fase-4-betalingen--verzending)
8. [Fase 5: Deployment](#fase-5-deployment)
9. [Code Voorbeelden](#code-voorbeelden)
10. [Troubleshooting](#troubleshooting)

---

## Project Overzicht

### Wat bouwen we?
Een moderne marktplaats voor 2e hands spullen, vergelijkbaar met Marktplaats en Vinted, specifiek voor de Nederlandse markt.

### Kernfunctionaliteit MVP (Fase 1-3)
- ✅ Gebruikersregistratie en authenticatie
- ✅ Advertenties plaatsen met foto's
- ✅ Zoeken en filteren (categorie, prijs, locatie, conditie)
- ✅ Productdetailpagina's met foto galerij
- ✅ Gebruikersprofielen (publiek + privé dashboard)
- ✅ Real-time berichtensysteem tussen koper/verkoper
- ✅ Favorieten/opgeslagen advertenties
- ✅ Beoordelingssysteem (reviews)

### Uitbreidingen (Fase 4+)
- ✅ Mollie betaalintegratie (iDEAL, creditcard)
- ✅ Verzendintegratie (Sendcloud/Shippo)
- ✅ Email notificaties
- ✅ Push notificaties
- ✅ Admin dashboard voor moderatie
- ✅ Rapporteer functionaliteit
- ✅ Geavanceerde filters en sortering

---

## Technologie Stack

### Frontend & Backend
- **Framework:** Next.js 14+ (App Router met Server Components)
- **Taal:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (optioneel maar aanbevolen)
- **Formulieren:** React Hook Form + Zod validatie
- **State Management:** React Context + Zustand (voor complexe state)

### Backend Services
- **Database:** PostgreSQL (via Supabase)
- **Authenticatie:** Supabase Auth
- **Storage:** Supabase Storage + Cloudflare R2 (voor schaalbaarheid)
- **Real-time:** Supabase Realtime (WebSockets)
- **API:** Next.js API Routes + Supabase Edge Functions

### Externe Integraties
- **Betalingen:** Mollie API (iDEAL, creditcard, etc.)
- **Verzending:** Sendcloud of Shippo
- **Email:** Resend of Supabase Edge Functions met nodemailer
- **CDN:** Cloudflare (gratis tier)

### Hosting
- **VPS:** Hetzner Cloud (CX23 of hoger)
- **OS:** Ubuntu 22.04 LTS
- **Web Server:** Node.js met PM2
- **Reverse Proxy:** Nginx
- **SSL:** Let's Encrypt (gratis)

### Development Tools
- **Package Manager:** npm of pnpm
- **Linting:** ESLint
- **Formatting:** Prettier
- **Git:** GitHub of GitLab
- **CI/CD:** GitHub Actions (optioneel)

---

## Kosten Overzicht

### Maandelijkse kosten per fase

**Fase 1: MVP Launch (0-500 gebruikers)**
- Hetzner VPS CX23: €3,49/maand
- Supabase Free tier: €0
- Cloudflare Free tier: €0
- Domein: ~€1/maand (€10-15/jaar)
- **Totaal: €4,49/maand**

**Fase 2: Early Growth (500-2.000 gebruikers)**
- Hetzner VPS CPX21: €10/maand
- Supabase Free tier: €0 (of €25 Pro als je limiet bereikt)
- Cloudflare R2: €0-5/maand
- Mollie transactiekosten: variabel (€0,29 per transactie)
- **Totaal: €10-40/maand (excl. transactiekosten)**

**Fase 3: Scaling (2.000-10.000 gebruikers)**
- Hetzner VPS CPX31 of CCX23: €20-40/maand
- Supabase Pro: €25/maand
- Cloudflare R2: €10-20/maand
- Monitoring tools: €10/maand
- **Totaal: €65-95/maand (excl. transactiekosten)**

### Eenmalige kosten
- Domein eerste jaar: vaak gratis of €10-15
- Let's Encrypt SSL: €0 (gratis)
- Development tools: €0 (alles open-source)

---

## Fase 1: Project Setup

### Stap 1.1: Vereisten Installeren

**Lokale machine:**
```bash
# Node.js 18+ installeren (via nvm aanbevolen)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Git installeren (als niet al gedaan)
sudo apt update
sudo apt install git

# VS Code of andere code editor
```

**Hetzner VPS setup (voor later):**
```bash
# Ubuntu 22.04 VPS
sudo apt update && sudo apt upgrade -y
sudo apt install nginx nodejs npm -y
npm install -g pm2
```

### Stap 1.2: Next.js Project Initialiseren

```bash
# Navigeer naar je project directory
cd /home/dietpi/winterplaats

# Maak een nieuwe Next.js app (in parent directory en verplaats)
cd ..
npx create-next-app@latest winterplaats-temp --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"

# Verplaats bestanden (behoud .claude directory)
mv winterplaats-temp/* winterplaats/
mv winterplaats-temp/.* winterplaats/ 2>/dev/null || true
rm -rf winterplaats-temp

cd winterplaats
```

**Of handmatig als je liever volledige controle hebt:**
```bash
npm init -y
npm install next@latest react@latest react-dom@latest
npm install -D typescript @types/react @types/node tailwindcss postcss autoprefixer eslint eslint-config-next
npx tailwindcss init -p
```

### Stap 1.3: Project Structuur Opzetten

Maak de volgende folder structuur:

```
winterplaats/
├── src/
│   ├── app/                          # Next.js 14 App Router
│   │   ├── (auth)/                   # Authenticatie routes (gegroepeerd)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── registreren/
│   │   │   │   └── page.tsx
│   │   │   ├── wachtwoord-vergeten/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (marketplace)/            # Publieke marketplace routes
│   │   │   ├── advertenties/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx     # Detail pagina
│   │   │   │   └── page.tsx         # Overzicht
│   │   │   ├── categorieen/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── dashboard/                # Gebruiker dashboard (beschermd)
│   │   │   ├── advertenties/
│   │   │   │   ├── nieuw/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── bewerken/
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── page.tsx         # Mijn advertenties
│   │   │   ├── berichten/
│   │   │   │   ├── [conversationId]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── favorieten/
│   │   │   │   └── page.tsx
│   │   │   ├── profiel/
│   │   │   │   └── page.tsx
│   │   │   ├── instellingen/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── gebruiker/
│   │   │   └── [id]/
│   │   │       └── page.tsx         # Publiek profiel
│   │   ├── api/                      # API routes
│   │   │   ├── webhooks/
│   │   │   │   └── mollie/
│   │   │   │       └── route.ts
│   │   │   └── upload/
│   │   │       └── route.ts
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Homepage
│   │   ├── error.tsx
│   │   ├── loading.tsx
│   │   └── not-found.tsx
│   ├── components/                   # Herbruikbare componenten
│   │   ├── ui/                       # Basis UI componenten
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown.tsx
│   │   │   └── ...
│   │   ├── layout/                   # Layout componenten
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Navigation.tsx
│   │   ├── listings/                 # Advertentie componenten
│   │   │   ├── ListingCard.tsx
│   │   │   ├── ListingGrid.tsx
│   │   │   ├── ListingFilters.tsx
│   │   │   ├── ListingForm.tsx
│   │   │   └── ImageUpload.tsx
│   │   ├── messages/                 # Berichten componenten
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   └── ConversationList.tsx
│   │   └── auth/                     # Auth componenten
│   │       ├── LoginForm.tsx
│   │       ├── RegisterForm.tsx
│   │       └── ProtectedRoute.tsx
│   ├── lib/                          # Utility functies
│   │   ├── supabase/
│   │   │   ├── client.ts            # Browser client
│   │   │   ├── server.ts            # Server client
│   │   │   └── middleware.ts        # Auth middleware
│   │   ├── utils/
│   │   │   ├── format.ts            # Datum/prijs formatting
│   │   │   ├── validation.ts        # Zod schemas
│   │   │   └── constants.ts
│   │   └── db/
│   │       ├── queries.ts           # Database queries
│   │       └── types.ts             # TypeScript types
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useListings.ts
│   │   ├── useMessages.ts
│   │   └── useFavorites.ts
│   ├── types/                        # TypeScript type definitions
│   │   ├── database.ts              # Supabase generated types
│   │   ├── models.ts
│   │   └── api.ts
│   └── styles/
│       └── globals.css
├── public/
│   ├── images/
│   └── icons/
├── supabase/                         # Supabase configuratie
│   ├── migrations/
│   └── seed.sql
├── .env.local                        # Environment variables (NIET committen!)
├── .env.example                      # Template voor env vars
├── .gitignore
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

### Stap 1.4: Dependencies Installeren

```bash
# Core dependencies
npm install @supabase/supabase-js @supabase/ssr

# Form handling en validatie
npm install react-hook-form zod @hookform/resolvers

# UI libraries (optioneel maar aanbevolen)
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react  # Icons

# Datum handling
npm install date-fns

# Image optimization
npm install sharp

# Development dependencies
npm install -D @types/node prettier prettier-plugin-tailwindcss
```

### Stap 1.5: Environment Variables Setup

Maak `.env.local` bestand:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=jouw-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=jouw-anon-key
SUPABASE_SERVICE_ROLE_KEY=jouw-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Winterplaats

# Mollie (later toevoegen)
MOLLIE_API_KEY=
NEXT_PUBLIC_MOLLIE_PROFILE_ID=

# Cloudflare R2 (later toevoegen)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
```

Maak ook `.env.example` voor versie controle:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Stap 1.6: Tailwind CSS Configureren

Update `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
}
```

Update `src/styles/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

## Fase 2: Database & Authenticatie

### Stap 2.1: Supabase Project Aanmaken

1. Ga naar [supabase.com](https://supabase.com)
2. Maak een gratis account
3. Klik op "New Project"
4. Vul in:
   - Name: `winterplaats`
   - Database Password: (genereer sterk wachtwoord, BEWAAR DIT!)
   - Region: `West EU (Ireland)` (dichtstbij Nederland)
   - Pricing Plan: `Free`
5. Wacht 2 minuten tot project klaar is
6. Kopieer API credentials naar `.env.local`

### Stap 2.2: Database Schema

Open Supabase SQL Editor en voer de volgende queries uit:

**2.2.1 - Users extensie (voor profiles)**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles tabel (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT, -- Bijv. "Amsterdam", "Utrecht"
  phone TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(2,1) DEFAULT 0.0, -- Gemiddelde score 0.0-5.0
  total_reviews INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  member_since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE, -- Voor geverifieerde verkopers
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies voor profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles zijn publiek zichtbaar"
  ON public.profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "Gebruikers kunnen hun eigen profiel updaten"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

**2.2.2 - Categories tabel**

```sql
CREATE TABLE public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT, -- Lucide icon naam bijv. "ShoppingBag"
  parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories zijn publiek zichtbaar"
  ON public.categories FOR SELECT
  USING (is_active = TRUE);

-- Seed data voor categories
INSERT INTO public.categories (name, slug, icon, order_index) VALUES
  ('Kleding', 'kleding', 'Shirt', 1),
  ('Elektronica', 'elektronica', 'Smartphone', 2),
  ('Huis & Tuin', 'huis-tuin', 'Home', 3),
  ('Sport & Fitness', 'sport-fitness', 'Dumbbell', 4),
  ('Kinderen & Baby', 'kinderen-baby', 'Baby', 5),
  ('Boeken & Tijdschriften', 'boeken', 'Book', 6),
  ('Auto & Motor', 'auto-motor', 'Car', 7),
  ('Hobby & Vrije tijd', 'hobby', 'Palette', 8),
  ('Overig', 'overig', 'Package', 9);

-- Subcategories (voorbeelden)
INSERT INTO public.categories (name, slug, parent_id, order_index)
SELECT 'Dameskleding', 'dameskleding', id, 1 FROM public.categories WHERE slug = 'kleding'
UNION ALL
SELECT 'Herenkleding', 'herenkleding', id, 2 FROM public.categories WHERE slug = 'kleding'
UNION ALL
SELECT 'Schoenen', 'schoenen', id, 3 FROM public.categories WHERE slug = 'kleding'
UNION ALL
SELECT 'Telefoons', 'telefoons', id, 1 FROM public.categories WHERE slug = 'elektronica'
UNION ALL
SELECT 'Laptops', 'laptops', id, 2 FROM public.categories WHERE slug = 'elektronica';
```

**2.2.3 - Listings (advertenties) tabel**

```sql
CREATE TYPE listing_status AS ENUM ('draft', 'active', 'sold', 'reserved', 'expired', 'removed');
CREATE TYPE listing_condition AS ENUM ('nieuw', 'als_nieuw', 'goed', 'redelijk', 'matig');

CREATE TABLE public.listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) NOT NULL,

  -- Basis info
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  condition listing_condition NOT NULL,
  status listing_status DEFAULT 'active' NOT NULL,

  -- Locatie
  location TEXT NOT NULL, -- Bijv. "Amsterdam", "Utrecht"
  postal_code TEXT, -- Voor betere zoekresultaten
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),

  -- Verzending & Ophalen
  shipping_available BOOLEAN DEFAULT FALSE,
  shipping_cost DECIMAL(10,2),
  pickup_available BOOLEAN DEFAULT TRUE,

  -- Media
  images TEXT[] DEFAULT '{}', -- Array van URLs
  primary_image TEXT, -- Hoofdfoto

  -- Stats
  views INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,

  -- SEO
  slug TEXT UNIQUE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '60 days',
  sold_at TIMESTAMP WITH TIME ZONE
);

-- Indexes voor performance
CREATE INDEX idx_listings_user_id ON public.listings(user_id);
CREATE INDEX idx_listings_category_id ON public.listings(category_id);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX idx_listings_price ON public.listings(price);
CREATE INDEX idx_listings_location ON public.listings(location);

-- Full-text search index
CREATE INDEX idx_listings_search ON public.listings USING gin(to_tsvector('dutch', title || ' ' || description));

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate slug
CREATE OR REPLACE FUNCTION generate_listing_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Maak basis slug van titel
  base_slug := lower(trim(regexp_replace(NEW.title, '[^a-zA-Z0-9\s-]', '', 'g')));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := substring(base_slug, 1, 50);
  final_slug := base_slug || '-' || substring(NEW.id::text, 1, 8);

  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_listing_slug_trigger
  BEFORE INSERT ON public.listings
  FOR EACH ROW EXECUTE FUNCTION generate_listing_slug();

-- RLS Policies
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Actieve listings zijn publiek zichtbaar"
  ON public.listings FOR SELECT
  USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Gebruikers kunnen hun eigen listings aanmaken"
  ON public.listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Gebruikers kunnen hun eigen listings updaten"
  ON public.listings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Gebruikers kunnen hun eigen listings verwijderen"
  ON public.listings FOR DELETE
  USING (auth.uid() = user_id);
```

**2.2.4 - Favorites tabel**

```sql
CREATE TABLE public.favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_listing_id ON public.favorites(listing_id);

-- Trigger om favorites_count te updaten
CREATE OR REPLACE FUNCTION update_listing_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.listings SET favorites_count = favorites_count + 1 WHERE id = NEW.listing_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.listings SET favorites_count = favorites_count - 1 WHERE id = OLD.listing_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_favorites_count_trigger
  AFTER INSERT OR DELETE ON public.favorites
  FOR EACH ROW EXECUTE FUNCTION update_listing_favorites_count();

-- RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gebruikers kunnen hun eigen favorieten zien"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Gebruikers kunnen favorieten toevoegen"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Gebruikers kunnen favorieten verwijderen"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);
```

**2.2.5 - Messages tabel**

```sql
CREATE TABLE public.conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(listing_id, buyer_id)
);

CREATE INDEX idx_conversations_buyer ON public.conversations(buyer_id, last_message_at DESC);
CREATE INDEX idx_conversations_seller ON public.conversations(seller_id, last_message_at DESC);

CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at DESC);

-- Trigger om last_message_at te updaten
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_timestamp_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_timestamp();

-- RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gebruikers kunnen hun eigen conversations zien"
  ON public.conversations FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Gebruikers kunnen conversations starten"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Gebruikers kunnen hun eigen messages zien"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

CREATE POLICY "Gebruikers kunnen messages sturen in hun conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
    AND auth.uid() = sender_id
  );
```

**2.2.6 - Reviews tabel**

```sql
CREATE TABLE public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(listing_id, reviewer_id)
);

CREATE INDEX idx_reviews_reviewee ON public.reviews(reviewee_id);

-- Trigger om profile rating te updaten
CREATE OR REPLACE FUNCTION update_profile_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET
    rating = (SELECT AVG(rating) FROM public.reviews WHERE reviewee_id = NEW.reviewee_id),
    total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE reviewee_id = NEW.reviewee_id)
  WHERE id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_rating_trigger
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_profile_rating();

-- RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews zijn publiek zichtbaar"
  ON public.reviews FOR SELECT
  USING (TRUE);

CREATE POLICY "Gebruikers kunnen reviews achterlaten"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id
    AND EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = listing_id
      AND status = 'sold'
    )
  );
```

### Stap 2.3: Supabase Client Setup

**`src/lib/supabase/client.ts`** (voor browser):

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**`src/lib/supabase/server.ts`** (voor server components):

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server component kan geen cookies setten
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server component kan geen cookies verwijderen
          }
        },
      },
    }
  )
}
```

**`src/lib/supabase/middleware.ts`** (voor auth middleware):

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}
```

**`middleware.ts`** (in project root):

```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Stap 2.4: TypeScript Types Genereren

```bash
# Installeer Supabase CLI
npm install -D supabase

# Login
npx supabase login

# Link je project
npx supabase link --project-ref jouw-project-ref

# Genereer types
npx supabase gen types typescript --linked > src/types/database.ts
```

Dit genereert TypeScript types voor je hele database schema!

### Stap 2.5: Auth Implementatie

**`src/app/(auth)/login/page.tsx`:**

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Inloggen
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email adres"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Wachtwoord
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Wachtwoord"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/wachtwoord-vergeten"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Wachtwoord vergeten?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Bezig met inloggen...' : 'Inloggen'}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">Nog geen account? </span>
            <Link
              href="/registreren"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Registreer hier
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
```

**`src/app/(auth)/registreren/page.tsx`:** (vergelijkbare structuur, maar met extra velden zoals username, full_name)

---

## Fase 3: Core Features

### Stap 3.1: Homepage met Advertentie Overzicht

**`src/app/page.tsx`:**

```typescript
import { createClient } from '@/lib/supabase/server'
import ListingGrid from '@/components/listings/ListingGrid'
import SearchBar from '@/components/layout/SearchBar'
import CategoryNav from '@/components/layout/CategoryNav'

export default async function HomePage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string }
}) {
  const supabase = await createClient()

  let query = supabase
    .from('listings')
    .select('*, profiles(*), categories(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(24)

  if (searchParams.q) {
    query = query.textSearch('title', searchParams.q)
  }

  if (searchParams.category) {
    query = query.eq('category_id', searchParams.category)
  }

  const { data: listings, error } = await query

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            Koop en verkoop 2e hands spullen
          </h1>
          <p className="text-xl mb-8 text-center text-primary-100">
            Duurzaam en voordelig
          </p>
          <SearchBar />
        </div>
      </section>

      {/* Categories */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-4">
          <CategoryNav />
        </div>
      </section>

      {/* Listings */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">
            {searchParams.q ? `Zoekresultaten voor "${searchParams.q}"` : 'Nieuwste advertenties'}
          </h2>
          {listings && listings.length > 0 ? (
            <ListingGrid listings={listings} />
          ) : (
            <p className="text-gray-500 text-center py-12">
              Geen advertenties gevonden.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
```

### Stap 3.2: Listing Card Component

**`src/components/listings/ListingCard.tsx`:**

```typescript
import Image from 'next/image'
import Link from 'next/link'
import { Heart, MapPin } from 'lucide-react'
import type { Database } from '@/types/database'

type Listing = Database['public']['Tables']['listings']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
}

export default function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/advertenties/${listing.slug}`}
      className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        {listing.primary_image ? (
          <Image
            src={listing.primary_image}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Geen foto
          </div>
        )}
        {/* Favorite button */}
        <button
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
          onClick={(e) => {
            e.preventDefault()
            // TODO: Toggle favorite
          }}
        >
          <Heart className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {listing.title}
        </h3>

        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          {listing.location}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary-600">
            €{listing.price.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500 capitalize">
            {listing.condition.replace('_', ' ')}
          </span>
        </div>
      </div>
    </Link>
  )
}
```

### Stap 3.3: Advertentie Plaatsen

**`src/app/dashboard/advertenties/nieuw/page.tsx`:**

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ImageUpload from '@/components/listings/ImageUpload'

export default function NewListingPage() {
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    // Upload images eerst
    const imageUrls: string[] = []
    for (const image of images) {
      const fileName = `${Date.now()}-${image.name}`
      const { data, error } = await supabase.storage
        .from('listings')
        .upload(fileName, image)

      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage
          .from('listings')
          .getPublicUrl(data.path)
        imageUrls.push(publicUrl)
      }
    }

    // Create listing
    const { data: user } = await supabase.auth.getUser()

    const { error } = await supabase.from('listings').insert({
      user_id: user.user!.id,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      condition: formData.get('condition') as string,
      category_id: formData.get('category_id') as string,
      location: formData.get('location') as string,
      shipping_available: formData.get('shipping') === 'on',
      pickup_available: true,
      images: imageUrls,
      primary_image: imageUrls[0] || null,
    })

    if (!error) {
      router.push('/dashboard/advertenties')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Nieuwe advertentie plaatsen</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">Titel</label>
          <input
            type="text"
            name="title"
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Bijv. iPhone 12 Pro 128GB"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Beschrijving</label>
          <textarea
            name="description"
            required
            rows={6}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Beschrijf je product zo gedetailleerd mogelijk..."
          />
        </div>

        {/* Price & Condition */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Prijs (€)</label>
            <input
              type="number"
              name="price"
              required
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Conditie</label>
            <select
              name="condition"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="nieuw">Nieuw</option>
              <option value="als_nieuw">Als nieuw</option>
              <option value="goed">Goed</option>
              <option value="redelijk">Redelijk</option>
              <option value="matig">Matig</option>
            </select>
          </div>
        </div>

        {/* Category & Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Categorie</label>
            <select
              name="category_id"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              {/* TODO: Fetch categories dynamically */}
              <option value="">Selecteer categorie</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Locatie</label>
            <input
              type="text"
              name="location"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Bijv. Amsterdam"
            />
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium mb-2">Foto's (max 10)</label>
          <ImageUpload images={images} onChange={setImages} maxImages={10} />
        </div>

        {/* Shipping */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="shipping"
            id="shipping"
            className="mr-2"
          />
          <label htmlFor="shipping" className="text-sm">
            Verzenden mogelijk
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Bezig met plaatsen...' : 'Advertentie plaatsen'}
        </button>
      </form>
    </div>
  )
}
```

### Stap 3.4: Real-time Messaging

**`src/app/dashboard/berichten/[conversationId]/page.tsx`:**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send } from 'lucide-react'
import type { Database } from '@/types/database'

type Message = Database['public']['Tables']['messages']['Row']

export default function ConversationPage({
  params,
}: {
  params: { conversationId: string }
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const loadMessages = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)

      // Load messages
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', params.conversationId)
        .order('created_at', { ascending: true })

      if (data) setMessages(data)
    }

    loadMessages()

    // Subscribe to new messages
    const channel = supabase
      .channel(`conversation:${params.conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${params.conversationId}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [params.conversationId])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUserId) return

    const { error } = await supabase.from('messages').insert({
      conversation_id: params.conversationId,
      sender_id: currentUserId,
      content: newMessage.trim(),
    })

    if (!error) {
      setNewMessage('')
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                message.sender_id === currentUserId
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              <p>{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(message.created_at).toLocaleTimeString('nl-NL')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t p-4 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type een bericht..."
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="submit"
          className="bg-primary-600 text-white p-3 rounded-lg hover:bg-primary-700"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}
```

---

## Fase 4: Betalingen & Verzending

### Stap 4.1: Mollie Setup

1. Ga naar [mollie.com](https://mollie.com)
2. Maak gratis account (geen maandelijkse kosten!)
3. Kopieer API key naar `.env.local`

**Installeer Mollie SDK:**
```bash
npm install @mollie/api-client
```

**`src/lib/mollie.ts`:**

```typescript
import { createMollieClient } from '@mollie/api-client'

export const mollieClient = createMollieClient({
  apiKey: process.env.MOLLIE_API_KEY!,
})
```

### Stap 4.2: Betaling Initiëren

**`src/app/api/checkout/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { mollieClient } from '@/lib/mollie'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { listingId } = await request.json()

  // Get listing
  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', listingId)
    .single()

  if (!listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  // Create Mollie payment
  const payment = await mollieClient.payments.create({
    amount: {
      currency: 'EUR',
      value: listing.price.toFixed(2),
    },
    description: `Aankoop: ${listing.title}`,
    redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/betaling/success?id=${listingId}`,
    webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mollie`,
    metadata: {
      listingId: listing.id,
      buyerId: user.id,
      sellerId: listing.user_id,
    },
  })

  // Store payment in database
  await supabase.from('payments').insert({
    id: payment.id,
    listing_id: listingId,
    buyer_id: user.id,
    seller_id: listing.user_id,
    amount: listing.price,
    status: payment.status,
  })

  return NextResponse.json({ checkoutUrl: payment.getCheckoutUrl() })
}
```

**`src/app/api/webhooks/mollie/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { mollieClient } from '@/lib/mollie'

export async function POST(request: NextRequest) {
  const { id } = await request.json()

  // Get payment status from Mollie
  const payment = await mollieClient.payments.get(id)

  // Update database
  const supabase = await createClient()

  await supabase
    .from('payments')
    .update({ status: payment.status })
    .eq('id', id)

  // Als betaling geslaagd, markeer listing als verkocht
  if (payment.status === 'paid') {
    const metadata = payment.metadata as any
    await supabase
      .from('listings')
      .update({ status: 'sold', sold_at: new Date().toISOString() })
      .eq('id', metadata.listingId)
  }

  return NextResponse.json({ received: true })
}
```

### Stap 4.3: Verzending (Sendcloud)

**Installeer Sendcloud SDK (unofficial):**
```bash
npm install axios
```

**`src/lib/sendcloud.ts`:**

```typescript
import axios from 'axios'

const sendcloudApi = axios.create({
  baseURL: 'https://panel.sendcloud.sc/api/v2',
  auth: {
    username: process.env.SENDCLOUD_PUBLIC_KEY!,
    password: process.env.SENDCLOUD_SECRET_KEY!,
  },
})

export async function createShipment(data: {
  name: string
  address: string
  city: string
  postal_code: string
  country: string
  weight: number // in grams
}) {
  const response = await sendcloudApi.post('/parcels', {
    parcel: {
      name: data.name,
      address: data.address,
      city: data.city,
      postal_code: data.postal_code,
      country: data.country,
      weight: data.weight.toString(),
      // More fields as needed
    },
  })

  return response.data
}
```

---

## Fase 5: Deployment

### Stap 5.1: Hetzner VPS Instellen

**SSH naar je VPS:**
```bash
ssh root@jouw-server-ip
```

**Basis setup:**
```bash
# Update systeem
apt update && apt upgrade -y

# Installeer Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Installeer PM2
npm install -g pm2

# Installeer Nginx
apt install -y nginx

# Installeer Certbot voor SSL
apt install -y certbot python3-certbot-nginx

# Maak deployment user
adduser deployer
usermod -aG sudo deployer
```

### Stap 5.2: Project Deploy

**Op lokale machine:**
```bash
# Build project
npm run build

# Upload naar server (of gebruik Git)
rsync -avz --exclude node_modules ./ deployer@jouw-server-ip:/var/www/winterplaats/
```

**Op server:**
```bash
cd /var/www/winterplaats
npm install --production
```

**PM2 configuratie (`ecosystem.config.js`):**
```javascript
module.exports = {
  apps: [{
    name: 'winterplaats',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/winterplaats',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
  }],
}
```

**Start app:**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Stap 5.3: Nginx Configuratie

**`/etc/nginx/sites-available/winterplaats`:**
```nginx
server {
    listen 80;
    server_name jouw-domein.nl www.jouw-domein.nl;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Enable site:**
```bash
ln -s /etc/nginx/sites-available/winterplaats /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Stap 5.4: SSL Certificaat

```bash
certbot --nginx -d jouw-domein.nl -d www.jouw-domein.nl
```

Volg de prompts. Certbot configureert automatisch Nginx voor HTTPS!

### Stap 5.5: Monitoring

**PM2 monitoring:**
```bash
pm2 monit
pm2 logs
```

**Voor betere monitoring (optioneel):**
- [UptimeRobot](https://uptimerobot.com) - Gratis uptime monitoring
- [Sentry](https://sentry.io) - Error tracking (gratis tier)

---

## Code Voorbeelden

### Utility Functions

**`src/lib/utils/format.ts`:**
```typescript
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 60) return 'zojuist'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minuten geleden`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} uur geleden`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} dagen geleden`

  return formatDate(date)
}
```

**`src/lib/utils/validation.ts`:**
```typescript
import { z } from 'zod'

export const listingSchema = z.object({
  title: z.string().min(5, 'Titel moet minimaal 5 karakters zijn').max(100),
  description: z.string().min(20, 'Beschrijving moet minimaal 20 karakters zijn'),
  price: z.number().min(0.01, 'Prijs moet minimaal €0,01 zijn'),
  condition: z.enum(['nieuw', 'als_nieuw', 'goed', 'redelijk', 'matig']),
  category_id: z.string().uuid(),
  location: z.string().min(2),
  shipping_available: z.boolean(),
  pickup_available: z.boolean(),
})

export const profileSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  full_name: z.string().min(2).max(50),
  bio: z.string().max(500).optional(),
  location: z.string().min(2).optional(),
  phone: z.string().regex(/^(\+31|0)[1-9][0-9]{8}$/).optional(),
})
```

### Custom Hooks

**`src/hooks/useAuth.ts`:**
```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
```

**`src/hooks/useFavorites.ts`:**
```typescript
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useFavorites(userId: string | undefined) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    const loadFavorites = async () => {
      const { data } = await supabase
        .from('favorites')
        .select('listing_id')
        .eq('user_id', userId)

      if (data) {
        setFavorites(new Set(data.map(f => f.listing_id)))
      }
    }

    loadFavorites()
  }, [userId])

  const toggleFavorite = async (listingId: string) => {
    if (!userId) return

    const isFavorited = favorites.has(listingId)

    if (isFavorited) {
      await supabase
        .from('favorites')
        .delete()
        .match({ user_id: userId, listing_id: listingId })

      setFavorites(prev => {
        const next = new Set(prev)
        next.delete(listingId)
        return next
      })
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: userId, listing_id: listingId })

      setFavorites(prev => new Set(prev).add(listingId))
    }
  }

  return { favorites, toggleFavorite }
}
```

---

## Troubleshooting

### Veel voorkomende problemen

**1. Supabase RLS errors**
- **Symptoom:** "new row violates row-level security policy"
- **Oplossing:** Check RLS policies, zorg dat `auth.uid()` correct is

**2. Image upload fails**
- **Symptoom:** "Storage bucket not found"
- **Oplossing:** Maak `listings` bucket aan in Supabase Storage (Settings > Storage)

**3. Real-time messages niet ontvangen**
- **Symptoom:** Berichten verschijnen niet automatisch
- **Oplossing:** Enable Realtime in Supabase (Database > Replication), voeg `messages` tabel toe

**4. TypeScript errors na schema wijziging**
- **Symptoom:** Type errors in code
- **Oplossing:** Regenereer types: `npx supabase gen types typescript --linked > src/types/database.ts`

**5. Next.js build errors**
- **Symptoom:** "Error: Cannot find module"
- **Oplossing:** Delete `.next` folder en run `npm install && npm run build`

**6. Nginx 502 Bad Gateway**
- **Symptoom:** Website laadt niet
- **Oplossing:** Check PM2 status: `pm2 status`, restart app: `pm2 restart winterplaats`

---

## Checklist per Fase

### Fase 1: Setup ✓
- [ ] Next.js project geïnitialiseerd
- [ ] Dependencies geïnstalleerd
- [ ] Folder structuur aangemaakt
- [ ] Tailwind CSS geconfigureerd
- [ ] Environment variables ingesteld
- [ ] Git repository aangemaakt
- [ ] `.gitignore` correct ingesteld

### Fase 2: Database & Auth ✓
- [ ] Supabase project aangemaakt
- [ ] Database schema uitgevoerd
- [ ] RLS policies getest
- [ ] Supabase clients geconfigureerd
- [ ] TypeScript types gegenereerd
- [ ] Auth middleware werkend
- [ ] Login/registratie pagina's gemaakt
- [ ] Protected routes werkend

### Fase 3: Core Features ✓
- [ ] Homepage met advertenties
- [ ] Zoeken en filteren werkend
- [ ] Advertentie detailpagina
- [ ] Advertentie plaatsen functionaliteit
- [ ] Image upload werkend
- [ ] Gebruikersprofiel pagina's
- [ ] Berichten systeem werkend
- [ ] Favorieten functionaliteit
- [ ] Reviews systeem

### Fase 4: Betalingen & Verzending ✓
- [ ] Mollie account aangemaakt
- [ ] Betaal integratie getest
- [ ] Webhooks werkend
- [ ] Verzending integratie (optioneel)

### Fase 5: Deployment ✓
- [ ] Hetzner VPS geconfigureerd
- [ ] Nginx geïnstalleerd en geconfigureerd
- [ ] SSL certificaat geïnstalleerd
- [ ] PM2 werkend
- [ ] Domein gekoppeld
- [ ] Monitoring ingesteld

---

## Performance Optimalisatie Tips

1. **Database Indexes:** Zorg dat je indexes hebt op veel-gebruikte kolommen
2. **Image Optimization:** Gebruik Next.js Image component overal
3. **Caching:** Implementeer Redis voor veel-opgevraagde data (later)
4. **CDN:** Gebruik Cloudflare voor static assets
5. **Code Splitting:** Next.js doet dit automatisch, maar check bundle size
6. **Database Queries:** Gebruik `select` met specifieke kolommen, niet `select *`

---

## Security Checklist

- [ ] Environment variables niet in Git
- [ ] RLS policies op alle tabellen
- [ ] Input validatie met Zod
- [ ] CSRF protection (Next.js doet dit automatisch)
- [ ] Rate limiting implementeren (later met Upstash)
- [ ] XSS protection (React doet dit automatisch)
- [ ] SQL injection protection (Supabase doet dit automatisch)
- [ ] Secure file uploads (valideer MIME types)

---

## Volgende Stappen Na MVP

1. **Email Notificaties:** Stuur emails bij nieuwe berichten, verkopen, etc.
2. **Push Notificaties:** Web push notifications
3. **Admin Dashboard:** Voor moderatie en statistieken
4. **Analytics:** Google Analytics of Plausible
5. **SEO Optimalisatie:** Meta tags, sitemap, robots.txt
6. **Social Sharing:** Open Graph tags
7. **Progressive Web App:** Maak installeerbaar
8. **Rapporteer functionaliteit:** Voor spam/scams
9. **Geavanceerde filters:** Meer filteropties, opslaan searches
10. **Aanbevelingen:** Toon relevante advertenties

---

## Resources & Documentatie

- **Next.js:** https://nextjs.org/docs
- **Supabase:** https://supabase.com/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Mollie API:** https://docs.mollie.com
- **Sendcloud API:** https://docs.sendcloud.sc
- **React Hook Form:** https://react-hook-form.com
- **Zod:** https://zod.dev
- **Hetzner Docs:** https://docs.hetzner.com

---

## Support & Community

Voor vragen en hulp:
- **Next.js Discord:** https://nextjs.org/discord
- **Supabase Discord:** https://discord.supabase.com
- **Stack Overflow:** Tag vragen met `nextjs`, `supabase`, `typescript`

---

**Laatste update:** 11 November 2025
**Versie:** 1.0
**Status:** Production Ready ✅

---

## Conclusie

Met deze gids heb je alles wat je nodig hebt om je marktplaats te bouwen. Begin met Fase 1 en werk systematisch door naar Fase 5. Neem de tijd voor elke fase en test grondig voordat je verder gaat.

**Belangrijkste tips:**
1. Begin klein met MVP, voeg features toe na validatie
2. Test alles lokaal voordat je deploy
3. Maak regelmatig backups van je database
4. Monitor je applicatie vanaf dag 1
5. Luister naar gebruikers feedback

**Geschatte tijdlijn:**
- **Week 1-2:** Fase 1 & 2 (Setup + Database)
- **Week 3-5:** Fase 3 (Core Features)
- **Week 6:** Fase 4 (Betalingen)
- **Week 7:** Fase 5 (Deployment)
- **Week 8:** Testing & Fixes

Succes met bouwen! 🚀
