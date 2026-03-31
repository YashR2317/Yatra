const { Resend } = require("resend");

// ─── Initialize Resend (graceful — won't crash if key is missing) ───
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

console.log("\n📧 --- Email Configuration (Resend) ---");
console.log(`   RESEND_API_KEY: ${process.env.RESEND_API_KEY ? "✅ Set" : "⚠️  NOT SET (emails disabled)"}`);
console.log("   ----------------------------------------\n");

/**
 * Send a welcome email to a newly registered user via Resend API.
 */
const sendWelcomeEmail = async (toEmail, userName) => {
  // In development (Resend sandbox), send to developer email since no domain is verified
  const recipient =
    process.env.NODE_ENV === "development"
      ? "srishtigoyal1910@gmail.com"
      : toEmail;

  console.log(`\n📧 sendWelcomeEmail() → ${toEmail} (${userName})`);
  if (recipient !== toEmail) {
    console.log(`   📨 Dev mode: redirecting to ${recipient}`);
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn("   ⚠️  RESEND_API_KEY not set — skipping email");
    return;
  }

  const subject = "Welcome to BrajYatra — Your Sacred Journey Begins!";

  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #FDFAF5; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #C0622D, #8B4513); padding: 32px; text-align: center;">
        <h1 style="color: #FFF8E7; margin: 0; font-size: 28px;">Jai Shree Krishna!</h1>
        <p style="color: #FFF8E7; opacity: 0.9; margin: 8px 0 0;">Welcome to BrajYatra</p>
      </div>
      <div style="padding: 32px; color: #5C4033;">
        <p style="font-size: 18px; line-height: 1.6;">Dear <strong>${userName}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.8;">
          Welcome to the sacred land of Braj! Your account has been created successfully.
          You now have access to explore over 100 divine destinations across
          <strong>Mathura, Vrindavan, Agra, Gokul, Govardhan, and Barsana</strong>.
        </p>
        <div style="background: #FFF8E7; border-left: 4px solid #C0622D; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; font-style: italic; color: #8B4513;">
            "Where every grain of dust holds the divine."
          </p>
        </div>
        <p style="font-size: 16px; line-height: 1.8;">
          Start your yatra by exploring our curated itineraries, discovering hidden gems,
          and planning your sacred pilgrimage through the land where Krishna walked.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?email=${encodeURIComponent(toEmail)}"
             style="background: #C0622D; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold;">
            Login to Begin Your Journey
          </a>
        </div>
        <p style="font-size: 14px; color: #8B7355; text-align: center; margin-top: 32px;">
          The BrajYatra Team
        </p>
      </div>
    </div>
    `;

  try {
    const { data, error } = await resend.emails.send({
      from: "BrajYatra <onboarding@resend.dev>",
      to: [recipient],
      subject,
      html,
    });

    if (error) {
      console.error(`   ❌ Resend error: ${JSON.stringify(error)}`);
      throw new Error(error.message);
    }

    console.log(`   ✅ Email sent! ID: ${data.id}`);
  } catch (err) {
    console.error(`   ❌ Email failed: ${err.message}`);
    throw err;
  }
};

/**
 * Send a password reset email with a reset link.
 */
const sendPasswordResetEmail = async (toEmail, userName, resetToken) => {
  const recipient =
    process.env.NODE_ENV === "development"
      ? "srishtigoyal1910@gmail.com"
      : toEmail;

  console.log(`\n📧 sendPasswordResetEmail() → ${toEmail} (${userName})`);
  if (recipient !== toEmail) {
    console.log(`   📨 Dev mode: redirecting to ${recipient}`);
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn("   ⚠️  RESEND_API_KEY not set — skipping email");
    console.log(`   🔗 Reset link: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`);
    return;
  }

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #FDFAF5; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #C0622D, #8B4513); padding: 32px; text-align: center;">
        <h1 style="color: #FFF8E7; margin: 0; font-size: 28px;">Password Reset</h1>
        <p style="color: #FFF8E7; opacity: 0.9; margin: 8px 0 0;">BrajYatra.AI</p>
      </div>
      <div style="padding: 32px; color: #5C4033;">
        <p style="font-size: 18px; line-height: 1.6;">Dear <strong>${userName}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.8;">
          We received a request to reset your password. Click the button below to create a new password.
          This link will expire in <strong>1 hour</strong>.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}"
             style="background: #C0622D; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold;">
            Reset My Password
          </a>
        </div>
        <div style="background: #FFF8E7; border-left: 4px solid #C0622D; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; font-size: 14px; color: #8B4513;">
            If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
          </p>
        </div>
        <p style="font-size: 14px; color: #8B7355; text-align: center; margin-top: 32px;">
          The BrajYatra Team
        </p>
      </div>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "BrajYatra <onboarding@resend.dev>",
      to: [recipient],
      subject: "Reset Your BrajYatra Password",
      html,
    });

    if (error) {
      console.error(`   ❌ Resend error: ${JSON.stringify(error)}`);
      throw new Error(error.message);
    }

    console.log(`   ✅ Reset email sent! ID: ${data.id}`);
  } catch (err) {
    console.error(`   ❌ Reset email failed: ${err.message}`);
    throw err;
  }
};

module.exports = { sendWelcomeEmail, sendPasswordResetEmail };
