import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { goal, currentDateTime } = await req.json();

    if (!goal || typeof goal !== "string") {
      return NextResponse.json({ error: "Goal is required" }, { status: 400 });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENROUTER_API_KEY in .env.local" },
        { status: 500 }
      );
    }
    const createdAt = new Date().toISOString();

    const prompt = `
You are an AI quest planner for a gamified productivity SaaS.

Current date/time:
${currentDateTime}

User goal:
${goal}

Create a weekly quest plan spread across Monday to Sunday.

Rules:
- MAIN QUESTS are high-priority goals.
- SIDE QUESTS are low-priority goals.
- Main quests must be broken into 3 or more tasks.
- Side quests must be broken into 2 or fewer tasks.
- Every task must have a day from Monday to Sunday.
- Spread tasks realistically across the week.
- High priority tasks should appear before low priority tasks.
- High priority tasks use codes: 1.0, 1.1, 1.2, 1.3...
- Low priority tasks use codes: 2.0, 2.1, 2.2...
- High priority tasks give 50 XP each task.
- Low priority tasks give 30 XP task.
- MAIN QUESTS give 200 XP when all their tasks are completed.
- LOW QUESTS give 100 XP when all their taska are completed.
- Each task object must include its own "xp" value.
- Each quest object must include its own "completionXp" value.
- Level increases every 3000 XP.
- Badge is awarded every 10 levels.
- completed must always be false.
- createdAt must use this timestamp: ${createdAt}
Due date rules:
- Do NOT invent due dates.
- Only include a dueDate if the user explicitly provides one.
- If the user says "due Friday", "by Sunday", "deadline 15 May", or similar, convert it to ISO format using currentDateTime.
- If the user does not provide a due date, set dueDate to null.
- Main quests and side quests must each have a dueDate field.


Return ONLY valid JSON.
No markdown.
No explanation.

JSON format:
{
  "weeklyOverview": {
    "Monday": [],
    "Tuesday": [],
    "Wednesday": [],
    "Thursday": [],
    "Friday": [],
    "Saturday": [],
    "Sunday": []
  },
  "mainQuests": [
    {
      "title": "Main quest title",
      "type": "main",
      "dueDate": null,
      "completionXp": 200,
      "tasks": [
        {
          "code": "1.0",
          "day": "Monday",
          "text": "Task text",
          "priority": "high",
          "xp": 50,
          "completed": false,
          "createdAt": "${createdAt}",
          "questTitle": "Main quest title",
          "questType": "main"
        }
      ]
    }
  ],
  "sideQuests": [
    {
      "title": "Side quest title",
      "type": "side",
      "dueDate": null,
      "completionXp": 100,
      "tasks": [
        {
          "code": "2.0",
          "day": "Wednesday",
          "text": "Task text",
          "priority": "low",
          "xp": 30,
          "completed": false,
          "createdAt": "${createdAt}",
          "questTitle": "Side quest title",
          "questType": "side"
        }
      ]
    }
  ],
  "levelRules": {
    "xpPerLevel": 30,
    "badgeEveryLevels": 10
  }
}

Important:
- weeklyOverview must include ALL tasks grouped by day.
- weeklyOverview tasks must include: code, day, text, priority, xp, completed, createdAt, questTitle, questType.
- mainQuests should only contain main/high-priority quests.
- sideQuests should only contain side/low-priority quests.
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Quest It",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.4,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "OpenRouter failed", details: data },
        { status: 500 }
      );
    }

    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      return NextResponse.json(
        { error: "No AI response", details: data },
        { status: 500 }
      );
    }

    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json({ quests: parsed.quests || [] });
  } catch (error) {
    return NextResponse.json(
      { error: "Server error", details: String(error) },
      { status: 500 }
    );
  }
}