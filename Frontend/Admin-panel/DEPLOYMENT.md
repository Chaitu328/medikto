# 🚀 Medikto Admin Panel AWS Deployment Guide

This guide details the steps to deploy the **Medikto Admin Panel** in a dedicated Docker container on the AWS EC2 server alongside the running `medikto-backend` container.

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
            ┌────────────────────────────┴────────────────────────────┐
            │                                                         │
     server_name:                                              server_name:
  api-prd.medikto.com                                       admin.medikto.com
            │                                                         │
    proxy_pass:                                               proxy_pass:
 http://127.0.0.1:4000                                     http://127.0.0.1:3000
            │                                                         │
            ▼                                                         ▼
┌─────────────────────────┐                               ┌─────────────────────────┐
│ Docker Container        │                               │ Docker Container        │
│ Name: medikto-backend   │                               │ Name: medikto-admin-panel│
│ Port: 4000:4000         │                               │ Port: 3000:80           │
│ Memory: 512M Limit      │                               │ Memory: 128M Limit      │
│ Runtime: Node 22 Alpine │                               │ Runtime: Nginx Alpine   │
└─────────────────────────┘                               └─────────────────────────┘
```

---

## 📋 STEP-BY-STEP AWS EC2 DEPLOYMENT

### Step 1: Connect to the AWS EC2 Instance
```bash
ssh -i /path/to/your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

---

### Step 2: Navigate to Admin Panel Directory
```bash
cd /home/ubuntu/medikto/Frontend/Admin-panel
```

---

### Step 3: Build and Run Admin Panel via Docker Compose
```bash
# 1. Build and start the container in detached mode
docker compose up -d --build

# 2. Verify running container status and health
docker compose ps

# 3. Check memory consumption (<20 MB active)
docker stats --no-stream medikto-admin-panel
```

---

### Step 4: Verify Local Container Response
```bash
# 1. Test root page response
curl -I http://localhost:3000

# 2. Test SPA fallback route
curl -I http://localhost:3000/patients
```

---

### Step 5: Configure Host Nginx Reverse Proxy on EC2

Create the host Nginx configuration for `admin.medikto.com`:

```bash
sudo tee /etc/nginx/sites-available/medikto-admin << 'EOF'
server {
    listen 80;
    server_name admin.medikto.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
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
EOF
```

Enable the configuration and reload Nginx:
```bash
sudo ln -sf /etc/nginx/sites-available/medikto-admin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### Step 6: Obtain Free SSL Certificate via Let's Encrypt (Certbot)
```bash
sudo certbot --nginx -d admin.medikto.com
```

---

## 🛠️ USEFUL MAINTENANCE COMMANDS

### Rebuild and Update Frontend After Code Pull
```bash
cd /home/ubuntu/medikto
git pull origin main
cd Frontend/Admin-panel
docker compose up -d --build
```

### Restart Frontend Container
```bash
cd /home/ubuntu/medikto/Frontend/Admin-panel
docker compose restart
```

### Stop Frontend Container
```bash
cd /home/ubuntu/medikto/Frontend/Admin-panel
docker compose down
```

### View Live Nginx Container Logs
```bash
docker compose logs -f
```
