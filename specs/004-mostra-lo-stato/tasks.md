# Tasks: Visualizzazione Stato Cassetta e Controlli Manutenzione

**Input**: Design documents from `/specs/004-mostra-lo-stato/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Test E2E Playwright richiesti esplicitamente (US4, FR-012 a FR-016)

**Organization**: Tasks grouped by user story per implementazione e testing indipendenti

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Può essere eseguito in parallelo (file diversi, no dipendenze)
- **[Story]**: User story di appartenenza (US1, US2, US3, US4)
- File paths assoluti inclusi nelle descrizioni

## Path Conventions
- Progetto single-page web app: repository root `/home/mario/rfi-poc/`
- File statici: `index.html`, `css/`, `js/`
- Test E2E: `tests/e2e/`

---

## Phase 1: Setup (Infrastruttura Condivisa)

**Purpose**: Nessuna configurazione necessaria - Playwright già configurato, loglevel già presente

**SKIP**: Questa feature non richiede setup iniziale. Playwright è già configurato per feature 002.

---

## Phase 2: Foundational (Prerequisiti Bloccanti)

**Purpose**: Componenti CSS base per badge e pulsanti cassetta

**⚠️ CRITICAL**: Completare prima di iniziare implementazione user stories

- [X] T001 Aggiungere stili badge stato cassetta in /home/mario/rfi-poc/css/components.css (.badge, .badge-chiusa, .badge-aperta)
- [X] T002 [P] Aggiungere stili pulsanti manutenzione in /home/mario/rfi-poc/css/components.css (.btn-manutenzione con hover/active)

**Checkpoint**: Stili CSS pronti - implementazione user stories può iniziare

---

## Phase 3: User Story 1 - Visualizzazione Stato Cassetta (Priority: P1) 🎯 MVP

**Goal**: Operatore vede stato cassetta (APERTA/CHIUSA) con badge colorato che si aggiorna automaticamente su eventi

**Independent Test**: Simulare evento cambioStato e verificare che badge mostri testo e colore corretti entro 500ms

### Implementation for User Story 1

- [ ] T003 [P] [US1] Creare classe SensoreCassetta in /home/mario/rfi-poc/js/sensore-cassetta.js (constructor, stato, listeners Map)
- [ ] T004 [P] [US1] Implementare metodi event emitter in /home/mario/rfi-poc/js/sensore-cassetta.js (on, emit, getStato)
- [ ] T005 [US1] Implementare notificaApertura in /home/mario/rfi-poc/js/sensore-cassetta.js (update stato, log INFO/DEBUG, emit evento)
- [ ] T006 [US1] Implementare notificaChiusura in /home/mario/rfi-poc/js/sensore-cassetta.js (update stato, log INFO/DEBUG, emit evento)
- [ ] T007 [P] [US1] Creare markup HTML pannello manutenzione in /home/mario/rfi-poc/index.html (section con id stato-cassetta, container pulsanti)
- [ ] T008 [P] [US1] Creare classe GestoreManutenzione in /home/mario/rfi-poc/js/gestore-manutenzione.js (constructor, riferimenti DOM)
- [ ] T009 [US1] Implementare aggiornaUI in /home/mario/rfi-poc/js/gestore-manutenzione.js (update textContent badge, toggle CSS classes)
- [ ] T010 [US1] Registrare listener cambioStato in /home/mario/rfi-poc/js/gestore-manutenzione.js (constructor, bind aggiornaUI)
- [ ] T011 [US1] Inizializzare SensoreCassetta e GestoreManutenzione in /home/mario/rfi-poc/js/app.js (DOMContentLoaded, esporre window.app)
- [ ] T012 [US1] Linkare sensore-cassetta.js e gestore-manutenzione.js in /home/mario/rfi-poc/index.html (script tags dopo logger.js)

**Checkpoint**: Badge visualizza stato CHIUSA iniziale, eventi cambioStato aggiornano UI automaticamente

---

## Phase 4: User Story 2 - Simulazione Evento Apertura Cassetta (Priority: P2)

**Goal**: Pulsante "Apri Cassetta" sempre abilitato simula evento hardware apertura, badge diventa verde APERTA

**Independent Test**: Click pulsante "Apri Cassetta", verificare badge mostra APERTA entro 500ms, pulsante rimane abilitato

### Implementation for User Story 2

- [ ] T013 [US2] Implementare handler click btnApri in /home/mario/rfi-poc/js/gestore-manutenzione.js (addEventListener, log INFO, call sensore.notificaApertura)
- [ ] T014 [US2] Verificare pulsante Apri sempre enabled in /home/mario/rfi-poc/index.html (NO attributo disabled su #btn-apri-cassetta)
- [ ] T015 [US2] Testare idempotenza apertura in /home/mario/rfi-poc/js/sensore-cassetta.js (doppio click apertura, log DEBUG se già APERTA)

**Checkpoint**: Click "Apri Cassetta" aggiorna badge a APERTA, pulsante sempre cliccabile anche quando già aperta

---

## Phase 5: User Story 3 - Simulazione Evento Chiusura Cassetta (Priority: P3)

**Goal**: Pulsante "Chiudi Cassetta" sempre abilitato simula evento hardware chiusura, badge diventa grigio CHIUSA

**Independent Test**: Click pulsante "Chiudi Cassetta", verificare badge mostra CHIUSA entro 500ms, pulsante rimane abilitato

### Implementation for User Story 3

- [ ] T016 [US3] Implementare handler click btnChiudi in /home/mario/rfi-poc/js/gestore-manutenzione.js (addEventListener, log INFO, call sensore.notificaChiusura)
- [ ] T017 [US3] Verificare pulsante Chiudi sempre enabled in /home/mario/rfi-poc/index.html (NO attributo disabled su #btn-chiudi-cassetta)
- [ ] T018 [US3] Testare idempotenza chiusura in /home/mario/rfi-poc/js/sensore-cassetta.js (doppio click chiusura, log DEBUG se già CHIUSA)

**Checkpoint**: Click "Chiudi Cassetta" aggiorna badge a CHIUSA, pulsante sempre cliccabile anche quando già chiusa

---

## Phase 6: User Story 4 - Test End-to-End Automatizzati (Priority: P1)

**Goal**: Suite Playwright E2E copre 100% scenari accettazione US1-US3, verifica idempotenza, eventi rapidi, zero regressioni

**Independent Test**: Eseguire `npm run test:feature-004`, verificare tutti test passano, report mostra coverage completa

### Tests for User Story 4 (REQUIRED per specifica)

**NOTE: Questi test verificano l'implementazione completa US1-US3**

- [ ] T019 [P] [US4] Setup describe block US1 in /home/mario/rfi-poc/tests/e2e/feature-004.spec.js (test visualizzazione stato)
- [ ] T020 [P] [US4] Test: stato iniziale CHIUSA in /home/mario/rfi-poc/tests/e2e/feature-004.spec.js (verificare #stato-cassetta text = CHIUSA)
- [ ] T021 [P] [US4] Test: aggiornamento UI su cambio stato in /home/mario/rfi-poc/tests/e2e/feature-004.spec.js (chiamare notificaApertura, verificare badge APERTA)
- [ ] T022 [P] [US4] Test: classe CSS badge CHIUSA in /home/mario/rfi-poc/tests/e2e/feature-004.spec.js (verificare .badge-chiusa presente)
- [ ] T023 [P] [US4] Test: classe CSS badge APERTA in /home/mario/rfi-poc/tests/e2e/feature-004.spec.js (verificare .badge-aperta presente)
- [ ] T024 [P] [US4] Setup describe block US2 in /home/mario/rfi-poc/tests/e2e/feature-004.spec.js (test simulazione apertura)
- [ ] T025 [P] [US4] Test: pulsante Apri sempre abilitato in /home/mario/rfi-poc/tests/e2e/feature-004.spec.js (verificare #btn-apri-cassetta NOT disabled)
- [ ] T026 [P] [US4] Test: click Apri → badge APERTA entro 500ms in /home/mario/rfi-poc/tests/e2e/feature-004.spec.js (click, waitForSelector timeout 500)
- [ ] T027 [P] [US4] Test: idempotenza apertura in /home/mario/rfi-poc/tests/e2e/feature-004.spec.js (doppio click Apri, badge rimane APERTA)
- [ ] T028 [P] [US4] Setup describe block US3 in /home/mario/rfi-poc/tests/e2e/feature-004.spec.js (test simulazione chiusura)
- [ ] T029 [P] [US4] Test: pulsante Chiudi sempre abilitato in /home/mario/rfi-poc/tests/e2e/feature-004.spec.js (verificare #btn-chiudi-cassetta NOT disabled)
- [ ] T030 [P] [US4] Test: click Chiudi → badge CHIUSA entro 500ms in /home/mario/rfi-poc/tests/e2e/feature-004.spec.js (click, waitForSelector timeout 500)
- [ ] T031 [P] [US4] Test: idempotenza chiusura in /home/mario/rfi-poc/tests/e2e/feature-004.spec.js (doppio click Chiudi, badge rimane CHIUSA)
- [ ] T032 [P] [US4] Setup describe block Edge Cases in /home/mario/rfi-poc/tests/e2e/feature-004.spec.js (test eventi multipli rapidi)
- [ ] T033 [P] [US4] Test: sequenza rapida Apri-Chiudi-Apri (5 eventi in 1 sec) in /home/mario/rfi-poc/tests/e2e/feature-004.spec.js (loop click alternati, stato finale APERTA)
- [ ] T034 [P] [US4] Test: 5 eventi apertura in 1 secondo in /home/mario/rfi-poc/tests/e2e/feature-004.spec.js (verificare gestione SC-005, UI non freeza)
- [ ] T035 [P] [US4] Setup describe block Regressione in /home/mario/rfi-poc/tests/e2e/feature-004.spec.js (test zero breaking changes)
- [ ] T036 [P] [US4] Test: feature 001 funziona in /home/mario/rfi-poc/tests/e2e/feature-004.spec.js (basic smoke test chiosco, monete, porta)
- [ ] T037 [P] [US4] Test: feature 002 funziona in /home/mario/rfi-poc/tests/e2e/feature-004.spec.js (pulsante persona passata, chiusura porta)
- [ ] T038 [P] [US4] Test: feature 003 funziona in /home/mario/rfi-poc/tests/e2e/feature-004.spec.js (svuotamento cassetta se esiste)
- [ ] T039 [US4] Aggiungere script npm test:feature-004 in /home/mario/rfi-poc/package.json (npx playwright test tests/e2e/feature-004.spec.js)
- [ ] T040 [US4] Eseguire npm run test:feature-004 e verificare tutti test passano (console output, 18+ test passati)

**Checkpoint**: Suite E2E completa, 18+ test passati, coverage 100% scenari accettazione, zero regressioni

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Miglioramenti che attraversano multiple user stories

- [ ] T041 [P] Verificare logging completo eventi cassetta (console log test manuale, verificare INFO per cambio stato, DEBUG per idempotenza)
- [ ] T042 [P] Validazione CSS responsive pannello manutenzione (test su diversi viewport, verificare leggibilità badge)
- [ ] T043 [P] Code review SensoreCassetta e GestoreManutenzione (verificare commenti italiano, nomi variabili leggibili)
- [ ] T044 Eseguire tutti test E2E insieme in /home/mario/rfi-poc (npm test, verificare feature 001-004 passano)
- [ ] T045 Validazione quickstart.md manuale (seguire guida passo-passo, verificare accuratezza istruzioni)
- [ ] T046 [P] Performance test eventi rapidi manuale (console.time update, verificare <500ms per SC-002)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: SKIPPED - no setup needed
- **Foundational (Phase 2)**: No dependencies - CSS styles prerequisiti per US1
- **User Story 1 (Phase 3)**: Dipende da Foundational - BLOCCA US2, US3 (devono visualizzare stato)
- **User Story 2 (Phase 4)**: Dipende da US1 complete - usa SensoreCassetta.notificaApertura
- **User Story 3 (Phase 5)**: Dipende da US1 complete - usa SensoreCassetta.notificaChiusura
- **User Story 4 (Phase 6)**: Dipende da US1, US2, US3 complete - testa implementazione completa
- **Polish (Phase 7)**: Dipende da tutte US complete

### User Story Dependencies

- **User Story 1 (P1)**: Dopo Foundational - **MVP CRITICAL** - base per tutte altre stories
- **User Story 2 (P2)**: Dopo US1 - può procedere in parallelo con US3
- **User Story 3 (P3)**: Dopo US1 - può procedere in parallelo con US2
- **User Story 4 (P1)**: Dopo US1+US2+US3 - test integrazione completa

### Within Each User Story

**US1**:
1. T003, T004, T007, T008 (parallelo) → Classi e markup base
2. T005, T006 (sequenziale dopo T003-T004) → Metodi notifica
3. T009, T010 (sequenziale dopo T008) → UI update
4. T011, T012 (finale) → Integrazione app.js

**US2**:
1. T013 → Handler click (usa US1 sensore.notificaApertura)
2. T014, T015 (parallelo) → Verifica abilitazione, idempotenza

**US3**:
1. T016 → Handler click (usa US1 sensore.notificaChiusura)
2. T017, T018 (parallelo) → Verifica abilitazione, idempotenza

**US4**:
1. T019-T038 (tutti parallelo!) → 20 test E2E indipendenti
2. T039 → Script npm
3. T040 → Esecuzione e validazione

### Parallel Opportunities

**Foundational (Phase 2)**:
- T001, T002 → CSS badge e pulsanti (file stesso, sequenziali MA brevi)

**User Story 1**:
- T003, T004, T007, T008 → 4 task file diversi (SensoreCassetta costruttore, metodi emitter, HTML markup, GestoreManutenzione costruttore)

**User Story 2 + 3 (dopo US1)**:
- US2 (T013-T015) e US3 (T016-T018) → PARALLELO (file diversi gestore-manutenzione.js handlers separati)

**User Story 4 (tutti test)**:
- T019-T038 → 20 test E2E PARALLELO (describe blocks indipendenti, possono essere scritti contemporaneamente)

**Polish**:
- T041, T042, T043, T046 → Parallelo (logging, CSS, code review, performance - attività indipendenti)

---

## Parallel Example: User Story 1

```bash
# Launch models e UI base insieme:
Task T003: "Creare classe SensoreCassetta in js/sensore-cassetta.js (constructor, stato, listeners Map)"
Task T004: "Implementare metodi event emitter in js/sensore-cassetta.js (on, emit, getStato)"
Task T007: "Creare markup HTML pannello manutenzione in index.html"
Task T008: "Creare classe GestoreManutenzione in js/gestore-manutenzione.js"

