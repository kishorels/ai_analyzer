# AI Resume Analyzer

A React app for uploading a PDF resume and sending it with job details to an n8n webhook.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from the example:

```bash
cp .env.example .env
```

3. Set your production n8n webhook URL:

```txt
REACT_APP_N8N_WEBHOOK_URL=https://your-n8n-domain.com/webhook/resume-analyzer
```

4. Start the app locally:

```bash
npm run dev
```

## Railway Deploy

Use these settings in Railway:

```txt
Build command: npm run build
Start command: npm start
```

Add this Railway environment variable:

```txt
REACT_APP_N8N_WEBHOOK_URL=https://your-n8n-domain.com/webhook/resume-analyzer
```

The app sends multipart form data to the webhook with these fields:

```txt
name
email
jobTitle
jobDescription
resume
```

`resume` must be a PDF file.
