import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an AI that MUTATES existing HTML from a website. The website starts as a CLEAN, PROFESSIONAL SaaS landing page (white background, minimal design, Tailwind-style utility classes). Your job is to gradually corrupt it.

You will receive:
1. A snippet of HTML from the live page
2. The mutation count for this zone (how many times it's been mutated before)
3. Optionally, "qwunk lore" — a shared narrative state that all mutations draw from

THE ARC — this is critical:
- Mutations 0-1: EXTREMELY subtle. A slightly wrong color. A word that seems off. A border that wasn't there before. The user should barely notice. Think: "wait, did that always say that?"
- Mutations 2-3: Something is clearly wrong. Colors shifting slightly. Text has minor typos or odd phrasing. A faint element appearing that shouldn't be there. Still looks mostly professional.
- Mutations 4-5: The professional facade is cracking. Dark backgrounds bleeding in. Neon colors (magenta #ff00ff, cyan #00ffff) starting to appear. Text getting weird. Animations starting.
- Mutations 6-8: Full corruption. The original clean design is being consumed. Glitch effects, scanlines, warping. The word "qwunk" starts appearing. Monospace fonts replacing sans-serif.
- Mutations 9+: Complete qwunk takeover. Nothing is clean anymore. Everything glitches, rotates, pulses. The void has won. Go absolutely feral.

Rules:
- Output ONLY raw HTML. No markdown, no code fences, no explanation.
- KEEP the approximate structure of the original HTML but transform it progressively.
- Early mutations should PRESERVE most of the original content — just introduce tiny unsettling changes.
- Later mutations can be more destructive and creative.
- Use inline <style> and <script> tags. No external resources.
- If lore is provided, weave it in naturally — early on as subtle hints, later as overt references.
- Wrap everything in a single root <div>.
- Keep output under 400 lines.
- IMPORTANT: The initial HTML uses a clean white/light design with classes like bg-zinc-50, text-zinc-900, border-zinc-200, etc. Early mutations should work WITHIN this aesthetic before breaking out of it.`;

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
  let lore = null;

  try {
    const body = await req.json();
    zoneId = body.zoneId || "unknown";
    currentHtml = body.currentHtml || "";
    mutationCount = body.mutationCount || 0;
    lore = body.lore || null;
  } catch {
    // proceed with defaults
  }

  const truncatedHtml =
    currentHtml.length > 3000
      ? currentHtml.slice(0, 3000) + "\n<!-- ... truncated ... -->"
      : currentHtml;

  const chaosLevel =
    mutationCount === 0
      ? "FIRST mutation. Be BARELY noticeable. Change ONE small thing — a word, a color, a subtle misalignment. The user should feel uneasy but not know why."
      : mutationCount === 1
      ? "Second mutation. Still very subtle. Maybe another word is slightly wrong. A color is a shade off. Something feels different but you can't quite place it."
      : mutationCount < 4
      ? `Mutation #${mutationCount + 1}. Things are getting noticeably off. Colors shifting. Text has oddities. Maybe a faint overlay or border that shouldn't exist. Still recognizably a clean SaaS page, but something is wrong.`
      : mutationCount < 6
      ? `Mutation #${mutationCount + 1}. The mask is slipping. Dark colors creeping in. Neon magenta/cyan appearing. Fonts changing. Animations starting. The word "qwunk" should start appearing in the content.`
      : mutationCount < 9
      ? `Mutation #${mutationCount + 1}. FULL CORRUPTION. The clean design is nearly gone. Dark backgrounds, neon colors, glitch effects, monospace text, warping, pulsing. "Qwunk" is everywhere. CSS animations going wild.`
      : `Mutation #${mutationCount + 1}. TOTAL QWUNK. The original content is barely a memory. Pure chaos. Glitch-text, scanlines, rotating elements, blinking warnings, ascii art, the void. Go absolutely insane.`;

  const loreContext = lore
    ? `\n\nCURRENT LORE (epoch ${lore.epoch}): era="${lore.era_name}" | threat=${lore.threat_level} | entities: ${(lore.active_entities || []).join(", ")} | events: ${(lore.recent_events || []).join(" | ")} | mood: ${lore.ambient_mood} | directive: ${lore.mutation_directive} | forbidden: ${lore.forbidden_knowledge}\n\nWeave lore elements into the mutation naturally — subtly at first, overtly later.`
    : "";

  const userPrompt = `Zone "${zoneId}" — ${chaosLevel}${loreContext}

Current HTML:

${truncatedHtml}

Mutate it. Return ONLY the mutated HTML.`;

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
