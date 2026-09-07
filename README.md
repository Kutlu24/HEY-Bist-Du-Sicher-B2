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

This is the current, most complete version in a small lineage of B2 vocabulary trainers built while iterating on the idea. Earlier iterations — `B2-Vokabel-Trainer`, `Bist-Du-Bereit--B2`, `Hey-Bist-Du-Bereit--B2`, `Sicher-Alll-Tag-und-Beruf-B2`, `Solinetz--Winterthur-B2-Vokabel-Trainer` — share the same "Sicher! B2" word list but are earlier states of the code (no audio, smaller feature set). This repository is the one to keep building on.
