# Bist du sicher? — B2-Vokabeltrainer

Ein browserbasierter Karteikarten- und Quiz-Trainer für den Wortschatz des Lehrbuchs **„Sicher! B2"**, gedacht für Lernende, die sich auf eine B2-Prüfung vorbereiten (z. B. telc B2, Goethe B2).

🇬🇧 English version: [README.md](README.md)

## Was die App macht

- Übt rund 1.000 B2-Vokabeln aus *Sicher! B2*, jeweils mit einem Beispielsatz zum Kontext.
- Quiz- und Karteikarten-Modus mit Fortschrittsanzeige, damit sichtbar wird, welche Wörter schon sitzen.
- Audio-Wiedergabe zur Aussprache (die neueste Funktion in dieser Reihe — siehe „Verlauf" unten).
- Läuft komplett im Browser: kein Login, kein Server, keine Daten verlassen den Rechner.

## Technik

Reines HTML, CSS und Vanilla-JavaScript — kein Build-Prozess, kein Framework. Die Vokabeldaten liegen in `sicher.csv` und `modul1.json`.

## Ausführen

`index.html` im Browser öffnen, oder den Ordner mit einem beliebigen statischen Server bereitstellen:

```bash
npx serve .
```

## Verlauf

Dies ist die aktuelle, vollständigste Version innerhalb einer kleinen Reihe von B2-Vokabeltrainern, die im Laufe der Entwicklung entstanden sind. Die früheren Versionen teilten dieselbe „Sicher! B2"-Wortliste, waren aber ältere Codestände (ohne Audio, kleinerer Funktionsumfang). Ihr Quellcode ist in diesem Repository unter [`archive/`](archive/) erhalten, ein Ordner pro alter Version:

- [`archive/v1-b2-vokabel-trainer/`](archive/v1-b2-vokabel-trainer/) — vormals `B2-Vokabel-Trainer`
- [`archive/v2-bist-du-bereit-b2/`](archive/v2-bist-du-bereit-b2/) — vormals `Bist-Du-Bereit--B2`
- [`archive/v3-hey-bist-du-bereit-b2/`](archive/v3-hey-bist-du-bereit-b2/) — vormals `Hey-Bist-Du-Bereit--B2`
- [`archive/v4-sicher-alltag-und-beruf-b2/`](archive/v4-sicher-alltag-und-beruf-b2/) — vormals `Sicher-Alll-Tag-und-Beruf-B2`
- [`archive/v5-solinetz-winterthur/`](archive/v5-solinetz-winterthur/) — vormals `Solinetz--Winterthur-B2-Vokabel-Trainer`

Diese dienen nur als Referenz (nicht in die App eingebunden) — die eigenständigen GitHub-Repositories, aus denen sie stammen, werden nicht mehr separat gepflegt. Dieses Repository ist die Basis für die Weiterentwicklung.
