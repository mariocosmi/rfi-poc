# Tasks: Simulatore Chiosco Ingresso

**Input**: Design documents from `/specs/001-un-mockup-che/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Nessun test automatizzato richiesto - testing manuale nel browser come definito in plan.md Fase 2

**Organization**: Tasks organizzati per user story per permettere implementazione e testing indipendenti di ogni storia.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Può essere eseguito in parallelo (file diversi, nessuna dipendenza)
- **[Story]**: A quale user story appartiene il task (es. US1, US2, US3, US4)
- Include percorsi file esatti nelle descrizioni

## Path Conventions
- **Single project**: File statici alla radice del repository
- Struttura: `index.html`, `js/`, `css/`, `assets/` alla radice
- Nessun build step, nessun src/ - file serviti direttamente

---

## Phase 1: Setup (Infrastruttura Condivisa)

**Purpose**: Inizializzazione progetto e struttura base

- [X] T001 Creare struttura directory progetto: js/, css/, assets/images/, assets/lib/
- [X] T002 [P] Scaricare libreria loglevel.min.js e salvarla in assets/lib/loglevel.min.js
- [X] T003 [P] Creare file CSS base: css/styles.css (stili generali), css/components.css (componenti hardware), css/animations.css (animazioni porta)

---

## Phase 2: Foundational (Prerequisiti Bloccanti)

**Purpose**: Infrastruttura core che DEVE essere completa prima di QUALSIASI user story

**⚠️ CRITICO**: Nessun lavoro su user story può iniziare fino al completamento di questa fase

- [X] T004 Creare index.html con layout base chiosco e sezioni per display, gettoniera, lettori, porta
- [X] T005 Implementare classe Validatore in js/validatore.js con metodi isCodiceAutorizzato(1-99) e isCartaVISA(inizia con "4")
- [X] T006 Implementare wrapper logging in js/logger.js configurando loglevel con livelli INFO, DEBUG, WARN, ERROR
- [X] T007 Implementare macchina a stati FSM in js/chiosco.js con stati: IDLE, PAGAMENTO_MONETE, PAGAMENTO_CARTA, VERIFICA_QR, VERIFICA_CARTA, PORTA_APERTA, TIMEOUT
- [X] T008 Implementare classe GestoreTimeout in js/chiosco.js per gestire timeout 20s con countdown display
- [X] T009 Implementare classe Display in js/display.js con metodi per aggiornare messaggi, importo rimanente, countdown
- [X] T010 Implementare classe Porta in js/porta.js con metodi apri(), chiudi(), timer chiusura automatica 15s

**Checkpoint**: Foundation ready - implementazione user story può iniziare in parallelo

---

## Phase 3: User Story 1 - Pagamento con Monete (Priority: P1) 🎯 MVP

**Goal**: L'utente può versare 1,20€ con monete virtuali (0,50€, 0,20€, ecc.) e il display mostra l'importo rimanente in tempo reale. Quando l'importo raggiunge 0,00€, la porta si apre automaticamente.

**Independent Test**:
1. Aprire index.html in browser
2. Click pulsante moneta 0,50€ → verifica display mostra "Rimanente: 0,70 €"
3. Click pulsante moneta 0,50€ → verifica display mostra "Rimanente: 0,20 €"
4. Click pulsante moneta 0,20€ → verifica display mostra "Rimanente: 0,00 €" e porta si apre
5. Verificare console log mostra ogni inserimento moneta con livello INFO
6. Verificare porta si chiude automaticamente dopo 15 secondi
7. Verificare sistema torna a stato IDLE con display "Benvenuto - Scegli modalità di accesso"

### Implementation for User Story 1

- [X] T011 [P] [US1] Implementare classe Gettoniera in js/gettoniera.js con gestione tagli monete (1€, 0,50€, 0,20€, 0,10€, 0,05€, 0,02€, 0,01€)
- [X] T012 [P] [US1] Creare UI gettoniera in index.html con pulsanti per ogni taglio moneta
- [X] T013 [US1] Implementare logica calcolo importo rimanente in js/gettoniera.js (partenza 1,20€, decremento ad ogni moneta)
- [X] T014 [US1] Collegare eventi click pulsanti monete a metodo inserisciMoneta() in js/chiosco.js
- [X] T015 [US1] Implementare transizione stato IDLE → PAGAMENTO_MONETE in js/chiosco.js al primo inserimento moneta
- [X] T016 [US1] Implementare aggiornamento display importo rimanente ad ogni inserimento in js/display.js
- [X] T017 [US1] Implementare controllo pagamento completato (rimanente <= 0) e transizione a PORTA_APERTA in js/chiosco.js
- [X] T018 [US1] Implementare apertura porta automatica quando pagamento completato in js/porta.js
- [X] T019 [US1] Implementare timeout 20s inattività con countdown visibile in js/chiosco.js usando GestoreTimeout
- [X] T020 [US1] Implementare gestione sovrapagamento (mostra 0,00€ non negativo) in js/gettoniera.js
- [X] T021 [US1] Implementare reset stato PAGAMENTO_MONETE → IDLE dopo timeout in js/chiosco.js
- [X] T022 [US1] Implementare chiusura automatica porta dopo 15s e reset sistema a IDLE in js/porta.js
- [X] T023 [US1] Aggiungere logging INFO per ogni inserimento moneta, apertura/chiusura porta, timeout in js/chiosco.js

**Checkpoint**: US1 completamente funzionale e testabile indipendentemente - MVP pronto per validazione

---

## Phase 4: User Story 2 - Pagamento con Carta di Credito (Priority: P2)

**Goal**: L'utente può pagare 1,20€ con carta di credito VISA contactless simulata. Il sistema processa il pagamento e apre la porta in caso di successo.

**Independent Test**:
1. Aprire index.html in browser
2. Click pulsante "Paga con Carta"
3. Verificare display mostra "Avvicina la carta al lettore"
4. Verificare altri input disabilitati (pulsanti grigi)
5. Click area lettore carte (simula avvicinamento carta VISA)
6. Verificare display mostra "Elaborazione..." per 1-2s
7. Verificare display mostra "Pagamento accettato" (80% probabilità) o "Pagamento rifiutato" (20%)
8. Se accettato: verificare porta si apre
9. Verificare console log mostra transazione con livello INFO o WARN

### Implementation for User Story 2

- [ ] T024 [P] [US2] Implementare classe LettoreCarte in js/lettore-carte.js con modalità PAGAMENTO e AUTORIZZAZIONE
- [ ] T025 [P] [US2] Creare UI lettore carte in index.html con pulsanti "Paga con Carta" e "Verifica Carta Autorizzata"
- [ ] T026 [P] [US2] Creare area cliccabile per simulare avvicinamento carta in index.html
- [ ] T027 [US2] Implementare metodo processaPagamento() in js/lettore-carte.js con validazione VISA (Validatore.isCartaVISA)
- [ ] T028 [US2] Implementare simulazione transazione con successo randomizzato 80/20 in js/lettore-carte.js
- [ ] T029 [US2] Collegare evento click "Paga con Carta" a transizione IDLE → PAGAMENTO_CARTA in js/chiosco.js
- [ ] T030 [US2] Implementare display "Avvicina la carta al lettore" durante stato PAGAMENTO_CARTA in js/display.js
- [ ] T031 [US2] Implementare disabilitazione input durante elaborazione transazione in js/chiosco.js
- [ ] T032 [US2] Implementare display "Elaborazione..." con delay 1-2s in js/display.js
- [ ] T033 [US2] Implementare gestione esito transazione (accettata → PORTA_APERTA, rifiutata → IDLE) in js/chiosco.js
- [ ] T034 [US2] Implementare display risultato transazione ("Pagamento accettato" / "Pagamento rifiutato - Riprova") in js/display.js
- [ ] T035 [US2] Implementare annullamento transazione se click fuori area lettore in js/lettore-carte.js
- [ ] T036 [US2] Implementare azzeramento monete inserite se si passa da PAGAMENTO_MONETE a PAGAMENTO_CARTA in js/chiosco.js
- [ ] T037 [US2] Aggiungere logging INFO per transazione accettata, WARN per rifiutata in js/lettore-carte.js

**Checkpoint**: US1 e US2 funzionano entrambi indipendentemente

---

## Phase 5: User Story 3 - Accesso con QR Code Autorizzato (Priority: P3)

**Goal**: L'utente autorizzato può mostrare QR code (numeri 1-99) per aprire porta senza pagamento.

**Independent Test**:
1. Aprire index.html in browser
2. Digitare "42" nel campo input QR
3. Click pulsante "Scansiona QR"
4. Verificare display mostra "Verifica in corso..."
5. Verificare display mostra "Accesso autorizzato" entro 1s
6. Verificare porta si apre immediatamente
7. Testare codici limite: "1" ✅, "99" ✅, "0" ❌, "100" ❌, "ABC" ❌
8. Verificare console log mostra verifica con livello INFO (autorizzato) o WARN (negato)

### Implementation for User Story 3

- [ ] T038 [P] [US3] Implementare classe LettoreQR in js/lettore-qr.js con metodo scansionaCodice()
- [ ] T039 [P] [US3] Creare UI lettore QR in index.html con campo input testo e pulsante "Scansiona QR"
- [ ] T040 [US3] Collegare evento click "Scansiona QR" a transizione IDLE → VERIFICA_QR in js/chiosco.js
- [ ] T041 [US3] Implementare validazione codice QR usando Validatore.isCodiceAutorizzato(1-99) in js/lettore-qr.js
- [ ] T042 [US3] Implementare display "Verifica in corso..." durante stato VERIFICA_QR in js/display.js
- [ ] T043 [US3] Implementare disabilitazione input durante verifica QR in js/chiosco.js
- [ ] T044 [US3] Implementare gestione esito verifica (autorizzato → PORTA_APERTA, negato → IDLE, errore → IDLE) in js/chiosco.js
- [ ] T045 [US3] Implementare display risultati verifica ("Accesso autorizzato" / "Accesso negato" / "Errore lettura QR") in js/display.js
- [ ] T046 [US3] Implementare gestione codici malformati (non numerico) con messaggio errore in js/lettore-qr.js
- [ ] T047 [US3] Implementare apertura porta immediata per codici autorizzati in js/chiosco.js
- [ ] T048 [US3] Aggiungere logging INFO per codice autorizzato, WARN per negato, ERROR per malformato in js/lettore-qr.js

**Checkpoint**: US1, US2 e US3 funzionano tutti indipendentemente

---

## Phase 6: User Story 4 - Accesso con Carta Contactless Autorizzata (Priority: P3)

**Goal**: L'utente autorizzato può avvicinare carta contactless (codici 1-99) per aprire porta senza pagamento.

**Independent Test**:
1. Aprire index.html in browser
2. Click pulsante "Verifica Carta Autorizzata"
3. Verificare display mostra "Inserisci codice carta autorizzata"
4. Digitare "50" nel campo input carta
5. Click pulsante "Verifica"
6. Verificare display mostra "Accesso autorizzato"
7. Verificare porta si apre immediatamente
8. Testare codici non autorizzati (es. "200") → display "Accesso negato - Effettua pagamento"
9. Verificare differenza tra "Paga con Carta" (US2) e "Verifica Carta Autorizzata" (US4)

### Implementation for User Story 4

- [ ] T049 [US4] Implementare modalità AUTORIZZAZIONE in js/lettore-carte.js (già creato in US2, aggiungere metodo verificaCarta())
- [ ] T050 [US4] Creare UI input codice carta autorizzata in index.html (campo input + pulsante "Verifica")
- [ ] T051 [US4] Collegare evento click "Verifica Carta Autorizzata" a transizione IDLE → VERIFICA_CARTA in js/chiosco.js
- [ ] T052 [US4] Implementare validazione codice carta usando Validatore.isCodiceAutorizzato(1-99) in js/lettore-carte.js
- [ ] T053 [US4] Implementare display "Inserisci codice carta autorizzata" durante stato VERIFICA_CARTA in js/display.js
- [ ] T054 [US4] Implementare disabilitazione input durante verifica carta in js/chiosco.js
- [ ] T055 [US4] Implementare gestione esito verifica (autorizzato → PORTA_APERTA, negato → IDLE, errore → IDLE) in js/chiosco.js
- [ ] T056 [US4] Implementare display risultati verifica ("Accesso autorizzato" / "Accesso negato - Effettua pagamento" / "Errore lettura carta") in js/display.js
- [ ] T057 [US4] Implementare differenziazione visiva tra pulsanti "Paga con Carta" e "Verifica Carta Autorizzata" in index.html
- [ ] T058 [US4] Aggiungere logging INFO per carta autorizzata, WARN per negata in js/lettore-carte.js

**Checkpoint**: Tutte le user stories (US1, US2, US3, US4) funzionano indipendentemente

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Miglioramenti che riguardano multiple user stories

- [ ] T059 [P] Implementare stili CSS componenti hardware in css/components.css (display, gettoniera, lettori, porta)
- [ ] T060 [P] Implementare animazione apertura/chiusura porta CSS in css/animations.css (transform translateY)
- [ ] T061 [P] Implementare feedback visivi pulsanti (hover, active, disabled) in css/components.css
- [ ] T062 [P] Creare/ottimizzare asset grafici in assets/images/ (icone monete, carta.svg, qrcode.svg, porta.svg)
- [ ] T063 Implementare responsive layout per risoluzione minima 1024x768 in css/styles.css
- [ ] T064 Implementare file app.js per inizializzazione applicazione e orchestrazione componenti
- [ ] T065 Testare compatibilità browser (Chrome, Firefox, Safari, Edge ultime 2 versioni)
- [ ] T066 Validare contro checklist test di accettazione in plan.md Fase 2
- [ ] T067 Verificare tutti i log console funzionano correttamente con loglevel
- [ ] T068 Aggiungere commenti JSDoc a tutte le classi e metodi pubblici
- [ ] T069 Verificare tutti i testi UI in italiano e messaggi display corretti
- [ ] T070 Eseguire scenari quickstart.md per validazione end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Nessuna dipendenza - può iniziare immediatamente
- **Foundational (Phase 2)**: Dipende da completamento Setup - BLOCCA tutte le user stories
- **User Stories (Phase 3-6)**: Tutte dipendono da completamento Foundational
  - User stories possono procedere in parallelo (se team multiple)
  - Oppure sequenzialmente in ordine priorità (P1 → P2 → P3 → P3)
- **Polish (Phase 7)**: Dipende da tutte le user stories desiderate completate

### User Story Dependencies

- **User Story 1 (P1)**: Può iniziare dopo Foundational (Phase 2) - Nessuna dipendenza da altre stories
- **User Story 2 (P2)**: Può iniziare dopo Foundational (Phase 2) - Indipendente da US1 ma condivide classe Porta
- **User Story 3 (P3)**: Può iniziare dopo Foundational (Phase 2) - Indipendente da US1/US2, condivide Display e Porta
- **User Story 4 (P3)**: Può iniziare dopo Foundational (Phase 2) - Riutilizza LettoreCarte di US2, ma indipendente

**Note**: US4 riutilizza `js/lettore-carte.js` creato in US2, quindi se implementato in parallelo, coordinare su questo file.

### Within Each User Story

- Layout HTML prima della logica JavaScript
- Classi base (Validatore, Logger) prima delle classi che le usano
- Macchina a stati (Chiosco) prima delle transizioni specifiche
- Display e Porta creati prima di essere usati nelle user stories
- UI components prima dei loro event handlers
- Logica core prima di logging

### Parallel Opportunities

- **Phase 1**: T002 e T003 possono eseguire in parallelo (file diversi)
- **Phase 7**: T059, T060, T061, T062 possono eseguire in parallelo (file CSS/asset diversi)
- **User Stories**: US1, US2, US3 possono eseguire in parallelo dopo Foundational (US4 condivide file con US2)
- **All'interno di US1**: T011 e T012 possono eseguire in parallelo (file diversi)
- **All'interno di US2**: T024, T025, T026 possono eseguire in parallelo
- **All'interno di US3**: T038 e T039 possono eseguire in parallelo
- Diverse user stories possono essere lavorate in parallelo da membri diversi del team

---

## Parallel Example: User Story 1

```bash
# Launch tutti i task UI per User Story 1 insieme:
Task: "Implementare classe Gettoniera in js/gettoniera.js"
Task: "Creare UI gettoniera in index.html con pulsanti"

