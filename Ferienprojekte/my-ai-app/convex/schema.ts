import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    hashedPassword: v.string(),
    createdAt: v.number(),
  }).index("by_username", ["username"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"]),

  people: defineTable({
    userId: v.id("users"),
    name: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  expenses: defineTable({
    userId: v.id("users"),
    personId: v.id("people"),
    amount: v.number(),
    description: v.string(),
    category: v.optional(v.string()),
    date: v.string(),
    settled: v.optional(v.boolean()),
    splitGroupId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_person", ["personId"])
    .index("by_user_and_person", ["userId", "personId"]),

  loginAttempts: defineTable({
    username: v.string(),
    attemptAt: v.number(),
    lockedUntil: v.optional(v.number()),
  }).index("by_username", ["username"]),
});