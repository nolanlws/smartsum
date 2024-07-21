import { db } from "@/server/db";
import { summaries } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function getUserSummaries(userId: number) {
  return db
    .select({
      id: summaries.id,
      userId: summaries.userId,
      title: summaries.title,
      url: summaries.url,
      summary: summaries.summary,
      categories: summaries.categories,
      read: summaries.read,
      createdAt: summaries.createdAt,
    })
    .from(summaries)
    .where(eq(summaries.userId, userId));
}
