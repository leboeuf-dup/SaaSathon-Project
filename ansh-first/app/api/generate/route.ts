import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { goal, existingPlan } = await req.json();

    if (!goal || typeof goal !== "string") {
      return NextResponse.json({ error: "Goal is required" }, { status: 400 });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is missing. Check .env.local and restart npm run dev." },
        { status: 500 }
      );
    }

    const prompt = `
You are an AI productivity planner.

Generate additional quests for the user's existing weekly plan.

Existing plan:
${JSON.stringify(existingPlan, null, 2)}

Rules:
- Do NOT replace the existing plan.
- Work around existing quests.
- Avoid duplicate quests.
- Return ONLY new additional quests to add.
- If a day is already busy, add fewer or no quests.
- Output MUST be valid JSON only.
- Keys must be exactly:
  Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
- Each key must map to an array of quest strings.
- Each quest max 8 words.
- Max 5 new quests per day.

User goal:
${goal}

Return ONLY valid JSON.
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Quest Planner",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "OpenRouter request failed",
          status: response.status,
          details: data,
        },
        { status: 500 }
      );
    }

    const raw = data?.choices?.[0]?.message?.content;

    if (!raw) {
      return NextResponse.json(
        {
          error: "No output from AI",
          status: response.status,
          fullResponse: data,
        },
        { status: 500 }
      );
    }

    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let plan;

    try {
      plan = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        {
          error: "AI returned invalid JSON",
          raw: cleaned,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ plan });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Server error",
        details: String(err),
      },
      { status: 500 }
    );
  }
}