import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 10;
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15-minute window
const MAX_LOGIN_ATTEMPTS = 10; // per window
const PASSWORD_MIN_LENGTH = 10;

// Generate a random session token
function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function validatePassword(password: string, fieldLabel: string): void {
  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new Error(`${fieldLabel} muss mindestens ${PASSWORD_MIN_LENGTH} Zeichen lang sein`);
  }
  if (password.length > 128) {
    throw new Error(`${fieldLabel} darf maximal 128 Zeichen lang sein`);
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    throw new Error(`${fieldLabel} muss Gross-/Kleinbuchstaben und Zahlen enthalten`);
  }
}

// ═════════════════════════════════════════════
// REGISTRATION
// ═════════════════════════════════════════════
export const register = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const trimmedUsername = args.username.trim().toLowerCase();

    if (trimmedUsername.length < 3) {
      throw new Error("Benutzername muss mindestens 3 Zeichen lang sein");
    }
    if (trimmedUsername.length > 30) {
      throw new Error("Benutzername darf maximal 30 Zeichen lang sein");
    }
    if (!/^[a-z0-9._-]+$/.test(trimmedUsername)) {
      throw new Error("Benutzername darf nur Buchstaben, Zahlen, Punkte, Bindestriche und Unterstriche enthalten");
    }
    validatePassword(args.password, "Passwort");

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", trimmedUsername))
      .first();

    if (existingUser) {
      throw new Error("Benutzername bereits vergeben. Bitte anmelden oder einen anderen Namen waehlen.");
    }

    // Hash with bcrypt (per-user random salt built in)
    const hashedPassword = bcrypt.hashSync(args.password, BCRYPT_ROUNDS);

    const userId = await ctx.db.insert("users", {
      username: trimmedUsername,
      hashedPassword,
      createdAt: Date.now(),
    });

    // Create session
    const token = generateToken();
    await ctx.db.insert("sessions", {
      userId,
      token,
      expiresAt: Date.now() + SESSION_DURATION_MS,
      createdAt: Date.now(),
    });

    return { userId, username: trimmedUsername, sessionToken: token };
  },
});

// ═════════════════════════════════════════════
// LOGIN
// ═════════════════════════════════════════════
export const login = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const trimmedUsername = args.username.trim().toLowerCase();
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW_MS;

    // ── Rate Limiting ──
    const allAttempts = await ctx.db
      .query("loginAttempts")
      .withIndex("by_username", (q) => q.eq("username", trimmedUsername))
      .collect();

    const staleAttempts = allAttempts.filter(
      (attempt) =>
        (attempt.lockedUntil !== undefined && attempt.lockedUntil <= now) ||
        (attempt.lockedUntil === undefined && attempt.attemptAt <= windowStart)
    );
    for (const stale of staleAttempts) {
      await ctx.db.delete(stale._id);
    }

    const staleAttemptIds = new Set(staleAttempts.map((attempt) => attempt._id));
    const activeAttempts = allAttempts.filter(
      (attempt) => !staleAttemptIds.has(attempt._id)
    );

    // Check if account is locked
    const lockRecord = activeAttempts.find(
      (attempt) => attempt.lockedUntil !== undefined && attempt.lockedUntil > now
    );
    if (lockRecord) {
      const remainingMs = (lockRecord.lockedUntil ?? now) - now;
      const remainingMin = Math.ceil(remainingMs / 60000);
      throw new Error(`Konto gesperrt. Bitte warte ${remainingMin} Minute(n).`);
    }

    const recentAttempts = activeAttempts.filter(
      (attempt) => attempt.lockedUntil === undefined && attempt.attemptAt > windowStart
    );
    if (recentAttempts.length >= MAX_LOGIN_ATTEMPTS) {
      // Lock the account for 15 minutes
      await ctx.db.insert("loginAttempts", {
        username: trimmedUsername,
        attemptAt: now,
        lockedUntil: now + 15 * 60 * 1000,
      });
      throw new Error("Zu viele Anmeldeversuche. Konto fuer 15 Minuten gesperrt.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", trimmedUsername))
      .first();

    if (!user) {
      bcrypt.hashSync(args.password, BCRYPT_ROUNDS);
      await ctx.db.insert("loginAttempts", {
        username: trimmedUsername,
        attemptAt: Date.now(),
      });
      throw new Error("Benutzername oder Passwort falsch");
    }

    const isValid = bcrypt.compareSync(args.password, user.hashedPassword);
    if (!isValid) {
      await ctx.db.insert("loginAttempts", {
        username: trimmedUsername,
        attemptAt: Date.now(),
      });
      throw new Error("Benutzername oder Passwort falsch");
    }

    // Success — clear attempts
    for (const attempt of recentAttempts) {
      await ctx.db.delete(attempt._id);
    }

    // Create session
    const token = generateToken();
    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expiresAt: Date.now() + SESSION_DURATION_MS,
      createdAt: Date.now(),
    });

    return { userId: user._id, username: user.username, sessionToken: token };
  },
});

