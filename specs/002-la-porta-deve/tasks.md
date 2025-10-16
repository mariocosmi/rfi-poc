# Tasks: Chiusura Porta su Passaggio Persona

**Input**: Design documents from `/specs/002-la-porta-deve/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Testing manuale nel browser - nessun test automatizzato richiesto

**Organization**: Tasks raggruppati per user story per abilitare implementazione e testing indipendente

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Può essere eseguito in parallelo (file diversi, nessuna dipendenza)
- **[Story]**: User story a cui appartiene (US1, US2, US3)
- Include path esatti file nelle descrizioni

## Path Conventions
- Repository root: `/home/mario/rfi-poc/`
- HTML: `index.html`
- CSS: `css/components.css`, `css/styles.css`
- JavaScript: `js/*.js`

---

## Phase 1: Setup (Modifiche Infrastruttura Condivisa)

**Purpose**: Preparazione modifiche HTML e CSS condivise

- [ ] T001 [P] Aggiungere pulsante "Persona passata" in index.html dopo `.porta-status`
- [ ] T002 [P] Aggiungere stili pulsante `.btn-passaggio` in css/components.css con visibilità condizionale

**Checkpoint**: HTML e CSS base pronti per integrazione JavaScript

---

## Phase 2: Foundational (Prerequisiti Bloccanti)

**Purpose**: Modifiche core a componenti esistenti che tutte le user stories richiedono

**⚠️ CRITICO**: Nessun lavoro sulle user stories può iniziare finché questa fase non è completa

- [ ] T003 Modificare classe Porta in js/porta.js - aggiungere attributi `timestampApertura`, `motivoApertura`, `timerChiusuraAutomatica`
- [ ] T004 Implementare metodo `Porta.chiudiManuale()` in js/porta.js che cancella timer e logga passaggio
- [ ] T005 Implementare metodo `Porta.getTempoAperturaSeconds()` in js/porta.js per calcolo tempo apertura
- [ ] T006 Modificare metodo `Porta.apri(motivo)` in js/porta.js per salvare timestamp e motivo apertura
- [ ] T007 Modificare metodo `Porta.chiudi()` in js/porta.js per resettare timestamp e motivo
- [ ] T008 Aggiungere metodo `Chiosco.onPassaggioPersona()` in js/chiosco.js per gestire evento click pulsante
- [ ] T009 Modificare metodo `Chiosco.onEntraPortaAperta()` in js/chiosco.js per mostrare pulsante passaggio
- [ ] T010 Modificare metodo `Chiosco.onEntraIDLE()` in js/chiosco.js per nascondere/resettare pulsante passaggio
- [ ] T011 Registrare event handler pulsante "Persona passata" in js/app.js che chiama `chiosco.onPassaggioPersona()`

**Checkpoint**: Foundation pronta - implementazione user stories può iniziare

---

## Phase 3: User Story 1 - Chiusura Porta Manuale dopo Passaggio (Priority: P1) 🎯 MVP

**Goal**: Pulsante "Persona passata" chiude immediatamente porta cancellando timer 15s

**Independent Test**: Aprire porta (qualsiasi metodo), click "Persona passata", verificare porta si chiude immediatamente (~2s) e log mostra tempo e metodo

### Implementazione User Story 1

- [ ] T012 [US1] Implementare logica chiusura immediata in `Porta.chiudiManuale()` con `clearTimeout(timerChiusuraAutomatica)`
- [ ] T013 [US1] Implementare logging passaggio persona con formato `[INFO] Passaggio persona - Porta aperta da Xs - Metodo: [metodo]`
- [ ] T014 [US1] Implementare disabilitazione pulsante in `Chiosco.onPassaggioPersona()` con `btn.disabled = true`
- [ ] T015 [US1] Aggiungere messaggio display "Passaggio rilevato - Porta in chiusura" in `Chiosco.onPassaggioPersona()`
- [ ] T016 [US1] Verificare timer 15s viene cancellato correttamente e porta non attende residuo tempo

**Test Manuale US1** (seguire quickstart.md sezione "Test 1" e "Test 2"):
1. Aprire porta con monete 1,20€
2. Click "Persona passata" dopo 3s
3. Verificare log: `[INFO] Passaggio persona rilevato - Porta aperta da 3s - Metodo: monete`
4. Verificare porta chiusa entro 2s totale
5. Verificare display torna a "Benvenuto..."
6. Ripetere con carta, QR, carta autorizzata

**Checkpoint**: User Story 1 completamente funzionante e testabile indipendentemente

---

## Phase 4: User Story 2 - Indicatore Visivo Pulsante Passaggio (Priority: P2)

**Goal**: Pulsante visibile solo quando porta aperta, nascosto in altri stati, con tooltip/hover

**Independent Test**: Verificare pulsante nascosto in IDLE/PAGAMENTO, visibile in PORTA_APERTA, tooltip funzionante

### Implementazione User Story 2

- [ ] T017 [P] [US2] Aggiungere tooltip al pulsante in index.html con attributo `title="Clicca dopo aver attraversato"`
- [ ] T018 [P] [US2] Implementare stili hover per `.btn-passaggio:hover` in css/components.css (cambio colore, shadow)
- [ ] T019 [P] [US2] Implementare stili disabled per `.btn-passaggio:disabled` in css/components.css (opacity 0.5)
- [ ] T020 [US2] Verificare pulsante ha classe `.hidden` in tutti gli stati tranne PORTA_APERTA
- [ ] T021 [US2] Verificare pulsante abilitato quando visibile, disabilitato dopo primo click
- [ ] T022 [US2] Testare posizionamento vicino porta per associazione visiva

**Test Manuale US2** (seguire quickstart.md sezione "Test 4" e "Test 5"):
1. Stato IDLE → verificare pulsante nascosto
2. Inserire 0,50€ → verificare pulsante ancora nascosto
3. Completare pagamento → porta apre → verificare pulsante visibile
4. Hover pulsante → verificare tooltip e effetto visivo
5. Click pulsante → verificare diventa grigio (disabled)
6. Porta chiude → verificare pulsante nascosto

**Checkpoint**: User Stories 1 E 2 funzionanti indipendentemente

---

## Phase 5: User Story 3 - Logging Passaggio Persona (Priority: P3)

**Goal**: Log completi con timestamp, tempo apertura, metodo accesso per ogni passaggio persona

**Independent Test**: Aprire DevTools console, testare passaggio con diversi metodi, verificare log formato corretto

### Implementazione User Story 3

- [ ] T023 [US3] Verificare log include timestamp automatico da loglevel (già implementato)
- [ ] T024 [US3] Verificare log include tempo apertura da `getTempoAperturaSeconds()`
- [ ] T025 [US3] Verificare log include metodo corretto ('monete', 'carta', 'qr', 'carta-autorizzata')
- [ ] T026 [US3] Testare log con tutti e 4 metodi di accesso (monete, carta, QR, carta autorizzata)
- [ ] T027 [US3] Verificare log multipli distinguibili con timestamp diversi

**Test Manuale US3** (seguire quickstart.md sezione "Test 3"):
1. Console: `log.setLevel('info')`
2. Pagamento monete → attesa 3s → click "Persona passata"
   - Verifica log: `[INFO] Passaggio persona rilevato - Porta aperta da 3s - Metodo: monete`
3. Pagamento carta → attesa 2s → click "Persona passata"
   - Verifica log: `[INFO] ... 2s - Metodo: carta`
4. QR "42" → click immediato "Persona passata"
   - Verifica log: `[INFO] ... 0s - Metodo: qr`
5. Carta autorizzata "50" → attesa 4s → click "Persona passata"
   - Verifica log: `[INFO] ... 4s - Metodo: carta-autorizzata`

**Checkpoint**: Tutte le user stories funzionanti indipendentemente con logging completo

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Miglioramenti che interessano più user stories e test regressione

- [ ] T028 [P] Test regressione feature 001: Verificare pagamento monete funziona identicamente
- [ ] T029 [P] Test regressione feature 001: Verificare pagamento carta funziona
- [ ] T030 [P] Test regressione feature 001: Verificare QR code autorizzato funziona
- [ ] T031 [P] Test regressione feature 001: Verificare timeout 20s inattività funziona
- [ ] T032 [P] Test regressione feature 001: Verificare chiusura automatica 15s funziona se utente NON clicca pulsante
- [ ] T033 Test casi limite: Click multipli rapidi → verificare solo primo processato
- [ ] T034 Test casi limite: Click durante chiusura → verificare click ignorato
- [ ] T035 Test casi limite: Click immediato all'apertura (<200ms) → verificare accettato
- [ ] T036 Test casi limite: Click a 14.5s → verificare timer cancellato e chiusura immediata
- [ ] T037 [P] Verificare compatibilità browser Chrome (ultime 2 versioni)
- [ ] T038 [P] Verificare compatibilità browser Firefox (ultime 2 versioni)
- [ ] T039 [P] Verificare compatibilità browser Safari (se disponibile macOS)
- [ ] T040 [P] Verificare compatibilità browser Edge (ultime 2 versioni)
- [ ] T041 Misurare performance: Cronometrare chiusura porta < 2s dal click (SC-003)
- [ ] T042 Misurare performance: Calcolare riduzione tempo ciclo vs baseline (SC-001 target 40%)
- [ ] T043 Code cleanup: Rimuovere log debug eccessivi se presenti
- [ ] T044 Code cleanup: Verificare commenti codice in italiano
- [ ] T045 Aggiornare CLAUDE.md se necessario (già fatto in /speckit.plan)
- [ ] T046 Eseguire validazione quickstart.md completa (30-45 min)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Nessuna dipendenza - può iniziare immediatamente
- **Foundational (Phase 2)**: Dipende da Setup - BLOCCA tutte le user stories
- **User Stories (Phase 3-5)**: Tutte dipendono dal completamento Foundational
  - User stories possono procedere in parallelo (se più sviluppatori)
  - Oppure sequenzialmente in ordine priorità (P1 → P2 → P3) - **CONSIGLIATO per singolo sviluppatore**
- **Polish (Phase 6)**: Dipende dal completamento di tutte le user stories desiderate

### User Story Dependencies

- **User Story 1 (P1)**: Può iniziare dopo Foundational (Phase 2) - Nessuna dipendenza da altre stories
- **User Story 2 (P2)**: Può iniziare dopo Foundational (Phase 2) - Nessuna dipendenza da US1 (indipendente)
- **User Story 3 (P3)**: Può iniziare dopo Foundational (Phase 2) - Nessuna dipendenza da US1/US2 (indipendente)

**Nota Importante**: Tutte e 3 le user stories sono **completamente indipendenti** e possono essere implementate in qualsiasi ordine dopo Phase 2. Tuttavia, seguire ordine priorità (US1 → US2 → US3) garantisce MVP funzionante prima.

### Within Each User Story

- **US1**: Tasks T012-T016 possono essere eseguiti sequenzialmente (modificano stessi file)
- **US2**: Tasks T017-T019 possono essere eseguiti in parallelo (file diversi HTML/CSS)
- **US3**: Tasks T023-T027 sono principalmente verifica/testing

### Parallel Opportunities

- **Phase 1**: T001 e T002 possono essere eseguiti in parallelo (HTML e CSS indipendenti)
- **Phase 2**: T003-T007 (modifiche Porta) possono essere raggruppati, T008-T010 (modifiche Chiosco) raggruppati, T011 (app.js) indipendente
- **Phase 4 (US2)**: T017, T018, T019 possono essere eseguiti in parallelo
- **Phase 6**: Molti task test regressione (T028-T032, T037-T040) possono essere eseguiti in parallelo se più browser/sessioni disponibili

---

## Parallel Example: User Story 2

```bash
# Lancio task US2 in parallelo (file diversi):
Task T017: "Aggiungere tooltip in index.html"
Task T018: "Implementare stili hover in css/components.css"
Task T019: "Implementare stili disabled in css/components.css"

# Tutti modificano file diversi o sezioni diverse CSS, nessun conflitto
```

---

## Implementation Strategy

### MVP First (Solo User Story 1)

1. Completare Phase 1: Setup (T001-T002) → ~15 minuti
2. Completare Phase 2: Foundational (T003-T011) → ~1-2 ore
3. Completare Phase 3: User Story 1 (T012-T016) → ~1 ora
4. **STOP e VALIDA**: Testare User Story 1 indipendentemente (quickstart.md Test 1 e 2)
5. Deploy/demo se pronto → **MVP FUNZIONANTE**

**Tempo Totale MVP**: ~3-4 ore

### Incremental Delivery (Consigliato)

1. Completare Setup + Foundational → Foundation pronta (~2 ore)
2. Aggiungere User Story 1 → Test indipendente → Commit (MVP! ~1 ora)
3. Aggiungere User Story 2 → Test indipendente → Commit (~1 ora)
4. Aggiungere User Story 3 → Test indipendente → Commit (~30 min)
5. Phase 6: Polish → Test regressione completo → Commit finale (~1-2 ore)

**Tempo Totale Feature Completa**: ~5-7 ore

### Parallel Team Strategy

Con 2 sviluppatori:

1. Team completa Setup + Foundational insieme (~2 ore)
2. Una volta Foundational completato:
   - **Developer A**: User Story 1 (P1 - MVP) + User Story 3 (P3 - logging)
   - **Developer B**: User Story 2 (P2 - UI/UX)
3. Sincronizzazione: Merge stories, test integrazione
4. Insieme: Phase 6 Polish + test regressione

**Tempo Totale con 2 Dev**: ~3-4 ore

---

## Parallel Example: Foundational Phase

```bash
# Raggruppamento suggerito per Phase 2:

# Gruppo A - Modifiche porta.js (T003-T007)
Task: "Modificare tutti gli attributi e metodi di Porta in js/porta.js"
# Eseguire come singola sessione: ~30-45 minuti

# Gruppo B - Modifiche chiosco.js (T008-T010)
Task: "Aggiungere/modificare metodi Chiosco in js/chiosco.js"
# Eseguire come singola sessione: ~30-45 minuti

# Task C - Modifica app.js (T011)
Task: "Registrare event handler in js/app.js"
# Indipendente, può essere fatto in parallelo: ~15 minuti

# Se singolo sviluppatore: A → B → C sequenzialmente
# Se 2 sviluppatori: Dev1=(A+C), Dev2=B in parallelo
```

---

## Notes

- **[P] tasks**: File diversi, nessuna dipendenza - possono essere eseguiti in parallelo
- **[Story] label**: Mappa task a user story specifica per tracciabilità
- **Ogni user story**: Completabile e testabile indipendentemente
- **Testing**: Manuale nel browser seguendo quickstart.md - nessun test automatizzato
- **Commit**: Dopo ogni task logico o gruppo di task (suggerito: dopo ogni user story completa)
- **Stop ai checkpoint**: Validare story indipendentemente prima di procedere
- **File principali modificati**: `index.html` (1 aggiunta), `css/components.css` (2 sezioni), `js/porta.js` (7 modifiche), `js/chiosco.js` (3 modifiche), `js/app.js` (1 aggiunta)
- **Total Lines of Code**: ~100-150 righe JavaScript aggiuntive (stimato da plan.md)

---

## Checklist Finale Pre-Commit

Prima di committare feature completa:

- [ ] Tutte e 3 le user stories completate e testate indipendentemente
- [ ] Test regressione feature 001 superato (nessun breaking change)
- [ ] Tutti i casi limite testati (click multipli, timing edge cases)
- [ ] Compatibilità verificata su almeno 2 browser (Chrome + Firefox minimo)
- [ ] Performance SC-003 verificata (chiusura < 2s)
- [ ] Nessun errore JavaScript console durante testing
- [ ] Logging completo e corretto per tutti i metodi
- [ ] Code cleanup completato (commenti italiano, no log debug eccessivi)
- [ ] CLAUDE.md aggiornato (già fatto)
- [ ] Validazione quickstart.md completata

**Pronto per commit!** 🎉
