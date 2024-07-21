import {
  integer,
  pgTableCreator,
  pgEnum,
  serial,
  timestamp,
  varchar,
  numeric,
  text,
  boolean,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `smartsum_${name}`);
// Takes an enum and return an array with each values

type Enum = Record<string, string>;

// Utility function to convert TypeScript enum to a Postgres enum
export function enumToPgEnum<T extends Enum>(myEnum: T): [string, ...string[]] {
  const values = Object.values(myEnum).map((value) => `${value}`);
  if (values.length === 0) {
    throw new Error("Enum must have at least one value");
  }
  return values as [string, ...string[]];
}

// Define an enum
export enum PaymentType {
  UNLIMITED_ACCESS = "unlimited_access",
  CREDIT_BASED = "credit_based",
}

// Declare drizzle enum
export const typeEnum = pgEnum("type", enumToPgEnum(PaymentType));

export const users = createTable("users", {
  id: serial("id").primaryKey(),
  clerkId: varchar("clerk_id", { length: 256 }).unique().notNull(),
  email: varchar("email", { length: 256 }).unique().notNull(),
  firstName: varchar("first_name", { length: 256 }).notNull(),
  lastName: varchar("last_name", { length: 256 }).notNull(),
  avatarUrl: varchar("avatar_url", { length: 1024 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  subscriptions: one(subscriptions),
  oneTimePayments: many(oneTimePayments),
  invoices: many(invoices),
  summaries: many(summaries),
  highlights: many(highlights),
  usage: many(usage),
}));

export const subscriptions = createTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull()
    .unique(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 256 })
    .unique()
    .notNull(),
  status: varchar("status", { length: 50 }).notNull(), // e.g., 'active', 'canceled'
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const oneTimePayments = createTable("one_time_payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  stripePaymentId: varchar("stripe_payment_id", { length: 256 })
    .unique()
    .notNull(),
  type: typeEnum("type"),
  credits: numeric("credits"), // null if type is 'unlimited_access'
  status: varchar("status", { length: 50 }).notNull(), // e.g., 'succeeded', 'failed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const oneTimePaymentsRelations = relations(
  oneTimePayments,
  ({ one }) => ({
    user: one(users, {
      fields: [oneTimePayments.userId],
      references: [users.id],
    }),
  }),
);

export const usage = createTable("usage", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  usage: numeric("usage").notNull(), // e.g., number of API calls
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

export const usageRelations = relations(usage, ({ one }) => ({
  user: one(users, {
    fields: [usage.userId],
    references: [users.id],
  }),
}));

export const invoices = createTable("invoices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  stripeInvoiceId: varchar("stripe_invoice_id", { length: 256 })
    .unique()
    .notNull(),
  amountDue: numeric("amount_due").notNull(),
  amountPaid: numeric("amount_paid").notNull(),
  status: varchar("status", { length: 50 }).notNull(), // e.g., 'paid', 'pending'
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const invoicesRelations = relations(invoices, ({ one }) => ({
  user: one(users, {
    fields: [invoices.userId],
    references: [users.id],
  }),
}));

export const summaries = createTable("summaries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  url: varchar("url", { length: 1024 }).notNull(),
  summary: text("summary").notNull(),
  categories: text("categories").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const summariesRelations = relations(summaries, ({ one }) => ({
  user: one(users, {
    fields: [summaries.userId],
    references: [users.id],
  }),
}));

export const highlights = createTable("highlights", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  summaryId: integer("summary_id")
    .references(() => summaries.id)
    .notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const highlightsRelations = relations(highlights, ({ one }) => ({
  user: one(users, {
    fields: [highlights.userId],
    references: [users.id],
  }),
  summary: one(summaries, {
    fields: [highlights.summaryId],
    references: [summaries.id],
  }),
}));

export const notes = createTable("notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  summaryId: integer("summary_id")
    .references(() => summaries.id)
    .notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
  summary: one(summaries, {
    fields: [notes.summaryId],
    references: [summaries.id],
  }),
}));