# Questi possono eseguire contemporaneamente perché operano su file diversi
# Una volta completati, i task sequenziali (T013-T023) devono seguire l'ordine
```

---

## Parallel Example: User Story 2

```bash
# Launch setup iniziale User Story 2 insieme:
Task: "Implementare classe LettoreCarte in js/lettore-carte.js"
Task: "Creare UI lettore carte in index.html"
Task: "Creare area cliccabile per simulare avvicinamento carta"

# File diversi = possono eseguire in parallelo
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup *(~15 minuti)*
2. Complete Phase 2: Foundational *(~60 minuti - CRITICAL)*
3. Complete Phase 3: User Story 1 *(~90 minuti)*
4. **STOP and VALIDATE**: Testare User Story 1 indipendentemente con scenari plan.md
5. Deploy/demo se pronto - **MVP funzionante!**

**Tempo stimato MVP**: ~2.5-3 ore di implementazione

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready *(~75 min)*
2. Add User Story 1 → Test independently → Deploy/Demo *(MVP! ~90 min)*
3. Add User Story 2 → Test independently → Deploy/Demo *(+60 min)*
4. Add User Story 3 → Test independently → Deploy/Demo *(+45 min)*
5. Add User Story 4 → Test independently → Deploy/Demo *(+30 min)*
6. Polish phase → Final validation → Release *(+45 min)*