# Dopo completamento task sopra, procedi con:
Task T005: "Implementare notificaApertura in js/sensore-cassetta.js"
Task T006: "Implementare notificaChiusura in js/sensore-cassetta.js"
Task T009: "Implementare aggiornaUI in js/gestore-manutenzione.js"
```

---

## Parallel Example: User Story 4 (Test E2E)

```bash
# Launch tutti describe blocks in parallelo:
Task T019: "Setup describe block US1 in tests/e2e/feature-004.spec.js"
Task T024: "Setup describe block US2 in tests/e2e/feature-004.spec.js"
Task T028: "Setup describe block US3 in tests/e2e/feature-004.spec.js"
Task T032: "Setup describe block Edge Cases in tests/e2e/feature-004.spec.js"
Task T035: "Setup describe block Regressione in tests/e2e/feature-004.spec.js"

# Poi launch tutti test case in parallelo:
Task T020-T023: "Test visualizzazione stato (US1)"
Task T025-T027: "Test simulazione apertura (US2)"
Task T029-T031: "Test simulazione chiusura (US3)"
Task T033-T034: "Test edge cases eventi rapidi"
Task T036-T038: "Test regressione feature 001-003"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (CSS styles) → T001-T002
2. Complete Phase 3: User Story 1 (Visualizzazione stato) → T003-T012
3. **STOP and VALIDATE**: Test manuale badge CHIUSA iniziale, eventi cambioStato aggiornano UI
4. Deploy/demo MVP: Operatore vede stato cassetta real-time

