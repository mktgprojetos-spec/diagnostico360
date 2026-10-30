import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { assessmentAnswers, assessmentReviews, assessments, companies, InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = 'admin';
    updateSet.role = 'admin';
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCompanyForUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.select().from(companies).where(eq(companies.userId, userId)).orderBy(desc(companies.updatedAt)).limit(1);
  return result[0] ?? null;
}

export async function getCompanyById(companyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.select().from(companies).where(eq(companies.id, companyId)).limit(1);
  return result[0] ?? null;
}

export async function saveCompany(userId: number, input: Omit<typeof companies.$inferInsert, "userId" | "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const existing = await getCompanyForUser(userId);
  if (existing) {
    await db.update(companies).set({ ...input, updatedAt: new Date() }).where(and(eq(companies.id, existing.id), eq(companies.userId, userId)));
    return { ...existing, ...input };
  }
  const result = await db.insert(companies).values({ ...input, userId });
  const insertedId = Number(result[0].insertId);
  const created = await db.select().from(companies).where(eq(companies.id, insertedId)).limit(1);
  return created[0];
}

export async function createAssessment(userId: number, companyId: number, version: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(assessments).values({ userId, companyId, version, status: "draft", currentStep: 0 });
  const id = Number(result[0].insertId);
  const created = await db.select().from(assessments).where(eq(assessments.id, id)).limit(1);
  return created[0];
}

export async function getAssessmentForUser(assessmentId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.select().from(assessments).where(and(eq(assessments.id, assessmentId), eq(assessments.userId, userId))).limit(1);
  return result[0] ?? null;
}

export async function getAssessmentById(assessmentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.select().from(assessments).where(eq(assessments.id, assessmentId)).limit(1);
  return result[0] ?? null;
}

export async function getAnswers(assessmentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select().from(assessmentAnswers).where(eq(assessmentAnswers.assessmentId, assessmentId));
}

export async function saveAnswers(assessmentId: number, answers: Record<string, number | null>, currentStep: number, status: "draft" | "submitted") {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.delete(assessmentAnswers).where(eq(assessmentAnswers.assessmentId, assessmentId));
  const rows = Object.entries(answers).map(([questionId, value]) => ({ assessmentId, questionId, value }));
  if (rows.length) await db.insert(assessmentAnswers).values(rows);
  const { calculateDiagnostic } = await import("./diagnostic");
  const result = calculateDiagnostic(answers);
  await db.update(assessments).set({
    currentStep,
    status,
    overallScore: result.overallScore,
    confidence: result.confidence,
    submittedAt: status === "submitted" ? new Date() : undefined,
    updatedAt: new Date(),
  }).where(eq(assessments.id, assessmentId));
  return result;
}

export async function getAssessmentsForUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select().from(assessments).where(eq(assessments.userId, userId)).orderBy(desc(assessments.updatedAt));
}

export async function addReview(assessmentId: number, reviewerId: number, status: "needs_review" | "approved", note: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(assessmentReviews).values({ assessmentId, reviewerId, status, note });
  await db.update(assessments).set({ status: status === "approved" ? "approved" : "in_review", updatedAt: new Date() }).where(eq(assessments.id, assessmentId));
}
