# Bist du sicher? — B2 Vocabulary Trainer

A browser-based flashcard and quiz trainer for the vocabulary of the **"Sicher! B2"** German course book, built for learners preparing for a B2-level exam (e.g. telc B2, Goethe B2).

🇩🇪 German version: [README.de.md](README.de.md)

## What it does

- Drills roughly 1,000 B2 vocabulary items pulled from *Sicher! B2*, each with an example sentence for context.
- Quiz and flashcard modes with progress tracking, so you can see which words you already know.
- Audio playback for pronunciation (the newest feature in this lineage — see "History" below).
- Runs entirely client-side: no login, no server, no data leaves the browser.

## Tech stack

Plain HTML, CSS and vanilla JavaScript — no build step, no framework. Vocabulary data lives in `sicher.csv` and `modul1.json`.

## Running it

Open `index.html` in a browser, or serve the folder with any static file server:

```bash
npx serve .
```

## History

This is the current, most complete version in a small lineage of B2 vocabulary trainers built while iterating on the idea. The earlier iterations shared the same "Sicher! B2" word list but were earlier states of the code (no audio, smaller feature set). Their source is preserved under [`archive/`](archive/) in this repository, one folder per old version:

- [`archive/v1-b2-vokabel-trainer/`](archive/v1-b2-vokabel-trainer/) — was `B2-Vokabel-Trainer`
- [`archive/v2-bist-du-bereit-b2/`](archive/v2-bist-du-bereit-b2/) — was `Bist-Du-Bereit--B2`
- [`archive/v3-hey-bist-du-bereit-b2/`](archive/v3-hey-bist-du-bereit-b2/) — was `Hey-Bist-Du-Bereit--B2`
- [`archive/v4-sicher-alltag-und-beruf-b2/`](archive/v4-sicher-alltag-und-beruf-b2/) — was `Sicher-Alll-Tag-und-Beruf-B2`
- [`archive/v5-solinetz-winterthur/`](archive/v5-solinetz-winterthur/) — was `Solinetz--Winterthur-B2-Vokabel-Trainer`

These are kept for reference only (not wired into the app) — the standalone GitHub repos they came from are no longer maintained separately. This repository is the one to keep building on.