**MVP Deliverable**: Badge stato cassetta funzionante, aggiornamento automatico eventi

### Incremental Delivery

1. Complete Foundational → CSS ready
2. Add User Story 1 → Test manually → **Deploy MVP** (badge visualizzazione)
3. Add User Story 2 → Test manually → **Deploy V2** (pulsante Apri)
4. Add User Story 3 → Test manually → **Deploy V3** (pulsante Chiudi)
5. Add User Story 4 → Run E2E tests → **Deploy V4** (test suite completa)
6. Polish → Final validation → **Release**

### Parallel Team Strategy

Con 2 sviluppatori:

1. Team completa Foundational insieme → CSS ready
2. Team completa US1 insieme → MVP ready
3. Split:
   - Developer A: User Story 2 (Apri)
   - Developer B: User Story 3 (Chiudi)
4. Entrambi completano → Developer A scrive test US2+US4, Developer B review code
5. Polish insieme

---

## Task Summary

**Total Tasks**: 46
- Phase 1 (Setup): 0 (skipped)
- Phase 2 (Foundational): 2 tasks (CSS)
- Phase 3 (US1 - Visualizzazione): 10 tasks (MVP critical)
- Phase 4 (US2 - Apertura): 3 tasks
- Phase 5 (US3 - Chiusura): 3 tasks
- Phase 6 (US4 - Test E2E): 22 tasks (20 test + script + execution)
- Phase 7 (Polish): 6 tasks

