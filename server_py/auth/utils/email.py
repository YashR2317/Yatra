"""
Email Utility — Resend API integration for transactional emails.
"""

import urllib.parse
from config import get_settings
from shared.logger import create_logger

logger = create_logger("auth")

_resend_client = None


def _get_resend():
    global _resend_client
    if _resend_client is not None:
        return _resend_client

    settings = get_settings()
    if not settings.RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set — emails disabled")
        return None

    import resend
    resend.api_key = settings.RESEND_API_KEY
    _resend_client = resend
    return resend


async def send_welcome_email(to_email: str, user_name: str):
    """Send a welcome email to a newly registered user."""
    settings = get_settings()
    recipient = "srishtigoyal1910@gmail.com" if settings.NODE_ENV == "development" else to_email

    logger.info(f"sendWelcomeEmail() → {to_email} ({user_name})")

    resend_mod = _get_resend()
    if not resend_mod:
        logger.warning("RESEND_API_KEY not set — skipping email")
        return

    frontend_url = "http://localhost:5173"
    encoded_email = urllib.parse.quote(to_email)

    html = f"""
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #FDFAF5; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #C0622D, #8B4513); padding: 32px; text-align: center;">
        <h1 style="color: #FFF8E7; margin: 0; font-size: 28px;">Jai Shree Krishna!</h1>
        <p style="color: #FFF8E7; opacity: 0.9; margin: 8px 0 0;">Welcome to BrajYatra</p>
      </div>
      <div style="padding: 32px; color: #5C4033;">
        <p style="font-size: 18px; line-height: 1.6;">Dear <strong>{user_name}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.8;">
          Welcome to the sacred land of Braj! Your account has been created successfully.
          You now have access to explore over 100 divine destinations across
          <strong>Mathura, Vrindavan, Agra, Gokul, Govardhan, and Barsana</strong>.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="{frontend_url}/login?email={encoded_email}"
             style="background: #C0622D; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold;">
            Login to Begin Your Journey
          </a>
        </div>
        <p style="font-size: 14px; color: #8B7355; text-align: center; margin-top: 32px;">
          The BrajYatra Team
        </p>
      </div>
    </div>
    """

    try:
        params = {
            "from": "BrajYatra <onboarding@resend.dev>",
            "to": [recipient],
            "subject": "Welcome to BrajYatra — Your Sacred Journey Begins!",
            "html": html,
        }
        resend_mod.Emails.send(params)
        logger.info("✅ Welcome email sent!")
    except Exception as e:
        logger.error(f"❌ Email failed: {e}")
        raise


async def send_password_reset_email(to_email: str, user_name: str, reset_token: str):
    """Send a password reset email with a reset link."""
    settings = get_settings()
    recipient = "srishtigoyal1910@gmail.com" if settings.NODE_ENV == "development" else to_email

    logger.info(f"sendPasswordResetEmail() → {to_email} ({user_name})")

    resend_mod = _get_resend()
    if not resend_mod:
        frontend_url = "http://localhost:5173"
        logger.warning(f"RESEND_API_KEY not set — skipping email")
        logger.info(f"🔗 Reset link: {frontend_url}/reset-password?token={reset_token}")
        return

    frontend_url = "http://localhost:5173"
    reset_url = f"{frontend_url}/reset-password?token={reset_token}"

    html = f"""
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #FDFAF5; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #C0622D, #8B4513); padding: 32px; text-align: center;">
        <h1 style="color: #FFF8E7; margin: 0; font-size: 28px;">Password Reset</h1>
        <p style="color: #FFF8E7; opacity: 0.9; margin: 8px 0 0;">BrajYatra.AI</p>
      </div>
      <div style="padding: 32px; color: #5C4033;">
        <p style="font-size: 18px; line-height: 1.6;">Dear <strong>{user_name}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.8;">
          We received a request to reset your password. Click the button below to create a new password.
          This link will expire in <strong>1 hour</strong>.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="{reset_url}"
             style="background: #C0622D; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold;">
            Reset My Password
          </a>
        </div>
        <p style="font-size: 14px; color: #8B7355; text-align: center; margin-top: 32px;">
          The BrajYatra Team
        </p>
      </div>
    </div>
    """

    try:
        params = {
            "from": "BrajYatra <onboarding@resend.dev>",
            "to": [recipient],
            "subject": "Reset Your BrajYatra Password",
            "html": html,
        }
        resend_mod.Emails.send(params)
        logger.info("✅ Reset email sent!")
    except Exception as e:
        logger.error(f"❌ Reset email failed: {e}")
        raise
