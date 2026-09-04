# 🚀 Medikto Backend AWS Deployment & Architecture Guide

## Phase 1: Amazon DocumentDB + Private S3 + Low-Memory Docker

This guide documents the complete end-to-end steps and exact copy-paste terminal commands for deploying and running the **Medikto Backend** on AWS infrastructure in the `ap-south-1` (Mumbai) region.

---

## 🏛️ Architecture Overview

```
+-----------------------------------------------------------------------------------+
| AWS VPC (ap-south-1 Mumbai)                                                      |
|                                                                                   |
|  +---------------------------+       Private VPC TLS       +--------------------+ |
|  | EC2 Instance (Ubuntu)     | --------------------------> | Amazon DocumentDB  | |
|  | - 2 vCPU, ~2 GiB RAM      |      Port 27017 / rs0       | Cluster (rs0)      | |
|  | - 2 GiB Swap              |                             +--------------------+ |
|  | - IAM Role:               |                                                    |
|  |   MediktoEC2S3Role        |                                                    |
|  |                           |                                                    |
|  |  [ Docker Container ]     |       EC2 IAM Role Auth     +--------------------+ |
|  |  - Node.js 22 Alpine      | --------------------------> | Amazon S3 (Private)| |
|  |  - Heap Cap: 512 MB       |     (No hardcoded keys)     | medikto-s3-bucket  | |
|  |  - Port: 4000             |                             +--------------------+ |
|  |  - GET /health            |                                                    |
|  +---------------------------+                                                    |
+-----------------------------------------------------------------------------------+
```

---

## 📋 STEP-BY-STEP AWS DEPLOYMENT COMMANDS

---

### Step 1: Connect to the EC2 Instance

```bash
# Connect from your local terminal via SSH
ssh -i /path/to/your-key.pem ubuntu@<EC2_PUBLIC_IP_OR_DNS>
```

---

### Step 2: Ensure Docker & Docker Compose are Installed on EC2

```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install Docker and Docker Compose Plugin
sudo apt install -y docker.io docker-compose-v2

# 3. Enable and start Docker service
sudo systemctl enable --now docker

# 4. Add ubuntu user to docker group (avoids needing sudo for docker commands)
sudo usermod -aG docker ubuntu

# 5. Apply new group membership (or logout and log back in)
newgrp docker

# 6. Verify Docker installation
docker --version
docker compose version
```

---

### Step 3: Verify 2 GiB Swap Memory on EC2

```bash
# Check current swap status
free -h

# If swap is not configured, create a 2 GiB swap file:
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make swap permanent across reboots
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

### Step 4: Verify EC2 IAM Role & S3 Bucket Access

Ensure the EC2 instance is attached to **`MediktoEC2S3Role`**.

```bash
# 1. Test IAM authentication to private S3 bucket without keys
aws s3 ls s3://medikto-s3-bucket/ --region ap-south-1

# 2. Test writing a temporary test file
echo "Medikto S3 Verification" > test.txt
aws s3 cp test.txt s3://medikto-s3-bucket/test.txt --region ap-south-1

# 3. Clean up test file
aws s3 rm s3://medikto-s3-bucket/test.txt --region ap-south-1
rm test.txt
```

---

### Step 5: Verify DocumentDB Connectivity from EC2

```bash
# 1. Install mongosh (MongoDB Shell) on EC2 if not installed
wget -qO- https://www.mongodb.org/static/pgp/server-7.0.asc | sudo tee /etc/apt/trusted.gpg.d/mongodb-server-7.0.asc
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update && sudo apt install -y mongodb-mongosh

# 2. Test DocumentDB TLS connection using the CA bundle
mongosh --tls \
  --tlsCAFile /home/ubuntu/medikto/Backend/certs/global-bundle.pem \
  --host <docdb_cluster_endpoint>:27017 \
  --username <docdb_username> \
  --password <docdb_password>
```

---

### Step 6: Clone or Pull the Updated Medikto Codebase

```bash
# Navigate to home directory
cd /home/ubuntu

# Clone repository (if first time)
git clone https://github.com/Chaitu328/medikto.git

# OR update existing repository
cd /home/ubuntu/medikto
git pull origin main
```

---

### Step 7: Configure Production `.env` File

```bash
cd /home/ubuntu/medikto/Backend

# Create production .env file
cat << 'EOF' > .env
PORT=4000
NODE_ENV=production

# DocumentDB Connection URI (Replace with your actual DocumentDB credentials and endpoint)
MONGO_URI=mongodb://<docdb_username>:<docdb_password>@<docdb_cluster_endpoint>:27017/medikto?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false
DOCDB_CA_PATH=/app/certs/global-bundle.pem

