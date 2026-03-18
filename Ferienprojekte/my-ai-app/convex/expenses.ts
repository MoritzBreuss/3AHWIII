import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9]{7,15}$/;

// ═════════════════════════════════════════════
// SESSION AUTH HELPER
// ═════════════════════════════════════════════
async function authenticateSession(
  ctx: QueryCtx | MutationCtx,
  token: string
): Promise<Id<"users">> {
  if (!token) throw new Error("Nicht authentifiziert");

  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .first();

  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Sitzung abgelaufen. Bitte erneut anmelden.");
  }

  return session.userId;
}

// ═════════════════════════════════════════════
// DATE VALIDATION HELPER
// ═════════════════════════════════════════════
function validateDate(dateStr: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new Error("Ungueltiges Datumsformat (JJJJ-MM-TT erwartet)");
  }
  const parts = dateStr.split("-").map(Number);
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  if (
    date.getFullYear() !== parts[0] ||
    date.getMonth() !== parts[1] - 1 ||
    date.getDate() !== parts[2]
  ) {
    throw new Error("Ungueltiges Datum");
  }
  if (parts[0] < 2000 || parts[0] > 2100) {
    throw new Error("Datum muss zwischen 2000 und 2100 liegen");
  }
}

function normalizeEmail(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  if (!EMAIL_REGEX.test(normalized)) {
    throw new Error("Ungueltige E-Mail-Adresse");
  }
  return normalized;
}

function normalizePhone(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const normalized = trimmed.replace(/[\s().-]/g, "");
  if (!PHONE_REGEX.test(normalized)) {
    throw new Error("Ungueltige Telefonnummer");
  }
  return normalized;
}

function generateSplitGroupId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const randomHex = Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return `${Date.now().toString(36)}-${randomHex}`;
}

// ═════════════════════════════════════════════
// PEOPLE
// ═════════════════════════════════════════════

export const addPerson = mutation({
  args: {
    token: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await authenticateSession(ctx, args.token);

    const trimmedName = args.name.trim();
    if (trimmedName.length === 0) {
      throw new Error("Name darf nicht leer sein");
    }
    if (trimmedName.length > 50) {
      throw new Error("Name darf maximal 50 Zeichen lang sein");
    }

    const personId = await ctx.db.insert("people", {
      userId,
      name: trimmedName,
      phone: normalizePhone(args.phone),
      email: normalizeEmail(args.email),
      createdAt: Date.now(),
    });
    return personId;
  },
});

export const updatePerson = mutation({
  args: {
    token: v.string(),
    personId: v.id("people"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await authenticateSession(ctx, args.token);

    const person = await ctx.db.get(args.personId);
    if (!person || person.userId !== userId) {
      throw new Error("Nicht berechtigt");
    }

    const patch: { name?: string; phone?: string | undefined; email?: string | undefined } = {};
    if (args.name !== undefined) {
      const trimmed = args.name.trim();
      if (trimmed.length === 0) throw new Error("Name darf nicht leer sein");
      if (trimmed.length > 50) throw new Error("Name darf maximal 50 Zeichen lang sein");
      patch.name = trimmed;
    }
    if (args.phone !== undefined) {
      patch.phone = normalizePhone(args.phone);
    }
    if (args.email !== undefined) {
      patch.email = normalizeEmail(args.email);
    }

    await ctx.db.patch(args.personId, patch);
  },
});

export const removePerson = mutation({
  args: { token: v.string(), personId: v.id("people") },
  handler: async (ctx, args) => {
    const userId = await authenticateSession(ctx, args.token);

    const person = await ctx.db.get(args.personId);
    if (!person || person.userId !== userId) {
      throw new Error("Nicht berechtigt");
    }

    // Delete all expenses for this person first
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_person", (q) => q.eq("personId", args.personId))
      .collect();

    for (const expense of expenses) {
      await ctx.db.delete(expense._id);
    }

    await ctx.db.delete(args.personId);
  },
});

export const getPeople = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const userId = await authenticateSession(ctx, args.token);

    return await ctx.db
      .query("people")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// ═════════════════════════════════════════════
// EXPENSES
// ═════════════════════════════════════════════

export const addExpense = mutation({
  args: {
    token: v.string(),
    personId: v.id("people"),
    amount: v.number(),
    description: v.string(),
    category: v.optional(v.string()),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await authenticateSession(ctx, args.token);

    // Verify person belongs to user
    const person = await ctx.db.get(args.personId);
    if (!person || person.userId !== userId) {
      throw new Error("Nicht berechtigt");
    }

    const trimmedDesc = args.description.trim();
    if (trimmedDesc.length === 0) {
      throw new Error("Beschreibung darf nicht leer sein");
    }
    if (trimmedDesc.length > 200) {
      throw new Error("Beschreibung darf maximal 200 Zeichen lang sein");
    }
    if (args.amount <= 0) {
      throw new Error("Betrag muss groesser als 0 sein");
    }
    if (args.amount > 999999.99) {
      throw new Error("Betrag zu hoch");
    }

    validateDate(args.date);

    const expenseId = await ctx.db.insert("expenses", {
      userId,
      personId: args.personId,
      amount: Math.round(args.amount * 100) / 100,
      description: trimmedDesc,
      category: args.category?.trim() || undefined,
      date: args.date,
      createdAt: Date.now(),
    });
    return expenseId;
  },
});

export const updateExpense = mutation({
  args: {
    token: v.string(),
    expenseId: v.id("expenses"),
    amount: v.optional(v.number()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await authenticateSession(ctx, args.token);

    const expense = await ctx.db.get(args.expenseId);
    if (!expense || expense.userId !== userId) {
      throw new Error("Nicht berechtigt");
    }

    const patch: { amount?: number; description?: string; category?: string | undefined; date?: string } = {};

    if (args.amount !== undefined) {
      if (args.amount <= 0) throw new Error("Betrag muss groesser als 0 sein");
      if (args.amount > 999999.99) throw new Error("Betrag zu hoch");
      patch.amount = Math.round(args.amount * 100) / 100;
    }
    if (args.description !== undefined) {
      const trimmed = args.description.trim();
      if (trimmed.length === 0) throw new Error("Beschreibung darf nicht leer sein");
      if (trimmed.length > 200) throw new Error("Beschreibung darf maximal 200 Zeichen lang sein");
      patch.description = trimmed;
    }
    if (args.category !== undefined) {
      patch.category = args.category.trim() || undefined;
    }
    if (args.date !== undefined) {
      validateDate(args.date);
      patch.date = args.date;
    }

    await ctx.db.patch(args.expenseId, patch);
  },
});

export const removeExpense = mutation({
  args: { token: v.string(), expenseId: v.id("expenses") },
  handler: async (ctx, args) => {
    const userId = await authenticateSession(ctx, args.token);

    const expense = await ctx.db.get(args.expenseId);
    if (!expense || expense.userId !== userId) {
      throw new Error("Nicht berechtigt");
    }
    await ctx.db.delete(args.expenseId);
  },
});

// ═════════════════════════════════════════════
// COMBINED QUERY: people + all their expenses (fixes N+1)
// ═════════════════════════════════════════════
export const getPeopleWithExpenses = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const userId = await authenticateSession(ctx, args.token);

    const people = await ctx.db
      .query("people")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const allExpenses = await ctx.db
      .query("expenses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    // Group expenses by person
    const expensesByPerson = new Map<string, typeof allExpenses>();
    for (const expense of allExpenses) {
      const key = expense.personId;
      if (!expensesByPerson.has(key)) {
        expensesByPerson.set(key, []);
      }
      expensesByPerson.get(key)!.push(expense);
    }

    return people.map((person) => ({
      ...person,
      expenses: expensesByPerson.get(person._id) ?? [],
    }));
  },
});

