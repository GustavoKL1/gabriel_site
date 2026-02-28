# GKL Engenharia - Website

This repository contains the source code for the GKL Engenharia website, consisting of a React frontend and a Node.js backend API.

## Prerequisites

- Node.js (>= 18.0.0)
- npm (Node Package Manager)

## Getting Started

Follow the instructions below to set up and run both the backend and frontend development servers locally.

### 1. Backend Setup

The backend handles the contact form API and requires configuration for CORS, email (SMTP), and rate limiting.

1. Navigate to the backend directory:
   ```bash
   cd app/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment Configuration:
   Copy the example environment file and fill in your details:
   ```bash
   cp .env.example .env
   ```
   *Note: You will need to provide valid SMTP credentials (e.g., Gmail App Passwords or similar) and other required configurations in the `.env` file for the contact form to function. Please see `app/backend/SECURITY.md` for critical security guidelines.*

4. Start the development server:
   ```bash
   npm run dev
   ```
   The backend API will start on `http://localhost:3000` by default.

### 2. Frontend Setup

The frontend is a modern web application built with React, Vite, TypeScript, and Tailwind CSS.

1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment Configuration:
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Ensure that `VITE_API_URL` is set to point to your running backend (default is `http://localhost:3000/api`).

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The website will typically be accessible at `http://localhost:5173`.

## Production Build

To build the frontend for production, run the following command from the `app` directory:
```bash
npm run build
```
To preview the production build locally:
```bash
npm run preview
```

## Security & Important Documentation

Before deploying to production, thoroughly review the `app/backend/SECURITY.md` file. It outlines necessary security measures such as properly configuring CORS origins and handling SMTP credentials securely.