# AWS S3 Configuration (Authenticated automatically via EC2 IAM Role)
AWS_REGION=ap-south-1
S3_BUCKET_NAME=medikto-s3-bucket

# JWT Security
JWT_SECRET=your_super_secret_jwt_key_here

# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
EOF

# Secure permissions for .env
chmod 600 .env
```

---

### Step 7A: Firebase Admin SDK Service Account & Android App Signatures

Firebase is used for Push Notifications (FCM) and Phone OTP Authentication.

#### 1. Generate & Place Firebase Admin Service Account Key on the Server
1. Go to **[Firebase Console](https://console.firebase.google.com)** -> Project **`med-vault-b69a6`** -> **Project Settings** (gear icon) -> **Service Accounts**.
2. Click **Generate new private key** and confirm.
3. A JSON file will download (e.g. `firebase-adminsdk.json`).
4. Transfer or paste this file on the EC2 server at:
   `/home/ubuntu/medikto/Backend/certs/firebase-service-account.json`

```bash
# Set secure read permissions for the Firebase credentials
chmod 600 /home/ubuntu/medikto/Backend/certs/firebase-service-account.json
```

#### 2. Register Android App SHA-1 & SHA-256 Signatures in Firebase Console
For SMS OTP Authentication and Google Sign-In to work on production builds:
1. Extract the SHA-1 and SHA-256 fingerprints from your release keystore:
   ```bash
   keytool -list -v -keystore /path/to/upload-keystore.jks -alias upload
   ```
2. Or, if using Google Play App Signing, copy the **SHA-1** and **SHA-256** certificate fingerprints from **Google Play Console -> Setup -> App Integrity**.
3. In **Firebase Console -> Project Settings -> General -> Your apps -> Android app (`com.example.medikto`)**, click **Add fingerprint** and add both SHA-1 and SHA-256.
4. Download the updated `google-services.json` and replace it in `medikto-app/android/app/google-services.json`.

---

### Step 8: Build and Run Backend Container via Docker Compose

```bash
cd /home/ubuntu/medikto/Backend

# 1. Build and start the backend service in detached mode
docker compose up -d --build

# 2. Check running container status
docker compose ps

# 3. View real-time container logs
docker compose logs -f
```

---

### Step 9: Verify Application Health and Resource Consumption

```bash
# 1. Test local health check endpoint
curl -i http://localhost:4000/health

# Expected response:
# HTTP/1.1 200 OK
# Content-Type: application/json; charset=utf-8
# {"status":"ok","uptime":12.34,"timestamp":"..."}

# 2. Check memory usage of the container (verifies strict 512MB limit)
docker stats --no-stream
```

---

## 🛠️ USEFUL MAINTENANCE COMMANDS

### Restart Backend Service
```bash
cd /home/ubuntu/medikto/Backend
docker compose restart
```

### Stop Backend Service
```bash
cd /home/ubuntu/medikto/Backend
docker compose down
```

### Rebuild After Git Pull
```bash
cd /home/ubuntu/medikto
git pull origin main
cd Backend
docker compose up -d --build
```

### Inspect Container Internals
```bash
docker exec -it medikto-backend sh
```

---

## 📦 PHASE 2: DATA MIGRATION & DOMAIN SSL (MAINTENANCE WINDOW)

The following commands are for the **Phase 2** maintenance window.

### A. MongoDB Atlas to DocumentDB Data Dump & Restore

```bash
# 1. Dump data from MongoDB Atlas
mongodump --uri "mongodb+srv://<atlas_user>:<atlas_password>@<atlas_host>/medikto" --out ./atlas_backup

# 2. Restore data into Amazon DocumentDB
mongorestore --tls \
  --tlsCAFile /home/ubuntu/medikto/Backend/certs/global-bundle.pem \
  --host <docdb_cluster_endpoint>:27017 \
  --username <docdb_username> \
  --password <docdb_password> \
  --nsInclude="medikto.*" \
  ./atlas_backup/medikto
```

### B. Configure Nginx Reverse Proxy & SSL (Certbot)

```bash
# 1. Install Nginx and Certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# 2. Configure Nginx site configuration
sudo tee /etc/nginx/sites-available/medikto-api << 'EOF'
server {
    listen 80;
    server_name api.medikto.com;

    location / {
        proxy_pass http://127.0.0.1:4000;
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

# 3. Enable site and test Nginx
sudo ln -sf /etc/nginx/sites-available/medikto-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 4. Obtain SSL Certificate from Let's Encrypt
sudo certbot --nginx -d api.medikto.com
```
