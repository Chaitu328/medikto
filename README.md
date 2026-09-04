# Medikto

Medikto is a healthcare platform designed to simplify patient care, medication management, and health report management. The project consists of multiple applications working together to provide a complete healthcare ecosystem.

## Project Structure

```
medikto/
├── Backend/          # Node.js REST API
├── Frontend/         # React + Vite Admin Panel
├── medikto-app/      # Flutter Mobile Application
└── README.md
```

## Technologies

### Backend
- Node.js (v22 LTS)
- Express.js
- Amazon DocumentDB / MongoDB (TLS enabled)
- Amazon S3 Private Object Storage (AWS SDK v3 & Presigned URLs)
- Sharp (low-memory image watermarking)
- Docker & Docker Compose (512 MB memory bounded)
- Firebase Cloud Messaging (FCM)
- JWT Authentication

### Frontend
- React
- Vite
- Tailwind CSS

### Mobile
- Flutter
- Dart
- Firebase

## Features

- User Authentication
- Patient Management
- Doctor Management
- Medication Reminders
- Push Notifications
- Consolidated Medical Documents Hub (Vitals History, Medical Reports, Prescriptions)
- Streamlined Health Vitals Tracking (Blood Pressure, Heart Rate, Sugar Levels, Body Temperature)
- Guardian Management
- Admin Dashboard
- Role-Based Access Control

## Getting Started

Clone the repository:

```bash
git clone <repository-url>
cd medikto
```

Install dependencies for each project separately.

### Backend

```bash
cd Backend
npm install
npm start
```

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

### Mobile App

```bash
cd medikto-app
flutter pub get
flutter run
```

## Environment Variables

Each application requires its own environment configuration.

Refer to the respective project folders for the required environment variables.

## Repository Structure

| Folder | Description |
|---------|-------------|
| Backend | REST API and business logic |
| Frontend | Admin Panel |
| medikto-app | Flutter Mobile Application |

## Branch Strategy

- `main` - Production-ready code
- `dev` - Development branch

## License

This project is intended for internal development and deployment.

---

**Medikto Healthcare Platform**