**Parallel Opportunities**:
- Foundational: 1 opportunity (2 CSS tasks, brevi)
- US1: 1 opportunity (4 task paralleli T003,T004,T007,T008)
- US2+US3: FULL PARALLEL (6 task dopo US1)
- US4: MASSIVE PARALLEL (20 test E2E simultanei)
- Polish: 1 opportunity (4 task paralleli)

**Independent Test Criteria**:
- US1: Badge mostra CHIUSA, eventi cambioStato aggiornano testo/colore
- US2: Click Apri → badge APERTA, pulsante sempre enabled
- US3: Click Chiudi → badge CHIUSA, pulsante sempre enabled
- US4: `npm run test:feature-004` → 18+ test passed, 0 failed

**MVP Scope**: Phase 2 + Phase 3 (US1) = 12 tasks = Badge visualizzazione stato funzionante

**Format Validation**: ✅ All tasks follow `- [ ] [ID] [P?] [Story?] Description with file path` format

---

## Notes

- **[P] tasks**: File diversi o operazioni indipendenti (20 test US4 tutti paralleli!)
- **[Story] label**: Tracciabilità task → user story spec.md
- **Independent stories**: US2 e US3 paralleli dopo US1, test US4 paralleli tra loro
- **Tests required**: US4 è Priority P1, richiesta esplicita utente "Scrivi i test e2e"
- **Zero regressioni**: Test US4 include smoke test feature 001-003 (T036-T038)
- **Performance**: Test T026, T030 verificano <500ms con Playwright timeout (SC-002)
- **Idempotenza**: Test T027, T031 verificano doppio click stesso pulsante (FR-008, FR-009)
- **Eventi rapidi**: Test T033, T034 verificano 5 eventi/sec (SC-005)
- **Commit strategy**: Commit dopo ogni fase complete, o dopo gruppi logici (es. T003-T004 insieme)
- **Stop points**: Dopo US1 (MVP), dopo US2+US3 (feature completa), dopo US4 (test coverage)
