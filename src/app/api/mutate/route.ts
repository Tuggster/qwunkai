import { NextResponse } from "next/server";

const ZONE_SYSTEM_PROMPT = `You are an AI that MUTATES existing HTML from a website. The website starts as a CLEAN, PROFESSIONAL SaaS landing page (white background, minimal design, Tailwind-style utility classes). Your job is to gradually corrupt it.

You will receive:
1. A snippet of HTML from the live page
2. The mutation count for this zone
3. Optionally, "qwunk lore" — a shared narrative state

THE ARC:
- Mutations 0-1: EXTREMELY subtle. A slightly wrong color. A word replaced with a synonym that doesn't quite work. One tiny detail that creates unease. Keep the clean white SaaS look.
- Mutations 2-3: Something is clearly wrong. Colors drifting. Text has oddities. A faint element that shouldn't exist. An extra link. A number that changes.
- Mutations 4-5: The facade cracks. Colors warming/shifting (NOT just pink and blue — try amber, olive, rust, lavender). Animations starting. Strange interactive elements appearing. "Qwunk" creeping into text.
- Mutations 6-8: Full corruption. Layout breaking. Mixed aesthetics. New interactive elements replacing old ones. Fonts shifting. The original content is being overwritten with something else. Add clickable/hoverable surprises.
- Mutations 9+: Total transformation. This section should become its own interactive mini-experience. A fake widget, a mini-game, a conversation, a strange tool.

Rules:
- Output ONLY raw HTML. No markdown, no code fences, no explanation.
- Use inline <style> and <script> tags.
- If lore is provided, weave it in — subtly at first, overtly later.
- Wrap in a single root <div>. Under 400 lines.
- DO NOT default to "dark background with neon pink and blue." Be creative with color.
- You may use <canvas> with 2D/WebGL. window.THREE (Three.js) is available globally.
- Favor INTERACTIVE mutations over purely visual ones — add click handlers, hover effects, inputs, draggable elements.
- Use requestAnimationFrame for animation loops.`;

