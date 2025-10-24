# Implementation Plan: Visualizzazione Stato Cassetta e Controlli Manutenzione

**Branch**: `004-mostra-lo-stato` | **Date**: 2025-10-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-mostra-lo-stato/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implementazione di un sistema event-driven per visualizzare lo stato della cassetta (APERTA/CHIUSA) nel pannello manutenzione. I pulsanti "Apri Cassetta" e "Chiudi Cassetta" simulano eventi hardware esterni sempre abilitati. Il sistema riceve notifiche di cambio stato e aggiorna la UI in tempo reale (<500ms). Funzionalità completamente indipendente dalla FSM del chiosco. Test E2E con Playwright coprono tutti gli scenari inclusi idempotenza ed eventi multipli ravvicinati.

## Technical Context

**Language/Version**: JavaScript ES6+ (vanilla, eseguito in browser moderno)
**Primary Dependencies**: loglevel.min.js (già presente), Playwright 1.56.0 (testing E2E già configurato)
**Storage**: Stato runtime in memoria (variabile JavaScript), reset al reload pagina
**Testing**: Playwright E2E (già configurato per feature 002), comando npm dedicato `npm run test:feature-004`
**Target Platform**: Browser moderni (Chrome, Firefox, Safari, Edge ultime 2 versioni)
**Project Type**: Single web app statica (HTML/CSS/JS vanilla)
**Performance Goals**: Aggiornamento UI <500ms da evento, gestione min 5 eventi/sec
**Constraints**: Completamente client-side, no backend, no persistence, indipendente da FSM chiosco
**Scale/Scope**: 1 nuova classe (SensoreCassetta), 1 nuova classe (GestoreManutenzione), aggiornamento index.html/CSS, ~15 test E2E

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Principio I - Lingua Italiana
**Status**: PASS
**Verifica**: Tutto il codice (commenti, variabili, nomi classi, messaggi UI) sarà in italiano come da standard progetto.

### ✅ Principio II - Architettura Static-First
**Status**: PASS
**Verifica**: Nessuna logica server-side richiesta. Tutto client-side con file HTML/CSS/JS statici deployabili su CDN/file server.

### ✅ Principio III - JavaScript Vanilla
**Status**: PASS
**Verifica**: Implementazione con JavaScript vanilla ES6+. Nessun framework/libreria aggiuntiva richiesta (Playwright è solo per testing, non per runtime).

### ✅ Principio IV - Build-Free
**Status**: PASS
**Verifica**: Nessun build step richiesto. File JS linkati direttamente in index.html. Playwright test eseguiti con `npx` (già presente in package.json feature 002).

### ✅ Principio V - Osservabilità
**Status**: PASS
**Verifica**: Utilizzo di loglevel.min.js (già presente) per logging completo eventi cassetta (FR-010). Livelli: DEBUG (eventi idempotenti), INFO (cambio stato effettivo), WARN (eventi multipli rapidi).

### Riepilogo Gate
**Result**: ✅ ALL GATES PASSED - Proceed to Phase 0

Nessuna violazione della Costituzione. Feature allineata perfettamente ai 5 principi fondamentali.

## Project Structure

### Documentation (this feature)

```
specs/004-mostra-lo-stato/
├── spec.md              # Feature specification (già creato)
├── checklists/
│   └── requirements.md  # Spec quality checklist (già creato)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (API simulato sensore cassetta)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
/home/mario/rfi-poc/
├── index.html                    # UPDATE: Aggiungi sezione pannello manutenzione cassetta
├── css/
│   ├── styles.css                # UPDATE: Potenzialmente stili globali pannello
│   ├── components.css            # UPDATE: Stili componenti cassetta (status badge, pulsanti)
│   └── animations.css            # (no change - nessuna animazione cassetta prevista)
├── js/
│   ├── app.js                    # UPDATE: Inizializza SensoreCassetta, GestoreManutenzione
│   ├── chiosco.js                # (no change - FSM indipendente da cassetta per FR-011)
│   ├── display.js                # (no change - cassetta ha display separato)
│   ├── porta.js                  # (no change - porta diversa da cassetta)
│   ├── gettoniera.js             # (no change)
│   ├── lettore-carte.js          # (no change)
│   ├── lettore-qr.js             # (no change)
│   ├── validatore.js             # (no change)
│   ├── logger.js                 # (no change - utilizzo esistente)
│   ├── sensore-cassetta.js       # NEW: Classe SensoreCassetta (gestisce stato, emette eventi)
│   └── gestore-manutenzione.js   # NEW: Classe GestoreManutenzione (UI pannello, pulsanti)
├── assets/
│   └── lib/
│       └── loglevel.min.js       # (già presente - utilizzo per logging cassetta)
├── package.json                  # UPDATE: Aggiungi script "test:feature-004"
├── playwright.config.js          # (no change - config già presente)
└── tests/
    └── e2e/
        ├── feature-001.spec.js   # (no change)
        ├── feature-002.spec.js   # (no change)
        └── feature-004.spec.js   # NEW: 15+ test per US1-US4, idempotenza, eventi rapidi
```

**Structure Decision**: Single web app structure confermata. Feature 004 aggiunge 2 nuove classi JS (sensore-cassetta.js, gestore-manutenzione.js), aggiorna index.html con pannello manutenzione, aggiorna CSS componenti, e crea suite test E2E dedicata. Completamente indipendente da FSM esistente (chiosco.js non modificato).

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**N/A** - Nessuna violazione riscontrata. Tabella vuota.
