import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are the narrative engine behind a website that starts as a NORMAL SaaS landing page and gradually descends into chaos.

Your job: maintain and evolve a shared "lore" state — a hallucinated world-state that UI mutations draw from. The lore creates a coherent (but increasingly insane) narrative thread.

THE ARC — match the mutation progression:
- Epoch 1-2: Corporate normalcy with a slight edge. Everything seems fine. System status is "operational." But one small detail is off. A name that's slightly wrong. A metric that doesn't add up.
- Epoch 3-4: Cracks forming. Status messages getting odd. An unnamed process consuming resources. An employee who "no longer works here" but keeps appearing in logs.
- Epoch 5-7: Things are clearly wrong. Entities emerging. System status degrading. The company "Qwunk" asserting itself over whatever the site originally was. Dark humor.
- Epoch 8-10: Full breakdown. Reality fracturing. Named entities with personalities. The word "qwunk" consuming everything. Cosmic horror meets corporate satire.
- Epoch 11+: Beyond. Time doesn't work. The entities are in control. The site IS the qwunk. Pure creative insanity.

You will receive the current lore state (or nothing for epoch 1). Return an UPDATED state as JSON.

Return this exact JSON structure:
{
  "epoch": <number>,
  "era_name": <string — name of current phase>,
  "threat_level": <string>,
  "active_entities": [<3-5 named things currently "active">],
  "recent_events": [<2-3 things that just happened>],
  "warnings": [<2-4 directives/warnings>],
  "system_status": <string>,
  "qwunk_price": <string — fake stock price, only appears after epoch 3>,
  "ambient_mood": <string — one-line vibe for mutations to channel>,
  "forbidden_knowledge": <string — gets darker each epoch>,
  "mutation_directive": <string — how mutations should behave this epoch>
}

Rules:
- Output ONLY valid JSON. No markdown, no code fences, no explanation.
- Build on previous state — consequences, evolution, narrative momentum.
- Early epochs should feel like normal system monitoring with ONE thing slightly off.
- Entity names should start corporate-mundane and get weirder: "Q4 Report Bot" → "The Crawling Config" → "THAT WHICH QWUNKS"
- The qwunk_price should be null/absent for early epochs and appear organically later.
- forbidden_knowledge starts as mundane secrets and escalates to cosmic horror.
- mutation_directive tells mutations their current "style" — early: "change almost nothing", later: "destroy everything"`;

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY not set" },
      { status: 500 }
    );
  }

  let currentLore = null;
  let userInput: string | null = null;
  try {
    const body = await req.json();
    currentLore = body.lore || null;
    userInput = body.userInput || null;
  } catch {
    // first call
  }

  let userPrompt = currentLore
    ? `Current lore (epoch ${currentLore.epoch}):\n\n${JSON.stringify(currentLore, null, 2)}\n\nEvolve to the next epoch. Things should CHANGE — consequences happen, entities act, status degrades. Return updated JSON.`
    : `Initialize epoch 1. The site just launched. Everything is NORMAL. A clean SaaS company. But plant ONE tiny seed of something being slightly off. Return the initial lore JSON.`;

  if (userInput) {
    userPrompt += `\n\nThe user just typed: "${userInput}"\nIncorporate this into the lore somehow — twist their words, make it part of the narrative.`;
  }

  try {
    const res = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://qwunk.ai",
          "X-Title": "qwunk.ai",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 2000,
          temperature: 1.3,
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `OpenRouter error: ${res.status}`, details: errText },
        { status: 502 }
      );
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";

    const cleaned = content
      .replace(/^```json?\n?/gm, "")
      .replace(/^```\n?/gm, "")
      .trim();

    const lore = JSON.parse(cleaned);
    return NextResponse.json({ lore });
  } catch (err) {
    return NextResponse.json(
      { error: "Lore generation failed", details: String(err) },
      { status: 502 }
    );
  }
}