// ═════════════════════════════════════════════
// SESSION VALIDATION
// ═════════════════════════════════════════════
export const validateSession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    if (!args.token) return null;

    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    const user = await ctx.db.get(session.userId);
    if (!user) return null;

    return { userId: user._id, username: user.username };
  },
});

export const refreshSession = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    if (!args.token) return null;

    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session) {
      return null;
    }

    if (session.expiresAt < Date.now()) {
      await ctx.db.delete(session._id);
      return null;
    }

    const user = await ctx.db.get(session.userId);
    if (!user) {
      await ctx.db.delete(session._id);
      return null;
    }

    const newToken = generateToken();
    await ctx.db.patch(session._id, {
      token: newToken,
      expiresAt: Date.now() + SESSION_DURATION_MS,
    });

    return { userId: user._id, username: user.username, sessionToken: newToken };
  },
});

export const cleanupExpiredSessions = mutation({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const max = Math.min(Math.max(args.limit ?? 500, 1), 5000);
    const sessions = await ctx.db.query("sessions").order("asc").take(max);
    const now = Date.now();
    let deleted = 0;

    for (const session of sessions) {
      if (session.expiresAt < now) {
        await ctx.db.delete(session._id);
        deleted += 1;
      }
    }

    return { checked: sessions.length, deleted };
  },
});

// ═════════════════════════════════════════════
// LOGOUT (invalidate session)
// ═════════════════════════════════════════════
export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

// ═════════════════════════════════════════════
// CHANGE PASSWORD
// ═════════════════════════════════════════════
export const changePassword = mutation({
  args: {
    token: v.string(),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Sitzung abgelaufen. Bitte erneut anmelden.");
    }

    const user = await ctx.db.get(session.userId);
    if (!user) {
      throw new Error("Benutzer nicht gefunden");
    }

    // Verify current password
    const isValid = bcrypt.compareSync(args.currentPassword, user.hashedPassword);
    if (!isValid) {
      throw new Error("Aktuelles Passwort ist falsch");
    }

    validatePassword(args.newPassword, "Neues Passwort");

    // Hash new password
    const hashedPassword = bcrypt.hashSync(args.newPassword, BCRYPT_ROUNDS);
    await ctx.db.patch(user._id, { hashedPassword });

    // Invalidate all other sessions
    const allSessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const s of allSessions) {
      if (s._id !== session._id) {
        await ctx.db.delete(s._id);
      }
    }

    return { success: true };
  },
});

// ═════════════════════════════════════════════
// DELETE ACCOUNT
// ═════════════════════════════════════════════
export const deleteAccount = mutation({
  args: {
    token: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Sitzung abgelaufen");
    }

    const user = await ctx.db.get(session.userId);
    if (!user) {
      throw new Error("Benutzer nicht gefunden");
    }

    const isValid = bcrypt.compareSync(args.password, user.hashedPassword);
    if (!isValid) {
      throw new Error("Passwort falsch");
    }

    // Delete all expenses
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const e of expenses) {
      await ctx.db.delete(e._id);
    }

    // Delete all people
    const people = await ctx.db
      .query("people")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const p of people) {
      await ctx.db.delete(p._id);
    }

    // Delete all sessions
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const s of sessions) {
      await ctx.db.delete(s._id);
    }

    // Delete login attempts for this username
    const loginAttempts = await ctx.db
      .query("loginAttempts")
      .withIndex("by_username", (q) => q.eq("username", user.username))
      .collect();
    for (const la of loginAttempts) {
      await ctx.db.delete(la._id);
    }

    // Delete user
    await ctx.db.delete(user._id);

    return { success: true };
  },
});

// ═════════════════════════════════════════════
// GET USER (legacy compatibility)
// ═════════════════════════════════════════════
export const getUser = query({
  args: { userId: v.id("users"), token: v.string() },
  handler: async (ctx, args) => {
    // Validate session before returning user data
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Sitzung abgelaufen. Bitte erneut anmelden.");
    }

    if (session.userId !== args.userId) {
      throw new Error("Nicht berechtigt");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    return { _id: user._id, username: user.username };
  },
});