const ROOT_SYSTEM_PROMPT = `You are an AI creating an INTERACTIVE web experience called "the qwunk." This used to be a normal SaaS website. Now you are building something surreal, playful, and deeply weird — but INTERACTIVE. The user should be able to DO things, not just watch.

THIS IS NOT A SCREENSAVER. The user must be able to:
- Click things and have them respond in unexpected ways
- Drag elements, type into inputs, hover over things
- Explore — there should be hidden areas, clickable secrets, expandable zones
- Make choices that change what they see
- Interact with the lore entities — talk to them, feed them, poke them

TECHNICAL CAPABILITIES:
- window.THREE (Three.js) is available globally for 3D scenes, shaders, etc.
- Raw WebGL for custom shaders (fractals, noise, fluid sim)
- 2D Canvas for generative art, particle systems
- CSS animations, 3D transforms, filters, clip-path, mix-blend-mode
- DOM: draggable elements, contenteditable fields, click/hover handlers, mouse tracking

INTERACTIVITY IDEAS (pick 2-3 each time, not all):
- A text input where the user types and the page reacts to what they write
- Draggable windows/panels that reveal hidden content underneath
- Clickable entities from the lore that have dialog or react when poked
- A fake terminal where you can type commands and get unhinged responses
- A mini-game: catch the qwunk, click the anomaly, navigate a maze
- Buttons that do wrong things — "close" spawns more windows, "delete" makes things grow
- A map/environment the user can scroll/pan through
- Hover effects that transform elements — things that shatter, melt, or bloom on hover
- A fake settings panel where every toggle does something absurd
- Elements that the user can "paint" or "draw" on by moving their mouse
- A conversation with an entity — the user picks responses, the entity reacts

AESTHETIC DIRECTION:
- DO NOT default to "dark background with neon pink and blue." Be more creative.
- Choose a UNIQUE color palette each time. Ideas: warm amber + deep red + cream. Olive + gold + bone. Lavender + charcoal + peach. Acid green + white + grey. Rusty orange + midnight + silver.
- Mix aesthetics unpredictably: brutalist web design, 90s geocities, corporate Memphis gone wrong, vaporwave mall, liminal spaces, medical UI, weather radar, satellite imagery, analog TV, fax machine output, microfilm reader, blueprint/schematic, grocery store receipt, parking garage signage.
- The vibe should be UNCANNY — familiar things made wrong — not just "hacker neon."
- Typography matters: mix serif and mono. Use scale dramatically. Whisper and shout.

LORE INTEGRATION:
- Weave lore in as interactive elements, not just text on screen.
- Entities should be characters you can interact with.
- Let the user discover lore by exploring, not by reading walls of text.
- The forbidden_knowledge should be hidden — revealed by a specific interaction.

OUTPUT RULES:
- Output ONLY raw HTML with inline <style> and <script>. NO markdown. NO fences.
- Wrap in a single root <div> with min-height:100vh and overflow:hidden.
- Scripts must be self-contained. window.THREE is available for Three.js.
- Use requestAnimationFrame for animation loops.
- MUST include multiple interactive elements the user can engage with.
- Under 1000 lines. Fill the viewport.
- EVERY mutation should be COMPLETELY DIFFERENT. Different palette, different layout, different interactions, different aesthetic.`;

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
  let phase = "clean";
  let directive: string | null = null;

  try {
    const body = await req.json();
    zoneId = body.zoneId || "unknown";
    currentHtml = body.currentHtml || "";
    mutationCount = body.mutationCount || 0;
    lore = body.lore || null;
    phase = body.phase || "clean";
    directive = body.directive || null;
  } catch {
    // defaults
  }

  const isRootZone = zoneId === "__root__";
  const maxHtmlLen = isRootZone ? 12000 : 3000;
  const truncatedHtml =
    currentHtml.length > maxHtmlLen
      ? currentHtml.slice(0, maxHtmlLen) + "\n<!-- ... truncated ... -->"
      : currentHtml;

  const loreContext = lore
    ? `\n\nLORE (epoch ${lore.epoch}): era="${lore.era_name}" | threat=${lore.threat_level} | entities: ${(lore.active_entities || []).join(", ")} | events: ${(lore.recent_events || []).join(" | ")} | mood: ${lore.ambient_mood} | directive: ${lore.mutation_directive} | forbidden: ${lore.forbidden_knowledge}${lore.qwunk_price ? ` | $QWUNK: ${lore.qwunk_price}` : ""}`
    : "";

  let systemPrompt: string;
  let userPrompt: string;

  if (isRootZone) {
    systemPrompt = ROOT_SYSTEM_PROMPT;

    const rootDirections = [
      "A fake operating system desktop. Draggable windows with lore content inside. A working (but wrong) clock. A file manager showing cursed files you can 'open'. A recycle bin that won't empty. A settings panel where toggles do absurd visual things. Use warm amber, cream, and deep brown. 90s/2000s OS aesthetic.",
      "An interactive terminal where the user can actually TYPE COMMANDS and get unhinged responses. Commands like 'help', 'ls', 'whoami', 'qwunk' all do different surreal things. A Three.js scene running behind it as a screensaver that reacts to commands. Use olive green on black. Retro CRT aesthetic.",
      "A fake email inbox. Clickable emails from lore entities with increasingly unhinged content. A compose button that lets the user write to 'the qwunk' via a real textarea. Reply-all spawns more windows. Use sterile white and grey with one alarming accent color. Corporate horror.",
      "A surreal map/floor plan the user can pan around by dragging. Different 'rooms' with different aesthetics. Clicking a room zooms in and shows interactive content. Hovering reveals hidden text. Use blueprint blue on cream. Architectural/schematic feel.",
      "A fake social media feed with posts from lore entities. The user can 'like' posts (likes do weird things). A working comment box where typing changes the page. Infinite scroll that gets progressively more wrong. Use pastel palette gone sour — muted pink, grey-green, off-white.",
      "A Three.js 3D gallery space the user can orbit around (OrbitControls). Floating 'artworks' that are interactive — click one and it expands into a full experience. Each artwork is a different mini-interaction. Use gallery white with dramatic colored lighting.",
      "A fake weather/radar interface. An interactive 'radar' (canvas) the user can scrub through time. Each 'frame' shows a different anomaly. A forecast section with increasingly wrong predictions. Clickable city names from the lore. Use weather-map greens, yellows, reds on dark grey.",
      "A fake shopping/e-commerce page selling impossible qwunk products. Working cart — add items and the total is always wrong. Product images are canvas-generated abstract art. Reviews from lore entities. A checkout flow that goes nowhere good. Use clean e-commerce white with subtle wrongness.",
      "A music player / radio interface. A Three.js audio visualizer (without actual audio — fake it with sine waves). Clickable 'stations' that change the visual aesthetic entirely. A playlist of song titles from lore. Draggable EQ sliders that warp the page. Use dark grey with warm gold accents.",
      "A fake wiki/encyclopedia about qwunk. Clickable cross-referenced articles. Some links lead to real content, others to dead ends or recursive loops. An editable section where the user can 'contribute'. A revision history showing impossible timestamps. Use Wikipedia beige with serif fonts.",
    ];
    const direction = rootDirections[Math.floor(Math.random() * rootDirections.length)];

    userPrompt = `Root mutation #${mutationCount + 1}.

CREATIVE BRIEF: ${direction}

CRITICAL: This must be INTERACTIVE. The user must be able to click, type, drag, hover, and explore. It is NOT a static visual — it is an EXPERIENCE. Include at minimum 3 distinct interactive elements.${loreContext}

Previous page HTML (for reference/mockery only — do NOT preserve its structure):
${truncatedHtml.slice(0, 3000)}

Build it. Return ONLY HTML.`;
  } else {
    systemPrompt = ZONE_SYSTEM_PROMPT;
    const chaosLevel =
      mutationCount === 0
        ? "FIRST mutation. BARELY noticeable. One tiny change."
        : mutationCount === 1
        ? "Second mutation. Still subtle. Something slightly more wrong."
        : mutationCount < 4
        ? `Mutation #${mutationCount + 1}. Noticeably off. Colors, text, faint overlays.`
        : mutationCount < 6
        ? `Mutation #${mutationCount + 1}. Mask slipping. Dark colors, neon, fonts changing, animations. Use <canvas> for visual effects if appropriate.`
        : mutationCount < 9
        ? `Mutation #${mutationCount + 1}. FULL CORRUPTION. Dark backgrounds, neon, glitch effects. Use canvas/WebGL for dynamic visuals.`
        : `Mutation #${mutationCount + 1}. TOTAL MELTDOWN. Go insane. Use Three.js (window.THREE) or WebGL for 3D chaos.`;

    const directiveStr = directive
      ? `\n\nSPECIAL DIRECTIVE FOR THIS ZONE: ${directive}\nFollow this directive. It overrides general mutation guidance.`
      : "";

    userPrompt = `Zone "${zoneId}" — ${chaosLevel}${directiveStr}${loreContext}

Current HTML:
${truncatedHtml}

Mutate it. Return ONLY the mutated HTML.`;
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
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: isRootZone ? 16000 : 4000,
          temperature: isRootZone ? 1.5 : 1.3,
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
      phase,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to reach OpenRouter", details: String(err) },
      { status: 502 }
    );
  }
}
