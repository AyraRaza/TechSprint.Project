# TechSprint.Project

TechSprint is an AI-powered interview and hiring platform with two portals:
- Candidate portal: AI mock interviews, performance tracking, and job applications
- HR portal: job posting, candidate pool, status workflows, and resume review

## Repository Structure

```text
TechSprint.Project/
	interview platform/     # Main web app (Vite + React + TypeScript)
	package.json            # Root-level dependencies only
```

The active application is inside `interview platform`.

## Key Features

- Role-based authentication (Candidate and HR)
- Candidate interview setup and AI-assisted question/feedback flow
- HR dashboards for posts and applications
- Resume upload and viewing via Cloudinary
- Firebase-backed auth + Firestore data model

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind, shadcn/ui
- Backend services: Firebase Auth + Firestore
- Media storage: Cloudinary
- AI: Gemini APIs

## Quick Start

### 1) Go to app directory

```sh
cd "interview platform"
```

### 2) Install dependencies

```sh
npm install
```

### 3) Configure environment

Copy `.env.example` to `.env` and fill values:

```env
# Firebase
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# EmailJS
VITE_EMAILJS_SERVICE_ID=...
VITE_EMAILJS_TEMPLATE_INTERVIEW=...
VITE_EMAILJS_TEMPLATE_APOLOGY=...
VITE_EMAILJS_PUBLIC_KEY=...

# Gemini
VITE_GEMINI_API_KEY=...

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=...
VITE_CLOUDINARY_UPLOAD_PRESET=...
```

### 4) Run development server

```sh
npm run dev
```

Open the URL shown by Vite (typically `http://localhost:5173`).

## Scripts

Run these inside `interview platform`:

```sh
npm run dev        # start local dev server
npm run build      # create production build
npm run preview    # preview production build
npm run lint       # run linter
```

## Cloudinary Notes

- Create an unsigned upload preset in Cloudinary.
- Ensure your preset supports file types you allow (images + resume documents).
- Current app folders used:
	- `interview-platform/hiring-posts`
	- `interview-platform/resumes`

## Authentication and Routing

- Candidate logins route to `/dashboard`
- HR logins route to `/hr/dashboard`
- Protected routes enforce role access

## Deployment

The app includes `vercel.json` inside `interview platform`, so Vercel deployment is straightforward:

1. Import the repo in Vercel
2. Set root directory to `interview platform`
3. Add all required environment variables
4. Deploy

## Troubleshooting

- App fails to start: run `npm install` in `interview platform`
- Firebase auth issues: verify Firebase env keys and project config
- Resume open issues: verify Cloudinary preset/security and confirm file exists in Cloudinary Media Library

## License

No license file is currently defined in this repository.