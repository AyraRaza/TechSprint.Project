import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5000;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.use(cors());
app.use(express.json());

// Request logger to help debug 404s
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.method !== 'GET') {
    console.log('Body:', JSON.stringify(req.body));
  }
  next();
});

// Add a middleware to set a permissive CSP and other security-related headers
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';");
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running' });
});

// Added to help resolve "cannot find applications" 404s
app.get('/applications', (req, res) => {
  res.json({ message: 'Applications endpoint reachable. Use PUT for status updates.', applications: [] });
});

app.get('/applications/:id/status', (req, res) => {
  res.json({ message: 'Application status endpoint reachable. Use PUT to update.', id: req.params.id });
});

// Quiet common browser/devtools noise
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => res.status(204).end());

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve static files from the public folder
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Updated to handle both 'image' and 'file' field names for backward compatibility
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  const fileUrl = `http://localhost:${port}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

app.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No image uploaded.');
  }
  const imageUrl = `http://localhost:${port}/uploads/${req.file.filename}`;
  res.json({ url: imageUrl });
});

app.put('/applications/:id/status', async (req, res) => {
  const { id } = req.params;
  
  if (!req.body) {
    console.error('No body received in request');
    return res.status(400).json({ error: 'Request body is missing' });
  }

  const {
    status,
    candidateEmail,
    candidateName,
    jobTitle,
    companyName,
    hrName
  } = req.body;

  console.log(`Updating status for application ${id} to ${status}`);

  try {
    if (status === 'shortlisted' || status === 'rejected') {
      const subject =
        status === 'shortlisted'
          ? `Interview Invitation – ${jobTitle} | ${companyName}`
          : `Application Update – ${jobTitle} | ${companyName}`;

      const text =
        status === 'shortlisted'
          ? `Dear ${candidateName},

We are pleased to invite you for an interview for the ${jobTitle} position at ${companyName}.
Our HR team (${hrName}) will contact you shortly to schedule the interview.

Best regards,
${hrName}
${companyName}`
          : `Dear ${candidateName},

Thank you for your interest in the ${jobTitle} position at ${companyName}.
After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.

We appreciate the time you took to apply and wish you the best in your job search.

Best regards,
${hrName}
${companyName}`;

      await sgMail.send({
        to: candidateEmail,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject,
        text,
      });

      console.log(`Email sent to ${candidateEmail} for status ${status}`);
    }

    res.json({ success: true, message: `Status updated to ${status} and email sent.` });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send status update email' });
  }
});

// Explicitly handle 404s to prevent Express 5 default CSP headers
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
