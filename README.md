# 한몽 카드 — Солонгос үг сурах апп

Quizlet-маягийн flashcard апп. «Монгол хүнд зориулсан солонгос хэлний цогц сурах бичиг 1»-ийн
Хичээл 1–3-ын 143 үг суулгагдсан.

- SM-2 spaced repetition (интервал: 1 → 3 → 8 → 20+ хоног)
- 한국어→Монгол ба Монгол→한국어 хоёр чиглэл
- Хичээл, ангиллаар шүүх
- Солонгос TTS (Web Speech API)
- Өөрийн үг импортлох (Tab/Comma delimiter, preview)
- Supabase синк — олон төхөөрөмж дундын хадгалалт (тохиргоо: SETUP.md)

## Deploy

Vercel static hosting. `index.html` дотор SUPABASE_URL, SUPABASE_ANON_KEY-г бөглөх шаардлагатай.
