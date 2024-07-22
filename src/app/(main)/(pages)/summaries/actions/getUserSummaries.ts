import { db } from "@/server/db";
import { summaries, notes, highlights } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function getUserSummaries(userId: number) {
  const result = await db
    .select({
      summaryId: summaries.id,
      userId: summaries.userId,
      title: summaries.title,
      url: summaries.url,
      summary: summaries.summary,
      categories: summaries.categories,
      read: summaries.read,
      createdAt: summaries.createdAt,
      notes: notes.text, // Select the notes text
      highlights: highlights.text, // Select the highlights text
    })
    .from(summaries)
    .leftJoin(notes, eq(notes.summaryId, summaries.id))
    .leftJoin(highlights, eq(highlights.summaryId, summaries.id))
    .where(eq(summaries.userId, userId));

  // Group the results by summaryId
  const summariesMap = result.reduce((acc: any, row: any) => {
    if (!acc[row.summaryId]) {
      acc[row.summaryId] = {
        id: row.summaryId,
        userId: row.userId,
        title: row.title,
        url: row.url,
        summary: row.summary,
        categories: row.categories,
        read: row.read,
        createdAt: row.createdAt,
        notes: [],
        highlights: [],
      };
    }
    if (row.notes) {
      acc[row.summaryId].notes.push(row.notes);
    }
    if (row.highlights) {
      acc[row.summaryId].highlights.push(row.highlights);
    }
    return acc;
  }, {});

  return Object.values(summariesMap);
}
