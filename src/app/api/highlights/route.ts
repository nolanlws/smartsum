import { db } from "@/server/db";
import { summaries, highlights, notes } from "@/server/db/schema";
import { NextResponse, type NextRequest } from "next/server";
import { summaryQueue } from "@/server/queues"; // Import the queue

export type Highlight = {
  text: string;
  timestamp: string;
};

type HighlightRequest = {
  token: string;
  url: string;
  highlights: Highlight[];
  notes: string[];
};

export async function POST(req: NextRequest) {
  const {
    token,
    url,
    highlights: highlightsList,
    notes: notesList,
  }: HighlightRequest = await req.json();

  if (!token || !url || !highlightsList || highlightsList.length === 0) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  try {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, 1), // Hardcoded user ID for now need generate token
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const summaryResult = await db
      .insert(summaries)
      .values({
        userId: user.id,
        url,
        summary: "", // Empty summary initially
        title: "",
        categories: "[]",
        read: false,
      })
      .returning({ insertedId: summaries.id });
    const summaryId = summaryResult[0]?.insertedId;

    if (!summaryId) {
      return NextResponse.json(
        { error: "Error creating summary" },
        { status: 500 },
      );
    }

    const highlightsInsert = highlightsList.map((text) => ({
      userId: user.id,
      summaryId,
      text: text.text,
    }));

    await db.insert(highlights).values(highlightsInsert);

    const notesInsert = notesList.map((text) => ({
      userId: user.id,
      summaryId,
      text,
    }));

    await db.insert(notes).values(notesInsert);

    // Add job to the queue for summary generation, including notes
    const job = await summaryQueue.add("generateSummary", {
      highlights: highlightsList,
      notes: notesList,
      url,
      summaryId,
    });

    console.log(`Job added with ID ${job.id}`);

    return NextResponse.json(
      {
        message:
          "Highlights, notes, and summary stored successfully. Summary generation is in progress.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error storing highlights, notes, and summary:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
