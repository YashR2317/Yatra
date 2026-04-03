/**
 * Input Validation Schemas — Zod-based validation for all API endpoints.
 * Centralizes validation logic and provides clear error messages.
 */
const { z } = require('zod');

// ─── Auth Schemas ────────────────────────────────────────────

const signupSchema = z.object({
    name: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be at most 100 characters')
        .regex(/^[a-zA-Z\s\u0900-\u097F]+$/, 'Name can only contain letters and spaces'),
    email: z.string()
        .email('Please provide a valid email address')
        .max(255, 'Email is too long')
        .transform(val => val.toLowerCase().trim()),
    password: z.string()
        .min(6, 'Password must be at least 6 characters')
        .max(128, 'Password is too long')
});

const loginSchema = z.object({
    email: z.string()
        .email('Please provide a valid email address')
        .transform(val => val.toLowerCase().trim()),
    password: z.string()
        .min(1, 'Password is required')
        .max(128, 'Password is too long')
});

// ─── Agent Chat Schema ───────────────────────────────────────

const chatSchema = z.object({
    message: z.string()
        .min(1, 'Message is required')
        .max(2000, 'Message is too long (max 2000 characters)')
        .transform(val => val.trim()),
    sessionId: z.string().nullable().optional(),
    language: z.enum(['en', 'hi']).optional().default('en')
}).passthrough();

// ─── Agent Itinerary Schema ──────────────────────────────────

const itinerarySchema = z.object({
    cities: z.array(z.string()).min(1, 'At least one city is required').max(6),
    days: z.number().int().min(1).max(14).default(1),
    interests: z.array(z.string()).max(10).default([]),
    pace: z.enum(['relaxed', 'moderate', 'intensive']).default('moderate'),
    group_type: z.string().max(50).optional(),
    budget_level: z.enum(['budget', 'medium', 'luxury']).optional()
});

// ─── Password Reset Schemas ─────────────────────────────────

const forgotPasswordSchema = z.object({
    email: z.string()
        .email('Please provide a valid email address')
        .transform(val => val.toLowerCase().trim())
});

const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string()
        .min(6, 'Password must be at least 6 characters')
        .max(128, 'Password is too long')
});

// ─── Profile & Account Management Schemas ────────────────────

const updateProfileSchema = z.object({
    name: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be at most 100 characters')
        .regex(/^[a-zA-Z\s\u0900-\u097F]+$/, 'Name can only contain letters and spaces')
        .optional(),
    avatar: z.string()
        .url('Please provide a valid URL for avatar')
        .max(500, 'Avatar URL is too long')
        .optional()
        .or(z.literal(''))
}).refine(data => data.name || data.avatar !== undefined, {
    message: 'At least one field (name or avatar) must be provided'
});

const changePasswordSchema = z.object({
    currentPassword: z.string()
        .min(1, 'Current password is required')
        .max(128, 'Password is too long'),
    newPassword: z.string()
        .min(6, 'New password must be at least 6 characters')
        .max(128, 'Password is too long')
});

const deleteAccountSchema = z.object({
    password: z.string()
        .min(1, 'Password is required to delete your account')
        .max(128, 'Password is too long')
});

// ─── Validation Middleware Factory ────────────────────────────

/**
 * Creates an Express middleware that validates req.body against a Zod schema.
 * Returns 400 with structured errors on validation failure.
 *
 * @param {z.ZodSchema} schema — Zod schema to validate against
 */
function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const errors = result.error.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message
            }));

            return res.status(400).json({
                success: false,
                message: errors[0].message, // Primary error for simple clients
                errors // Detailed errors for rich UIs
            });
        }

        // Replace req.body with parsed + transformed data
        req.body = result.data;
        next();
    };
}

module.exports = {
    signupSchema,
    loginSchema,
    chatSchema,
    itinerarySchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    updateProfileSchema,
    changePasswordSchema,
    deleteAccountSchema,
    validate
};
