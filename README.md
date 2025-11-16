# Henlo

A modern Dutch second-hand marketplace platform for buying and selling items, built with Next.js, TypeScript, and Supabase.

## Features

- **User Authentication**: Secure registration, login, and password recovery
- **Listing Management**: Create, edit, and manage product listings with images
- **Real-time Messaging**: Chat with buyers and sellers in real-time
- **Favorites System**: Save and bookmark listings
- **Reviews & Ratings**: Rate and review transactions
- **Payment Integration**: Secure payments via Mollie (iDEAL, credit cards)
- **Advanced Search**: Filter by category, price, location, and condition
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **User Dashboard**: Manage listings, messages, favorites, and profile

## Tech Stack

### Frontend
- **Next.js 14+** - React framework with App Router
- **TypeScript 5** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Hook Form + Zod** - Form handling and validation
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications

### Backend
- **Supabase** - PostgreSQL database, authentication, and storage
- **Next.js API Routes** - Serverless API endpoints
- **Mollie** - Payment processing

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **Git** for version control

You'll also need accounts for:
- [Supabase](https://supabase.com) - Free tier available
- [Mollie](https://www.mollie.com) - Payment processing (test mode available)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Mattyonemillion/henlo.git
cd henlo
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Mollie Payment Gateway
MOLLIE_API_KEY=your_mollie_api_key
```

#### How to Get Supabase Credentials:
1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Project Settings** → **API**
3. Copy the **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
4. Copy the **anon public** key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
5. Copy the **service_role** key (SUPABASE_SERVICE_ROLE_KEY) - **Keep this secret!**

#### How to Get Mollie API Key:
1. Sign up at [mollie.com](https://www.mollie.com)
2. Go to **Developers** → **API keys**
3. Copy the **Test API key** for development
4. Use **Live API key** for production

### 4. Set Up the Database

Run the database schema from the `IMPLEMENTATIE_GIDS.md` file in your Supabase SQL Editor:

1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Run the database schema scripts from the implementation guide
4. Enable Row Level Security (RLS) policies

See [DATABASE.md](./docs/DATABASE.md) for detailed schema documentation.

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
henlo/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (marketplace)/     # Public marketplace pages
│   │   ├── dashboard/         # User dashboard
│   │   ├── gebruiker/         # User profiles
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── auth/              # Auth components
│   │   ├── checkout/          # Payment components
│   │   ├── layout/            # Header, Footer, Navigation
│   │   ├── listings/          # Listing components
│   │   ├── messages/          # Messaging components
│   │   ├── reviews/           # Review components
│   │   ├── skeletons/         # Loading states
│   │   └── ui/                # Reusable UI components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   │   ├── supabase/         # Supabase clients
│   │   ├── utils/            # Helper functions
│   │   └── mollie.ts         # Mollie integration
│   └── types/                # TypeScript types
├── public/                    # Static assets
├── .env.example              # Environment variables template
├── middleware.ts             # Authentication middleware
└── next.config.mjs          # Next.js configuration
```

## Available Scripts

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production-ready application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality

## Key Features Documentation

### Authentication
- Email/password authentication via Supabase Auth
- Protected routes using Next.js middleware
- Automatic session management
- Password recovery flow

### Listings
- Create listings with up to 8 images (5MB max per image)
- Multiple categories and conditions
- Price management with EUR currency
- Location-based listings with postal code validation
- Shipping and pickup options
- Draft, active, sold, reserved, expired, and removed states

### Messaging
- Real-time messaging using Supabase Realtime
- Conversation threads between buyers and sellers
- Unread message notifications
- Message history and search

### Payments
- Mollie payment gateway integration
- Support for iDEAL, credit cards, and other payment methods
- Webhook handling for payment status updates
- Automatic listing status updates on successful payment

### Search & Filtering
- Full-text search across listings
- Filter by category, price range, condition, location
- Sort by date (newest/oldest) or price (low/high)
- Responsive filter UI for mobile and desktop

## Deployment

### Recommended Hosting: Hetzner Cloud VPS

#### Prerequisites
- Ubuntu 22.04 LTS server
- Domain name with DNS configured
- SSH access to server

#### Deployment Steps

1. **Set Up Server Environment**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

2. **Clone and Build Application**

```bash
# Clone repository
git clone https://github.com/Mattyonemillion/henlo.git
cd henlo

# Install dependencies
npm install

# Create production environment file
cp .env.example .env.local
# Edit .env.local with production values

# Build application
npm run build
```

3. **Configure PM2**

```bash
# Start application with PM2
pm2 start npm --name "henlo" -- start

# Set up PM2 to start on system boot
pm2 startup
pm2 save
```

4. **Configure Nginx**

Create `/etc/nginx/sites-available/henlo`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

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

Enable site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/henlo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

5. **Set Up SSL Certificate**

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

6. **Configure Supabase for Production**

- Update **Authentication** → **URL Configuration** with your domain
- Add your domain to **Redirect URLs**
- Update **NEXT_PUBLIC_APP_URL** in `.env.local`

7. **Configure Mollie for Production**

- Switch from test API key to live API key
- Configure webhook URL: `https://your-domain.com/api/webhooks/mollie`
- Test payment flow in production

#### Deployment Checklist

- [ ] Environment variables configured with production values
- [ ] Database migrations applied
- [ ] RLS policies enabled and tested
- [ ] SSL certificate installed and auto-renewal configured
- [ ] PM2 configured to restart on server reboot
- [ ] Nginx reverse proxy configured
- [ ] Supabase authentication URLs updated
- [ ] Mollie webhook URL configured
- [ ] Domain DNS configured correctly
- [ ] Application tested in production
- [ ] Monitoring and logging set up (PM2 logs)

### Alternative Deployment Options

#### Vercel (Easiest)
1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy automatically

**Note**: Vercel's free tier may have limitations for production use.

#### Docker (Advanced)
See deployment guide for Docker containerization instructions.

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | Yes | `eyJhbGc...` |
| `NEXT_PUBLIC_APP_URL` | Application base URL | Yes | `http://localhost:3000` |
| `MOLLIE_API_KEY` | Mollie payment API key | Yes | `test_xxxxx` or `live_xxxxx` |

## Security Considerations

- **Never commit** `.env.local` or `.env` files to version control
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret - it bypasses RLS
- Use Mollie test keys during development
- Enable Row Level Security (RLS) on all Supabase tables
- Validate all user inputs on both client and server
- Use HTTPS in production
- Regularly update dependencies for security patches

## Troubleshooting

### Build Errors
- Ensure Node.js version is 18.x or higher
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Authentication Issues
- Verify Supabase environment variables are correct
- Check that authentication redirect URLs are configured in Supabase
- Clear browser cookies and try again

### Payment Issues
- Verify Mollie API key is correct
- Check webhook URL is publicly accessible
- Review Mollie dashboard for payment status
- Check server logs for webhook errors

### Database Connection Issues
- Verify Supabase project is active
- Check Supabase service status
- Ensure RLS policies allow required operations

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

## License

See [LICENSE](./LICENSE) file for details.

## Support

For detailed implementation guidance, see [IMPLEMENTATIE_GIDS.md](./IMPLEMENTATIE_GIDS.md) (in Dutch).

For database schema documentation, see [DATABASE.md](./docs/DATABASE.md).

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database and auth by [Supabase](https://supabase.com)
- Payments by [Mollie](https://www.mollie.com)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
