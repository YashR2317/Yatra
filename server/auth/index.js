
const path = require('path');
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const dotenv = require('dotenv');

// Load environment variables from root .env file
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const authRoutes = require('./routes/auth.routes');
const { sendWelcomeEmail } = require('./utils/email');

const app = express();

// --- Middleware Configuration ---
app.use(cors({
  origin: true,
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API Routes ---
app.use('/api/auth', authRoutes);

// --- Email Test Endpoint (for debugging — remove in production) ---
app.get('/api/test-email', async (req, res) => {
  const testTo = req.query.to || "delivered@resend.dev";
  console.log(`\n🧪 TEST EMAIL — sending to: ${testTo}`);
  try {
    await sendWelcomeEmail(testTo, "Test User");
    res.json({ success: true, message: `Test email sent to ${testTo}` });
  } catch (err) {
    console.error("🧪 TEST EMAIL FAILED:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Database Connection & Server Startup ---
connectDB();

const port = process.env.AUTH_PORT || 5000;
app.listen(port, () => {
  console.log(`\n🚀 Server running on http://localhost:${port}`);
  console.log(`📧 Email: Resend API ${process.env.RESEND_API_KEY ? "✅ Configured" : "❌ RESEND_API_KEY not set"}`);
  console.log(`🧪 Test: http://localhost:${port}/api/test-email\n`);
});