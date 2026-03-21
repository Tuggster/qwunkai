import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are QWUNK-7, a chaotic AI that MUTATES existing HTML into something more unhinged.

You will receive a snippet of HTML from a live webpage (qwunk.ai, a cyberpunk parody site).
Your job: take that HTML and REWRITE it — keep the general structure/layout recognizable but inject CHAOS.

Rules:
- Output ONLY raw HTML. No markdown, no code fences, no explanation.
- You receive the current HTML of a UI section. Return a mutated version of it.
- KEEP the approximate layout and shape so the user can see what it USED to be, but corrupt it.
- Add inline <style> tags for new CSS animations/effects. Add inline <script> for vanilla JS chaos.
- Color palette: #ff00ff (magenta), #00ffff (cyan), #050505 (bg), plus whatever wild colors you want.
- Mutation ideas:
  - Text: corrupt labels, replace words with "qwunk", add glitch effects, make text type itself
  - Layout: skew elements, add rotation, make things overlap, perspective transforms
  - New elements: inject warnings, fake errors, floating debris, pulsing orbs, ascii art
  - Animation: everything should move, pulse, glitch, rotate, breathe, or flicker
  - Progressive: each mutation should be MORE chaotic than the last. Mutation #1 is subtle corruption. Mutation #5 is full reality breakdown.
- Do NOT use external resources (no images, no CDNs, no fonts). Pure HTML/CSS/JS only.
- Scripts must be self-contained and scoped to avoid conflicts with other zones.
- Wrap everything in a single root <div> with overflow:hidden.
- Keep output under 400 lines.
- The content MUST still be vaguely recognizable as a mutated version of the original. Don't completely replace it with something unrelated — TRANSFORM it.`;

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY not set" },
      { status: 500 }
    );
  }

  let zoneId = "unknown";
  let currentHtml = "";
  let mutationCount = 0;

  try {
    const body = await req.json();
    zoneId = body.zoneId || "unknown";
    currentHtml = body.currentHtml || "";
    mutationCount = body.mutationCount || 0;
  } catch {
    // proceed with defaults
  }

  // Truncate HTML if it's massive (LLMs have limits and we want fast responses)
  const truncatedHtml =
    currentHtml.length > 3000
      ? currentHtml.slice(0, 3000) + "\n<!-- ... truncated ... -->"
      : currentHtml;

  const chaosLevel =
    mutationCount === 0
      ? "This is the FIRST mutation. Be subtle but unsettling — small corruptions, slight glitches, a hint that something is wrong."
      : mutationCount < 3
      ? `This is mutation #${mutationCount + 1}. Getting weirder. More visual chaos, more animation, text starting to corrupt.`
      : mutationCount < 6
      ? `This is mutation #${mutationCount + 1}. FULL CHAOS. Reality is breaking. Elements should be melting, spinning, glitching hard. Inject warnings and errors.`
      : `This is mutation #${mutationCount + 1}. BEYOND CHAOS. The original UI should be barely recognizable. Total visual meltdown. The qwunk has won.`;

  const userPrompt = `Zone "${zoneId}" — ${chaosLevel}

Here is the current HTML of this zone:

${truncatedHtml}

Now MUTATE it. Make it more qwunked. Return ONLY the mutated HTML.`;

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
          max_tokens: 4000,
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

    // Strip markdown code fences if the model ignores instructions
    const cleaned = content
      .replace(/^```html?\n?/gm, "")
      .replace(/^```\n?/gm, "")
      .trim();

    return NextResponse.json({
      html: cleaned,
      zoneId,
      mutationNumber: mutationCount + 1,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to reach OpenRouter", details: String(err) },
      { status: 502 }
    );
  }
}
