# Medikto Admin Panel

The **Medikto Admin Panel** is an enterprise healthcare management interface built with **React 19**, **Vite**, and **Tailwind CSS v4**. It serves **Super Administrators**, **Hospital Administrators**, and **Guardians** through role-based access control.

---

## 🛠️ Tech Stack
- **Framework**: React `19.2.5`
- **Build Tool**: Vite `8.0.10`
- **Styling**: Tailwind CSS `v4.3.0`
- **Routing**: React Router DOM `v7.15.0`
- **HTTP Client**: Axios with JWT Bearer Interceptors
- **Container Server**: Nginx Alpine (`<20 MB` RAM consumption)

---

## 💻 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional for Dev)
Create a `.env.local` file:
```env
VITE_API_BASE_URL=http://localhost:4000/api
```

### 3. Run Development Server
```bash
npm run dev
```

---

## 🏗️ Production Build (Local)

Compile the optimized static bundle into the `dist/` directory:
```bash
npm ci
npm run build
```

---

## 🐳 Docker Deployment

### 1. Build and Run via Docker Compose (Recommended)
```bash
# Build and start container in detached mode on port 3000
docker compose up -d --build

# View container status & health
docker compose ps

# View real-time logs
docker compose logs -f
```

### 2. Build and Run via Docker CLI
```bash
# 1. Build the production Docker image with build argument
docker build -t medikto-admin-panel:latest \
  --build-arg VITE_API_BASE_URL=https://api-prd.medikto.com/api .

# 2. Run the lightweight container
docker run -d \
  --name medikto-admin-panel \
  --restart unless-stopped \
  -p 3000:80 \
  medikto-admin-panel:latest

# 3. Test container health
curl -I http://localhost:3000
```

---

## 🌐 Production Architecture & AWS Deployment

For complete end-to-end AWS EC2 deployment, host Nginx reverse proxy setup, and Let's Encrypt SSL instructions:
👉 Refer to **[DEPLOYMENT.md](./DEPLOYMENT.md)**.