**Tempo stimato completo**: ~5-6 ore di implementazione

### Parallel Team Strategy

Con multiple developers:

1. Team completa Setup + Foundational insieme *(~75 min)*
2. Una volta Foundational completato:
   - **Developer A**: User Story 1 (Pagamento Monete) *(~90 min)*
   - **Developer B**: User Story 2 (Pagamento Carta) *(~60 min)*
   - **Developer C**: User Story 3 (QR Code) *(~45 min)*
3. Developer B completa User Story 4 dopo US2 (condivide file) *(+30 min)*
4. Team completa Polish insieme *(~45 min)*

**Tempo stimato con 3 developers**: ~3 ore totali (parallelizzato)

---

## Notes

- **[P] tasks**: File diversi, nessuna dipendenza - possono eseguire in parallelo
- **[Story] label**: Mappa task a user story specifica per tracciabilità
- **Nessun test automatizzato**: Testing manuale nel browser come definito in plan.md
- **Static web app**: Nessun server, nessun build, file serviti direttamente
- **Ogni user story indipendente**: Completabile e testabile separatamente
- **Commit**: Dopo ogni task o gruppo logico
- **Stop ai checkpoint**: Validare story indipendentemente
- **Evitare**: Task vaghi, conflitti stesso file, dipendenze cross-story che rompono indipendenza
- **Lingua**: Tutti i testi, commenti, log in italiano come da Costituzione Principio I
- **Logging**: Usare loglevel per tutti i log, livelli appropriati (INFO, WARN, ERROR, DEBUG)
- **Validazione**: Usare classe Validatore per tutti i controlli codici e carte
- **Browser target**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ (ultime 2 versioni)
