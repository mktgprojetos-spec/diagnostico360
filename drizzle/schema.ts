import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, uniqueIndex } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  responsibleName: varchar("responsibleName", { length: 180 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }).notNull(),
  socialUrl: varchar("socialUrl", { length: 320 }),
  sector: varchar("sector", { length: 160 }).notNull(),
  size: varchar("size", { length: 80 }).notNull(),
  stage: varchar("stage", { length: 100 }),
  challenge: text("challenge"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const assessments = mysqlTable("assessments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  companyId: int("companyId").notNull(),
  version: varchar("version", { length: 24 }).notNull(),
  status: mysqlEnum("status", ["draft", "submitted", "in_review", "approved"]).default("draft").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed"]).default("pending").notNull(),
  stripeCheckoutSessionId: varchar("stripeCheckoutSessionId", { length: 255 }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  paidAt: timestamp("paidAt"),
  currentStep: int("currentStep").default(0).notNull(),
  overallScore: int("overallScore"),
  confidence: mysqlEnum("confidence", ["high", "moderate", "low"]),
  contextMoments: text("contextMoments"),
  contextChallenge: text("contextChallenge"),
  contextExpectation: text("contextExpectation"),
  submittedAt: timestamp("submittedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const assessmentAnswers = mysqlTable("assessment_answers", {
  id: int("id").autoincrement().primaryKey(),
  assessmentId: int("assessmentId").notNull(),
  questionId: varchar("questionId", { length: 8 }).notNull(),
  value: int("value"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  assessmentQuestionUnique: uniqueIndex("assessment_question_unique").on(table.assessmentId, table.questionId),
}));

export const assessmentReviews = mysqlTable("assessment_reviews", {
  id: int("id").autoincrement().primaryKey(),
  assessmentId: int("assessmentId").notNull(),
  reviewerId: int("reviewerId").notNull(),
  status: mysqlEnum("status", ["needs_review", "approved"]).notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const stripeEvents = mysqlTable("stripe_events", {
  id: varchar("id", { length: 255 }).primaryKey(),
  type: varchar("type", { length: 120 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Company = typeof companies.$inferSelect;
export type Assessment = typeof assessments.$inferSelect;
export type AssessmentAnswer = typeof assessmentAnswers.$inferSelect;
