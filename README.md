
🚦 SafeRoute — Know the Route Before You Take It
A crowdsourced safety map that lets communities mark streets, corners, and paths as Safe, Caution, or Unsafe — built for the routes official maps never rate.

Built for the Acodemic × G.I.R.L.S. Global SDG Hackathon.

🔗 Live Demo:https://zvracodes.github.io/SafeRoute/

🎯 The Problem
Every day, millions of people — mostly women, girls, elderly citizens, and people with disabilities — silently reroute their walk home because a street "doesn't feel right." No streetlight. No footpath. A history of harassment. An isolated underpass after dark.

None of this exists on any standard navigation map.

Google Maps will tell you the fastest route, but it will never tell you the safest one. There is no global platform where a community can flag "this street is unsafe at night" — and no way for that knowledge to reach the next person walking the same path.

🌍 Global Context: According to the WHO, 1 in 3 women worldwide experience physical or sexual violence in their lifetime — much of it in public spaces that were never designed, lit, or monitored with their safety in mind.

This isn't just a regional issue — it's a global infrastructure gap from Nairobi to São Paulo to London.

💡 The Solution
SafeRoute is a lightweight, crowdsourced safety-mapping tool where anyone can:

📍 Click anywhere on a live map to drop a pin and report a location.

🟢🟡🔴 Tag status as Safe / Caution / Unsafe with specific structured reasons (no lighting, harassment reported, well-lit, good CCTV, etc.).

🌗 Mark time-aware risks (Day, Night, or Both) because safety isn't static.

✅ Confirm existing reports to build community-verified trust.

🔍 Filter the map view by safety level, time of day, or city.

No sign-up. No complicated onboarding. Just a map that tells the truth.

🌐 Why This Matters (SDG Alignment)
SDG 5 — Gender Equality: Turns the lived, often-silenced experience of unsafe public spaces into visible, shareable, actionable data — giving women and girls a voice in how their cities are understood.

SDG 11 — Sustainable Cities & Communities: Surfaces exactly where infrastructure is failing (lighting, footpaths, patrols) — data city planners rarely have access to at street level.

SDG 16 — Peace, Justice & Strong Institutions: Builds a transparent, community-owned record of public safety that complements (not replaces) formal reporting systems.

✨ Key Features
🗺️ Interactive Click-to-Report Map: Fully self-contained SVG map rendering without external API lock-ins.

🎨 Stress-Free UI: Clean, distraction-free interface designed for clarity under stress.

🕐 Time-Aware Safety Data: Accurately reflects spots that are safe by day but flagged by night.

🏷️ Structured Reason Tags: Standardized reporting tags (lighting, crowd density, past incidents, CCTV) instead of vague complaints.

🌍 Global Scalability: Seeded with real-world example locations across 5+ countries to demonstrate global use.

💾 In-Browser Persistence: Fully functional client-side storage via LocalStorage for demo purposes.

🌓 Theme Support: Clean light and dark mode integration.

📱 Responsive Design: Optimized for mobile screens where on-the-go reporting happens most.

🛠️ Tech Stack
Built intentionally simple so the core problem-solving idea stays at the forefront:

HTML5: Semantic structure

CSS3: Custom design system, responsive grid layout, and CSS variables for theming

Vanilla JavaScript: Zero frameworks, zero dependencies, no build step required

SVG: Custom hand-built interactive map rendering

LocalStorage: Client-side data persistence for demo purposes

No frameworks were used on purpose — this proves the concept can be built, understood, and extended by any beginner developer, anywhere in the world.

🚀 Running It Locally
Download all three files into a single directory: index.html, style.css, and script.js.

Open index.html in any web browser.

That's it — no installation, no local server, and no external dependencies required!

🔭 Future Scope
This is a hackathon prototype — here is how it grows into a production-ready application:

📡 Real Backend Integration: Migration to Firebase or Supabase for shared, multi-user community data sync.

🗺️ Real Map Tiles: Integration with OpenStreetMap or Google Maps API for real-world GPS navigation.

🤖 AI Moderation: Automated sentiment and spam detection to prevent malicious reports.

📊 City Planner Dashboard: Public heatmaps for local municipal authorities and NGOs to identify lighting and security gaps.

🔔 Safety-First Routing: Smart GPS algorithm suggesting routes that actively avoid flagged unsafe zones.

🌐 Multi-Language Support: Localized translations for global accessibility.

👤 Team
Zahra — Developer & Lead

University: Virtual University of Pakistan

📄 License
Built for educational and hackathon evaluation purposes as part of the Acodemic × G.I.R.L.S. Global SDG Hackathon.

"We're not just building an app — we're building a tool that gives voice to the unheard experiences of people navigating unsafe cities every day."
