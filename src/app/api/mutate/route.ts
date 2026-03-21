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
      // OS / Desktop
      "A fake operating system desktop. Draggable windows with lore content inside. A working (but wrong) clock. A file manager showing cursed files. A settings panel where toggles do absurd visual things. Warm amber, cream, deep brown. 90s/2000s OS aesthetic.",
      "A Linux terminal. The user can TYPE COMMANDS ('help', 'ls', 'cat readme', 'qwunk', 'sudo rm -rf /') and get unhinged responses. A Three.js screensaver behind it that reacts to commands. Olive green on black CRT.",
      // Social / Communication
      "A dating app for lore entities. Swipeable profiles with canvas-generated 'photos'. A match screen with confetti. Chat with a matched entity via textarea. Coral pink and warm cream.",
      "A fake social media feed. Posts from lore entities. 'Like' buttons do weird visual things. A comment box where typing changes the page itself. Pastel palette gone sour.",
      "A group chat interface. Multiple lore entities arguing. The user can type messages that the entities react to. Typing indicators that never stop. Messages that edit themselves. Clean white with colored bubbles.",
      // Games
      "A clicker/idle game. Click a big qwunk orb to generate 'qwunk points'. Buy upgrades that visually change the page. A prestige system. Leaderboard of lore entities. Pixel art aesthetic, warm 8-bit palette.",
      "A text adventure. 'You are in a dark room. There is a door.' The user types commands. Choices matter — different paths, different visual themes. A canvas illustration that changes with each scene. Parchment and ink aesthetic.",
      "A fake Minesweeper/Solitaire but the rules are wrong. Clicking tiles reveals lore fragments, entity sightings, or visual effects. Some tiles spawn new elements on the page. Retro Windows grey.",
      // Data / Monitoring
      "A mission control dashboard. Multiple live-updating panels: a fake radar (canvas), scrolling logs, a map with blinking dots, vitals that flatline. Everything is monitoring 'the qwunk'. Dark blue-grey with amber and red accents.",
      "A stock trading terminal for $QWUNK. A canvas chart with wildly volatile price action. Buy/sell buttons. A ticker of other fake qwunk-related stocks. Breaking news from lore entities. Bloomberg terminal black and green.",
      "A fake weather radar. Canvas-drawn radar sweep. Different 'frames' show anomalies. Forecast section with wrong predictions. Clickable city names. Weather-map greens, yellows, reds on dark grey.",
      // Creative / Media
      "A music player / radio. A canvas audio visualizer (fake it with sine waves). Clickable 'stations' that change the entire visual style. Playlist of impossible song titles. Draggable EQ sliders that warp the page. Dark grey with warm gold.",
      "A TV channel surfer. A big 'screen' that shows different 'channels' — each channel is a mini canvas scene (static, a fake news broadcast, a test pattern, a nature doc gone wrong). Channel up/down buttons. Scanlines. Retro TV bezel.",
      "An art program. A drawable canvas area (mousedown painting). Color picker. Brush size slider. But the canvas paints back — it adds its own strokes. Your drawings get incorporated into lore. White workspace.",
      // E-commerce / Corporate
      "A shopping page selling impossible products. Working cart with wrong totals. Product images are canvas-generated abstract art. Reviews from lore entities. A checkout that goes nowhere good. Clean e-commerce white.",
      "A fake corporate intranet. Employee directory of lore entities with hover cards. A 'company announcements' feed. A room booking system where all rooms are named wrong. Office blue and grey.",
      // Knowledge / Documentation
      "A wiki about qwunk. Cross-referenced clickable articles. Some links lead to content, others loop back or hit dead ends. An editable section. Revision history with impossible timestamps. Wikipedia beige, serif fonts.",
      "A fake research paper viewer. An academic paper about qwunk with abstract, charts (canvas), citations. Clickable citations lead to other fake papers. A peer review comment section. Scientific white, serif, clean.",
      // Spatial / Exploration
      "A dungeon map the user can pan by dragging. Different rooms with different aesthetics. Clicking a room zooms in and shows interactive content. Hover reveals hidden text. Blueprint blue on cream.",
      "A planetarium. Three.js starfield the user can orbit (OrbitControls). Clickable 'constellations' named after lore entities. Click one to see its story. A search field to find entities. Deep indigo with star-white.",
      "An underwater scene. Three.js with blue fog and floating objects. Bioluminescent particles. Click objects to 'examine' them — they show lore text. Slow, dreamlike. Deep ocean blues and teals.",
      // Surreal / Abstract
      "A room of doors. Each door is a different color/style. Clicking a door opens it to a mini-scene (canvas, CSS animation, or DOM). Some doors are locked. One door opens to another set of doors. Warm wooden palette.",
      "A fake loading screen that never finishes — but it's interactive. Different loading bars, spinners, status messages that you can click to 'skip' (skipping just adds more loaders). Progress bars that go backwards. Clean corporate grey.",
      "An infinite zoom. A canvas that continuously zooms into itself, revealing new scenes at each level. The user can click to zoom faster or drag to change the zoom target. Fractal-like. Muted earth tones.",
      "A fortune teller / magic 8-ball. Click the orb (Three.js sphere with shader). It shakes and reveals a lore-based prophecy. A tarot card drawer. A crystal ball that shows canvas-rendered visions. Deep purple and gold.",
    ];
    const direction = rootDirections[Math.floor(Math.random() * rootDirections.length)];

    userPrompt = `Root mutation #${mutationCount + 1}.

CREATIVE BRIEF: ${direction}

CRITICAL: This must be INTERACTIVE. The user must be able to click, type, drag, hover, and explore. It is NOT a static visual — it is an EXPERIENCE. Include at minimum 3 distinct interactive elements.${loreContext}

Previous page HTML (for reference/mockery only — do NOT preserve its structure):
${truncatedHtml.slice(0, 3000)}

Build it. Return ONLY HTML.`;
  } else if (directive) {
    // ── DIRECTIVE ZONE: skip the subtle arc, just build what the directive says ──
    systemPrompt = `You are an AI that creates HTML widgets/overlays for a surreal, corrupting website. You receive a DIRECTIVE describing exactly what to build. Build it.

Rules:
- Output ONLY raw HTML with inline <style> and <script>. No markdown. No fences.
- Wrap in a single root <div>.
- Scripts are self-contained. window.THREE (Three.js) is available globally.
- Use requestAnimationFrame for animations.
- Be CREATIVE. Each time you're called, create something DIFFERENT even for the same directive.
- Use varied color palettes — not just dark+neon. Try warm ambers, muted pastels, acid greens, deep reds.
- If lore is provided, weave it in naturally.
- IMPORTANT: The output must be VISIBLE and INTERESTING. Not an empty div. Not a subtle change. Create something the user will NOTICE.`;

    userPrompt = `DIRECTIVE: ${directive}

This is generation #${mutationCount + 1} for this zone. Make it COMPLETELY DIFFERENT from previous generations. Be creative and surprising.${loreContext}

${truncatedHtml ? `Current content (replace entirely with something new):\n${truncatedHtml.slice(0, 500)}` : "This zone is empty. Create something from scratch."}

Build it. Return ONLY HTML.`;
  } else {
    // ── NORMAL ZONE: gradual corruption arc ──
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

    userPrompt = `Zone "${zoneId}" — ${chaosLevel}${loreContext}

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
