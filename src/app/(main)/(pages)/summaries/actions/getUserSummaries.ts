import { db } from "@/server/db";
import { summaries } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function getUserSummaries(userId: number) {
  return db.select().from(summaries).where(eq(summaries.userId, userId));
}
