import { OpenAI } from "openai";

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: "", // Replace with your actual OpenAI API key
});

async function createSummary(
  highlights: string[],
  notes: string[],
  url: string,
): Promise<string> {
  const prompt = `
  You are a highly intelligent and proficient assistant tasked with creating a summary for the provided content. 
  Your summary must include 100% of the highlights and notes while contextualizing them within the website's overall content.
  
  Highlights:
  ${highlights.map((highlight, index) => `${index + 1}. ${highlight}`).join("\n")}

  Notes:
  ${notes.map((note, index) => `${index + 1}. ${note}`).join("\n")}

  URL:
  ${url}

  Instructions:
  - Create a coherent and concise summary that seamlessly integrates the highlights and notes.
  - Use the context of the website to ensure the summary is relevant and informative.
  - Format the summary in HTML.
  - Categorize the highlights and notes into relevant sections.

  Summary:
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
      n: 1,
      stop: ["Summary:"],
    });

    if (response.choices[0]?.message?.content) {
      return response.choices[0].message.content;
    } else {
      throw new Error("No response from OpenAI");
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error creating summary:", error);
      return `Error creating summary: ${error.message}`;
    } else {
      console.error("Unknown error:", error);
      return "An unknown error occurred while creating the summary.";
    }
  }
}

export const register = async () => {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { Worker } = await import("bullmq");
    const { connection } = await import("./server/redis");
    const { summaries } = await import("./server/db/schema");
    const { db } = await import("./server/db");
    const { eq } = await import("drizzle-orm");

    new Worker(
      "summaryQueue",
      async (job) => {
        const { highlights, notes, summaryId, url } = job.data;
        const summary = await createSummary(highlights, notes, url);
        console.log(summary);
        await db
          .update(summaries)
          .set({ summary })
          .where(eq(summaries.id, summaryId));
      },
      {
        connection,
        concurrency: 10,
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      },
    );
  }
};
