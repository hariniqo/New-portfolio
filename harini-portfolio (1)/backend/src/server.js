require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_DIR = path.join(__dirname, '..', '..', 'frontend');
const DATA_DIR = path.join(__dirname, '..', 'data');

app.set('trust proxy', 1);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:'],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
        frameAncestors: ["'self'"],
      },
    },
  })
);

const origins = (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors({ origin: origins.length ? origins : false }));
app.use(express.json({ limit: '10kb' }));

// --- Contact API -----------------------------------------------------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many messages. Please try again later.' },
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (v, max) => String(v || '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);

function getTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST || 'smtp.gmail.com',
    port: Number(SMTP_PORT) || 465,
    secure: (Number(SMTP_PORT) || 465) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}
const transport = getTransport();

function saveLocally(entry) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.appendFileSync(path.join(DATA_DIR, 'messages.jsonl'), JSON.stringify(entry) + '\n');
  } catch (e) {
    console.error('Could not save message locally:', e.message);
  }
}

app.post('/api/contact', limiter, async (req, res) => {
  const body = req.body || {};
  if (body.website) return res.json({ ok: true }); // honeypot: silently drop bots

  const name = clean(body.name, 80);
  const email = clean(body.email, 120);
  const message = String(body.message || '').replace(/\r/g, '').trim().slice(0, 2000);

  if (!name || !email || !message) return res.status(400).json({ error: 'All fields are required.' });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
  if (message.length < 5) return res.status(400).json({ error: 'Message is too short.' });

  const entry = { name, email, message, at: new Date().toISOString() };
  saveLocally(entry);

  if (!transport) {
    console.warn('SMTP not configured; message saved to backend/data/messages.jsonl only.');
    return res.json({ ok: true, delivered: false });
  }

  try {
    await transport.sendMail({
      from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_TO || process.env.SMTP_USER,
      replyTo: `${name} <${email}>`,
      subject: `Portfolio message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });
    res.json({ ok: true, delivered: true });
  } catch (err) {
    console.error('Mail error:', err.message);
    res.status(502).json({ error: 'Could not send your message right now. Please email me directly.' });
  }
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// --- Static frontend -------------------------------------------------------
app.use(express.static(FRONTEND_DIR, { extensions: ['html'], maxAge: '1h' }));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => console.log(`Portfolio running on http://localhost:${PORT}`));
