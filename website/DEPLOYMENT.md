# 🚀 Medikto Website AWS Deployment Guide

This guide details how to deploy the **Medikto Landing Marketing Website (Next.js 15 App Router)** in a dedicated Docker container on the AWS EC2 server alongside the running `medikto-backend` and `medikto-admin-panel` containers.

---

## 🏛️ Architecture Overview

```
                                [ Internet Browser ]
                                         │
                                HTTPS (Port 443 / SSL)
                                         ▼
                     ┌───────────────────────────────────────┐
                     │    Host Nginx Reverse Proxy (EC2)     │
                     └───────────────────┬───────────────────┘
                                         │
            ┌────────────────────────────┼────────────────────────────┐
            │                            │                            │
     server_name:                 server_name:                 server_name:
  api-prd.medikto.com          admin.medikto.com            medikto.com / www
            │                            │                            │
    proxy_pass:                  proxy_pass:                  proxy_pass:
 http://127.0.0.1:4000        http://127.0.0.1:3000        http://127.0.0.1:3001
            │                            │                            │
            ▼                            ▼                            ▼
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│ Docker Container        │  │ Docker Container        │  │ Docker Container        │
│ Name: medikto-backend   │  │ Name: medikto-admin-panel│ │ Name: medikto-website   │
│ Port: 4000:4000         │  │ Port: 3000:80           │  │ Port: 3001:3000         │
│ Memory: 512M Limit      │  │ Memory: 128M Limit      │  │ Memory: 256M Limit      │
│ Runtime: Node 22 Alpine │  │ Runtime: Nginx Alpine   │  │ Runtime: Next Standalone│
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

---

## 📋 STEP-BY-STEP AWS EC2 DEPLOYMENT

### Step 1: Connect to the AWS EC2 Instance
```bash
ssh -i /path/to/your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

---

### Step 2: Navigate to Website Directory & Pull Latest Code
```bash
cd /home/ubuntu/medikto
git pull origin main
cd website
```

---

### Step 3: Configure Environment Variables (Optional Google Analytics)
Create or edit `.env.local` inside `/home/ubuntu/medikto/website/.env.local`:
```bash
nano .env.local
```
Add your configurations:
```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=https://medikto.health
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=healthreportsapp7@gmail.com
SMTP_PASS=cqvxqlydhbgteeau
```

---

### Step 4: Build & Start the Website Container
```bash
# 1. Build and run in detached mode (build args automatically read from .env.local / env)
docker compose up -d --build

# 2. Check running container status and health
docker compose ps

# 3. View live logs
docker compose logs -f
```

---

### Step 4: Verify Local Container Response
```bash
# 1. Test homepage response (should return HTTP 200)
curl -I http://localhost:3001

# 2. Check memory usage (<50MB active RAM)
docker stats --no-stream medikto-website
```

---

### Step 5: Configure Host Nginx on EC2

```bash
# 1. Copy or link Nginx configuration
sudo cp /home/ubuntu/medikto/website/nginx.conf /etc/nginx/sites-available/medikto-website

# 2. Enable the site
sudo ln -sf /etc/nginx/sites-available/medikto-website /etc/nginx/sites-enabled/

# 3. Test Nginx syntax and reload
sudo nginx -t
sudo systemctl reload nginx
```

---

### Step 6: Obtain Free SSL Certificate (Let's Encrypt / Certbot)

```bash
# Run Certbot to automatically configure HTTPS for medikto.com and www.medikto.com
sudo certbot --nginx -d medikto.com -d www.medikto.com
```

---

## 🛠️ OR: Deploy All 3 Services Together (Unified Root Compose)

You can build and run all 3 services (`Backend`, `Admin Panel`, and `Website`) simultaneously from the project root:

```bash
cd /home/ubuntu/medikto

# 1. Build and start all 3 containers
docker compose up -d --build

# 2. Verify all containers
docker compose ps

# 3. Apply the unified Nginx configuration
sudo cp /home/ubuntu/medikto/nginx/medikto.conf /etc/nginx/sites-available/medikto
sudo ln -sf /etc/nginx/sites-available/medikto /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 4. Issue SSL certificates for all domains in one go
sudo certbot --nginx \
  -d api-prd.medikto.com \
  -d admin.medikto.com \
  -d medikto.com \
  -d www.medikto.com
```
