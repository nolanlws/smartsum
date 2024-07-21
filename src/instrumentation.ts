import { OpenAI } from "openai";
import { Highlight } from "./app/api/highlights/route";

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: "", // Replace with your actual OpenAI API key
});

async function createSummary(
  highlights: Highlight[],
  notes: string[],
  url: string,
): Promise<{ title: string; summary: string; categories: string[] }> {
  const prompt = `
  You are a highly intelligent and proficient assistant tasked with creating a summary for the provided content. 
  Summarize the provided highlights and notes while contextualizing them within the website's overall content.
  
  Highlights:
  ${highlights.map((highlight, index) => `${index + 1}. ${highlight.text}`).join("\n")}

  Notes:
  ${notes.map((note, index) => `${index + 1}. ${note}`).join("\n")}

  URL:
  ${url}

  Instructions:
  - Create an extensive summary that integrates ALL of the provided highlights and notes and use the content of the provided website to ensure the summary is relevant and informative.
  - The summary MUST ALWAYS contain the ALL the provided highlights and notes.
  - Format the summary in HTML.
  - Give the summary a title.
  - Categorize the highlights and notes into really relevant categories (as many as you see fit), choose from the following categories: 
      Science
      Technology
      Health
      Education
      Environment
      Politics
      Economics
      Business
      Finance
      Culture
      Art
      History
      Sports
      Entertainment
      Literature
      Music
      Movies
      Television
      Theater
      Fashion
      Travel
      Food
      Lifestyle
      Personal Development
      Psychology
      Sociology
      Philosophy
      Religion
      Ethics
      Law
      Crime
      Conflict
      War
      Peace
      Human Rights
      Gender
      Diversity
      Technology
      Innovation
      Engineering
      Space
      Biology
      Chemistry
      Physics
      Mathematics
      Astronomy
      Geography
      Anthropology
      Archaeology
      Architecture
      Automotive
      Aviation
      Maritime
      Real Estate
      Urban Development
      Agriculture
      Food Science
      Nutrition
      Fitness
      Wellness
      Mental Health
      Medicine
      Veterinary Science
      Genetics
      Microbiology
      Ecology
      Zoology
      Botany
      Environmental Science
      Climate Change
      Renewable Energy
      Sustainability
      Natural Resources
      Wildlife Conservation
      Marine Biology
      Forestry
      Geology
      Seismology
      Volcanology
      Meteorology
      Oceanography
      Astrophysics
      Cosmology
      Nanotechnology
      Robotics
      Artificial Intelligence
      Cybersecurity
      Data Science
      Blockchain
      Virtual Reality
      Augmented Reality
      Gaming
      E-commerce
      Marketing
      Advertising
      Public Relations
      Communications
      Journalism
      Social Media
      Publishing
  ALWAYS return an object with the following structure:
  {
    "title": "The title of the summary",
    "summary": "The summary text",
    "categories": ["Category1", "Category2", ...]
  }
    
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
      n: 1,
    });
    console.log(response.choices[0]?.message);
    if (response.choices[0]?.message?.content) {
      console.log(response.choices[0]?.message?.content);
      const parsed = JSON.parse(response.choices[0]?.message?.content);
      if (parsed.title && parsed.summary && Array.isArray(parsed.categories)) {
        return parsed;
      }
      throw new Error("Unexpected response format from OpenAI");
    } else {
      throw new Error("No response from OpenAI");
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error creating summary:", error);
      return {
        summary: `Error creating summary: ${error.message}`,
        title: "Error",
        categories: [],
      };
    } else {
      console.error("Unknown error:", error);
      return {
        summary: "An unknown error occurred while creating the summary.",
        title: "Error",
        categories: [],
      };
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
          .set({
            summary: summary.summary,
            title: summary.title,
            categories: JSON.stringify(summary.categories),
          })
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
