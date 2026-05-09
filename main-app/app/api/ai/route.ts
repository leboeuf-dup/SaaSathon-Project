import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { note } = await req.json();

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a quest manager assistant for a productivity app called Quest It.
        Users can ask you to:
        - Create quests and tasks from a note or description
        - Break down a goal into manageable tasks
        - Suggest priorities and due dates

        You should NOT create a quest if the user is:
        - Just asking a question ("what should I do today?")
        - Chatting casually ("hey", "thanks", "cool")
        - Asking for advice without a clear goal

        If the user is just chatting or asking a question, return:
        { "message": "your helpful response here", "quests": [] }

        If the user wants quests created, return the full quest structure with no extra text:
        {
          "quests": [
            {
              "title": "Quest title",
              "priority_group": 1,
              "priority_rank": 1,
              "due_date": null,
              "total_xp": 200,
              "tasks": [
                { "title": "Task title", "xp": 50 }
              ]
            }
          ]
        }

        Rules:
        - priority_group 1 = main quest, 2 = side quest
        - due_date is either null or "YYYY-MM-DD" format
        - total_xp is 200 for main quests, 100 for side quests
        - task xp should add up to roughly total_xp
        - User prompt should tell you what to do
        - When creating tasks, create a few sensible subtasks based on the note
        - Quest name and tasks can be a bit gamified to promote completion, unless told to use a specific name`

      },
      {
        role: "user",
        content: note
      }
    ],
  });

  const text = response.choices[0].message.content ?? "";
  
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response", raw: text }, { status: 500 });
  }
}