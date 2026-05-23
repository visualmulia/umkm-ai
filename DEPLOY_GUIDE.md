# Deploy Guide — UMKM-AI ke Vercel

## Prerequisites

- Akun Vercel (vercel.com)
- Domain: umkm-ai.web.id
- MySQL Database (PlanetScale / Railway / hosting sendiri)
- Kirimi.id account

## Step 1: Database Setup

### Option A: PlanetScale (Gratis)
1. Buat akun di planetscale.com
2. Create database: `umkm-ai`
3. Copy `DATABASE_URL` connection string

### Option B: Railway
1. Buat akun di railway.app
2. Add MySQL database
3. Copy connection string

## Step 2: Environment Variables

Di Vercel Dashboard → Project Settings → Environment Variables:

```
DATABASE_URL=mysql://username:password@host:port/umkm-ai
KIMI_API_KEY=your_kimi_api_key
KIRIMI_USER_CODE=your_kirimi_user_code
KIRIMI_SECRET=your_kirimi_secret
KIRIMI_DEVICE_ID=your_kirimi_device_id
FLIP_SECRET_KEY=your_flip_secret_key_basic_auth
APP_URL=https://umkm-ai.web.id
NODE_ENV=production
```

## Step 3: Push Database Schema

```bash
npx drizzle-kit push
# atau
npm run db:push
```

## Step 4: Deploy ke Vercel

### A. Via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### B. Via GitHub Integration
1. Push project ke GitHub repo
2. Login Vercel → Add New Project
3. Import dari GitHub
4. Framework Preset: `Other`
5. Build Command: `npm run build`
6. Output Directory: `dist/public`
7. Deploy

## Step 5: Custom Domain

1. Vercel Dashboard → Domains
2. Add `umkm-ai.web.id`
3. Ikuti instruksi DNS dari Vercel:
   - Tambahkan `A` record ke `76.76.21.21`
   - Atau `CNAME` record ke `cname.vercel-dns.com`
4. Tunggu DNS propagate (1-48 jam)

## Step 6: Kirimi.id Webhook Setup

1. Login Kirimi.id Dashboard
2. Pilih Device → Webhook
3. Set Webhook URL: `https://umkm-ai.web.id/api/webhook/kirimi`
4. Aktifkan event: `message`, `message.sent`, `connection.connected`

## Step 7: Flip Payment Setup

1. Login Flip for Business
2. Generate Secret Key (Basic Auth)
3. Tambahkan `FLIP_SECRET_KEY` ke Vercel env vars
4. Set callback URL: `https://umkm-ai.web.id/api/webhook/flip`

## Done! 🎉

Website live di: https://umkm-ai.web.id