// ═════════════════════════════════════════════
// SETTLE EXPENSE (toggle)
// ═════════════════════════════════════════════
export const settleExpense = mutation({
  args: { token: v.string(), expenseId: v.id("expenses") },
  handler: async (ctx, args) => {
    const userId = await authenticateSession(ctx, args.token);
    const expense = await ctx.db.get(args.expenseId);
    if (!expense || expense.userId !== userId) {
      throw new Error("Nicht berechtigt");
    }
    await ctx.db.patch(args.expenseId, { settled: !expense.settled });
  },
});

// ═════════════════════════════════════════════
// SETTLE ALL FOR PERSON
// ═════════════════════════════════════════════
export const settleAllForPerson = mutation({
  args: { token: v.string(), personId: v.id("people") },
  handler: async (ctx, args) => {
    const userId = await authenticateSession(ctx, args.token);
    const person = await ctx.db.get(args.personId);
    if (!person || person.userId !== userId) {
      throw new Error("Nicht berechtigt");
    }
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_user_and_person", (q) =>
        q.eq("userId", userId).eq("personId", args.personId)
      )
      .collect();
    for (const e of expenses) {
      if (!e.settled) {
        await ctx.db.patch(e._id, { settled: true });
      }
    }
  },
});

// ═════════════════════════════════════════════
// SPLIT EXPENSE
// ═════════════════════════════════════════════
export const splitExpense = mutation({
  args: {
    token: v.string(),
    personIds: v.array(v.id("people")),
    totalAmount: v.number(),
    description: v.string(),
    category: v.optional(v.string()),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await authenticateSession(ctx, args.token);

    if (args.personIds.length < 2) {
      throw new Error("Mindestens 2 Personen zum Aufteilen erforderlich");
    }
    if (args.totalAmount <= 0 || args.totalAmount > 999999.99) {
      throw new Error("Ungueltiger Betrag");
    }
    const trimmedDesc = args.description.trim();
    if (!trimmedDesc || trimmedDesc.length > 200) {
      throw new Error("Ungueltige Beschreibung");
    }
    validateDate(args.date);

    for (const personId of args.personIds) {
      const person = await ctx.db.get(personId);
      if (!person || person.userId !== userId) {
        throw new Error("Nicht berechtigt");
      }
    }

    const splitGroupId = generateSplitGroupId();
    const perPerson =
      Math.floor((args.totalAmount * 100) / args.personIds.length) / 100;
    const remainder =
      Math.round((args.totalAmount - perPerson * args.personIds.length) * 100) / 100;

    for (let i = 0; i < args.personIds.length; i++) {
      const personId = args.personIds[i];
      await ctx.db.insert("expenses", {
        userId,
        personId,
        amount: i === 0 ? perPerson + remainder : perPerson,
        description: trimmedDesc,
        category: args.category?.trim() || undefined,
        date: args.date,
        settled: false,
        splitGroupId,
        createdAt: Date.now(),
      });
    }
    return splitGroupId;
  },
});