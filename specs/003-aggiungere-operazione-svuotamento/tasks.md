# Tasks: Svuotamento Cassetta Monete con Autenticazione

**Feature**: 003-aggiungere-operazione-svuotamento
**Branch**: `003-aggiungere-operazione-svuotamento`
**Generated**: 2025-10-17

## Overview

Questo documento contiene il breakdown dettagliato dei task per implementare la feature di svuotamento cassetta monete con autenticazione operatore. I task sono organizzati per user story per permettere implementazione e testing indipendenti.

**Total Tasks**: 59 tasks (implementazione + test E2E obbligatori)
**Parallelizable Tasks**: 15 tasks (marcati con [P])
**User Stories**: 5 (US1-US5)
**Test E2E**: OBBLIGATORI per ogni user story (Playwright)

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**MVP = US1 + US2** (entrambe P1 - priorità massima)

**Rationale**:
- US1 (Svuotamento Autorizzato) è il happy path principale
- US2 (Timeout → FUORI_SERVIZIO) è critico per sicurezza
- Insieme costituiscono il flusso completo sicuro: successo + fallback sicurezza
- US3-US5 sono enhancement che possono essere aggiunti incrementalmente

### Incremental Delivery

1. **Fase 1-2**: Setup + Foundational (blocker per tutto)
2. **MVP**: Implementare US1 + US2 (deliverable funzionante e sicuro)
3. **Post-MVP**: US3 (reset), US4 (logging avanzato), US5 (edge cases)
4. **Final**: Polish & testing regressione completo

---

## Phase 1: Setup & Preparation

**Goal**: Preparare ambiente per implementazione feature 003

**Duration**: ~30 min

### Tasks

- [X] T001 Verificare branch `003-aggiungere-operazione-svuotamento` creato e attivo
- [X] T002 Verificare documentazione completa (plan.md, spec.md, data-model.md, research.md, quickstart.md, contracts/)
- [X] T003 Verificare feature 001/002 funzionanti (baseline per regressione)
- [X] T004 Aprire DevTools console e set `log.setLevel('debug')` per visibilità completa log

---

## Phase 2: Foundational Components

**Goal**: Implementare componenti core condivisi da tutte le user stories (blocker)

**Duration**: ~2-3 ore

**Independent Test Criteria**:
- [ ] SensoreCassetta: apri() emette evento cassettaAperta, chiudi() emette cassettaChiusa
- [ ] Suoneria: attiva() genera beep 800Hz, disattiva() ferma beep
- [ ] GestoreManutenzione: avviaCountdown() decrementa ogni 1s, fermaCountdown() interrompe

### Tasks

- [X] T005 [P] Implementare classe SensoreCassetta in js/sensore-cassetta.js
  - Constructor: inizializza stato 'chiusa', listeners vuoti
  - Metodo apri(): cambia stato → 'aperta', notifica listeners cassettaAperta
  - Metodo chiudi(): cambia stato → 'chiusa', notifica listeners cassettaChiusa
  - Metodo on(evento, callback): registra listener per evento
  - Metodo getStato(): ritorna stato corrente
  - Logging: log.info per ogni cambio stato

- [X] T006 [P] Implementare classe Suoneria in js/suoneria.js
  - Constructor: crea AudioContext, inizializza oscillator/gainNode null, attiva false
  - Metodo attiva(): crea oscillator (sine wave, 800Hz), gainNode (0.3 volume), connette, start(), attiva = true
  - Metodo disattiva(): stop oscillator, disconnect nodes, attiva = false
  - Metodo isAttiva(): ritorna booleano attiva
  - Gestione autoplay policy: resume AudioContext su primo user click
  - Override test: rispetta window.suoneriaEnabled = false

- [X] T007 [P] Implementare classe GestoreManutenzione base in js/gestore-manutenzione.js
  - Constructor: riceve riferimento chiosco, inizializza timerCountdown null, secondiRimanenti 10
  - Metodo avviaCountdown(callback): avvia setInterval(1000), decrementa secondiRimanenti, aggiorna display, chiama callback se 0
  - Metodo fermaCountdown(): clearInterval, reset timerCountdown null
  - Metodo aggiornaDisplay(): chiama chiosco.display.aggiornaCountdown(secondiRimanenti)

- [X] T008 [P] Implementare classe OperazioneSvuotamento in js/gestore-manutenzione.js (stesso file)
  - Constructor: inizializza tutti attributi null (timestampApertura, codiceOperatore, etc.)
  - Metodo logEvento(tipo, dettagli): switch su tipo, logga con livello appropriato (INFO/WARN/ERROR), aggiorna timestamp/attributi
  - Tipi supportati: APERTURA, AUTH_SUCCESS, AUTH_FAIL, TIMEOUT, CHIUSURA, AZZERAMENTO, FUORI_SERVIZIO, RESET
  - Timestamp: new Date().toISOString()

- [X] T009 Aggiungere metodi a GestoreManutenzione per tracking operazione
  - Metodo iniziaOperazione(): crea new OperazioneSvuotamento, logEvento('APERTURA'), ritorna operazione
  - Metodo completaOperazione(azzerato, saldoPrima, saldoDopo): logEvento('AZZERAMENTO', {azzerato, saldoPrima, saldoDopo})

- [X] T010 Linkare nuovi file JS in index.html (prima di app.js)
  - Aggiungere `<script src="js/sensore-cassetta.js"></script>`
  - Aggiungere `<script src="js/suoneria.js"></script>`
  - Aggiungere `<script src="js/gestore-manutenzione.js"></script>`

---

## Phase 3: User Story 1 - Svuotamento Cassetta Autorizzato (P1 MVP)

**Story Goal**: Un operatore autorizzato può completare operazione svuotamento cassetta (apri → autentica → chiudi → azzera/mantieni saldo) in < 30s

**Priority**: P1 (MVP - must have)

**Independent Test Criteria**:
- [ ] Apertura cassetta → display "Cassetta aperta - Autenticazione richiesta" + countdown 10s
- [ ] Autenticazione carta 42 → display "Operatore autorizzato (42)" + countdown stop
- [ ] Chiusura cassetta → display "Azzerare saldo (15.80€)? [Sì] [No]"
- [ ] Click Sì → saldo 0.00€, display "Saldo azzerato" → IDLE dopo 3s
- [ ] Click No → saldo mantenuto, display "Saldo mantenuto" → IDLE dopo 3s
- [ ] Console log: [INFO] APERTURA, AUTH_SUCCESS, CHIUSURA, AZZERAMENTO

**Duration**: ~4-5 ore

### Tasks - Chiosco FSM Extension

- [ ] T011 [US1] Aggiungere nuovi stati FSM a js/chiosco.js
  - In constructor, sezione this.stati, aggiungere:
    - 'MANUTENZIONE_AUTH_PENDING': { permessi: ['MANUTENZIONE_ATTESA_CHIUSURA', 'FUORI_SERVIZIO', 'IDLE'] }
    - 'MANUTENZIONE_ATTESA_CHIUSURA': { permessi: ['MANUTENZIONE_SCELTA_AZZERAMENTO', 'FUORI_SERVIZIO'] }
    - 'MANUTENZIONE_SCELTA_AZZERAMENTO': { permessi: ['IDLE'] }

- [ ] T012 [US1] Inizializzare componenti manutenzione in js/chiosco.js constructor
  - Aggiungere: this.sensoreCassetta = new SensoreCassetta()
  - Aggiungere: this.suoneria = new Suoneria()
  - Aggiungere: this.gestoreManutenzione = new GestoreManutenzione(this)
  - Registrare listeners sensore:
    - this.sensoreCassetta.on('cassettaAperta', () => this.onCassettaAperta())
    - this.sensoreCassetta.on('cassettaChiusa', () => this.onCassettaChiusa())

- [ ] T013 [US1] Implementare handler onCassettaAperta() in js/chiosco.js
  - Check stato corrente: se IDLE → transizione('MANUTENZIONE_AUTH_PENDING')
  - Se stato in ['PORTA_APERTA', 'PAGAMENTO_MONETE', 'PAGAMENTO_CARTA'] → set flag this.pendenteAperturaCassetta = true, log.info('Attesa fine transito')
  - Altrimenti → log.warn('Apertura cassetta ignorata, stato incompatibile')

- [ ] T014 [US1] Implementare handler onEntraManutenzioneAuthPending() in js/chiosco.js
  - Disabilitare input cliente: this.abilitaInput(false)
  - Avviare countdown: this.gestoreManutenzione.avviaCountdown(() => this.transizione('FUORI_SERVIZIO'))
  - Iniziare operazione: this.operazioneCorrente = this.gestoreManutenzione.iniziaOperazione()
  - Display: this.display.mostraMessaggio('Cassetta aperta - Autenticazione richiesta', 'warning')

- [ ] T015 [US1] Gestire autenticazione operatore in js/chiosco.js (modificare verificaCarta metodo esistente)
  - Aggiungere check: se stato === 'MANUTENZIONE_AUTH_PENDING' → chiama this.onAutenticazioneOperatore(codice)
  - Implementare onAutenticazioneOperatore(codice):
    - Validare: Validatore.isCodiceAutorizzato(codice)
    - Se valido: ferma countdown, logEvento('AUTH_SUCCESS', {codice}), transizione('MANUTENZIONE_ATTESA_CHIUSURA')
    - Se non valido: logEvento('AUTH_FAIL', {codice}), mostra "Accesso negato" 2s, countdown continua

- [ ] T016 [US1] Implementare handler onEntraManutenzioneAttesaChiusura() in js/chiosco.js
  - Fermare countdown: this.gestoreManutenzione.fermaCountdown()
  - Display: this.display.mostraMessaggio(`Operatore autorizzato (${this.operazioneCorrente.codiceOperatore}) - Attesa chiusura cassetta`, 'success')

- [ ] T017 [US1] Implementare handler onCassettaChiusa() in js/chiosco.js
  - Check stato: se MANUTENZIONE_ATTESA_CHIUSURA → transizione('MANUTENZIONE_SCELTA_AZZERAMENTO')
  - LogEvento: this.operazioneCorrente.logEvento('CHIUSURA')

- [ ] T018 [US1] Implementare handler onEntraManutenzioneSceltaAzzeramento() in js/chiosco.js
  - Validare saldo: const saldo = this.gettoniera.validaSaldo()
  - Mostrare pulsanti: this.display.mostraPulsantiAzzeramento(saldo)

### Tasks - Display Extension

- [ ] T019 [P] [US1] Implementare Display.aggiornaCountdown() in js/display.js
  - Parametro: secondi (number)
  - Selezionare elemento: const countdownEl = document.getElementById('countdown-timer')
  - Aggiornare testo: `${secondi} secondi rimasti`
  - Se secondi <= 3: aggiungere classe 'urgente' (testo rosso)
  - Altrimenti: rimuovere classe 'urgente'

- [ ] T020 [P] [US1] Implementare Display.mostraPulsantiAzzeramento() in js/display.js
  - Parametro: saldo (number)
  - Mostrare messaggio: `Azzerare saldo monete (${saldo.toFixed(2)}€)?`
  - Abilitare pulsanti: document.getElementById('btn-azzera-si').disabled = false
  - Abilitare pulsanti: document.getElementById('btn-azzera-no').disabled = false
  - Mostrare container: document.getElementById('pulsanti-azzeramento').style.display = 'block'

- [ ] T021 [P] [US1] Implementare Display.nascondiPulsantiAzzeramento() in js/display.js
  - Disabilitare pulsanti: btn-azzera-si/no.disabled = true
  - Nascondere container: pulsanti-azzeramento.style.display = 'none'

### Tasks - Gettoniera Extension

- [ ] T022 [P] [US1] Implementare Gettoniera.validaSaldo() in js/gettoniera.js
  - Calcolare saldo: let saldo = this.importoTotale - this.importoInserito
  - Validare: se isNaN(saldo) || saldo < 0 → log.warn, saldo = 0.00
  - Ritornare: saldo

- [ ] T023 [P] [US1] Implementare Gettoniera.azzeraSaldo() in js/gettoniera.js
  - Validare saldo precedente: const saldoPrecedente = this.validaSaldo()
  - Azzerare: this.importoInserito = 0, this.importoTotale = 1.20
  - Loggare: log.info(`Saldo azzerato (da ${saldoPrecedente.toFixed(2)}€ a 0.00€)`)
  - Ritornare: saldoPrecedente

### Tasks - UI & CSS

- [ ] T024 [US1] Aggiungere pannello admin HTML in index.html
  - Aggiungere dopo elemento .chiosco-container:
    ```html
    <div class="pannello-admin">
      <h3>Controlli Manutenzione</h3>
      <button id="btn-apri-cassetta" class="btn-admin">🔓 Apri Cassetta</button>
      <button id="btn-chiudi-cassetta" class="btn-admin" disabled>🔒 Chiudi Cassetta</button>
      <div id="stato-cassetta" class="stato-cassetta">Cassetta: <span id="stato-cassetta-text">Chiusa</span></div>
    </div>
    ```

- [ ] T025 [US1] Aggiungere pulsanti azzeramento HTML in index.html (dentro .display-container)
  - Aggiungere:
    ```html
    <div id="pulsanti-azzeramento" class="pulsanti-azzeramento" style="display: none;">
      <button id="btn-azzera-si" class="btn-azzeramento btn-si">Sì</button>
      <button id="btn-azzera-no" class="btn-azzeramento btn-no">No</button>
    </div>
    ```

- [ ] T026 [US1] Aggiungere countdown timer HTML in index.html (dentro .display-container)
  - Aggiungere: `<div id="countdown-timer" class="countdown-timer"></div>`

- [ ] T027 [US1] Aggiungere stili pannello admin in css/components.css
  - .pannello-admin: posizione bottom, padding, border-top, background grigio chiaro
  - .btn-admin: min 80x40px, padding, border-radius, hover effect
  - .stato-cassetta: display inline-block, margin-left
  - .stato-cassetta span: font-weight bold, colore verde (chiusa) o rosso (aperta)

- [ ] T028 [US1] Aggiungere stili countdown timer in css/components.css
  - .countdown-timer: font-size 3rem, font-weight bold, text-align center, margin 20px 0
  - .countdown-timer.urgente: color red, animation pulse

- [ ] T029 [US1] Aggiungere stili pulsanti azzeramento in css/components.css
  - .pulsanti-azzeramento: display flex, justify-content center, gap 20px, margin-top 20px
  - .btn-azzeramento: min 80x40px, font-size 1.2rem, cursor pointer, border-radius 8px
  - .btn-si: background green, color white
  - .btn-no: background red, color white
  - .btn-azzeramento:disabled: opacity 0.5, cursor not-allowed

### Tasks - Integration

- [ ] T030 [US1] Collegare event handlers pulsanti admin in js/app.js
  - getElementById btn-apri-cassetta: addEventListener('click', () => app.chiosco.sensoreCassetta.apri())
  - getElementById btn-chiudi-cassetta: addEventListener('click', () => app.chiosco.sensoreCassetta.chiudi())
  - Aggiungere listener sensore per aggiornare stato UI: sensoreCassetta.on('cassettaAperta', () => { aggiorna text stato, disabilita apri, abilita chiudi })
  - Analogo per cassettaChiusa

- [ ] T031 [US1] Collegare event handlers pulsanti azzeramento in js/app.js
  - getElementById btn-azzera-si: addEventListener('click', () => {
    - Disabilita pulsanti immediatamente
    - const saldoPrima = app.chiosco.gettoniera.azzeraSaldo()
    - app.chiosco.gestoreManutenzione.completaOperazione(true, saldoPrima, 0.00)
    - app.chiosco.display.mostraMessaggio('Saldo azzerato - Operazione completata', 'success')
    - setTimeout(() => app.chiosco.transizione('IDLE'), 3000)
  - })
  - Analogo per btn-azzera-no (azzerato = false, saldoPrima = saldoDopo)

- [ ] T032 [US1] Modificare Chiosco.abilitaInput() per disabilitare durante manutenzione in js/chiosco.js
  - Aggiungere all'inizio metodo:
    ```javascript
    const statiManutenzione = ['MANUTENZIONE_AUTH_PENDING', 'MANUTENZIONE_ATTESA_CHIUSURA', 'MANUTENZIONE_SCELTA_AZZERAMENTO', 'FUORI_SERVIZIO'];
    if (statiManutenzione.includes(this.stato)) {
      this.inputAbilitato = false;
      return;
    }
    ```

### Tasks - Testing E2E US1 (OBBLIGATORIO)

- [ ] T033 [US1] Creare test E2E Playwright in tests/e2e/feature-003-us1.spec.js
  - Test 1: Svuotamento con azzeramento Sì
    - Navigare a localhost, verificare stato IDLE
    - Click "Apri Cassetta" → assert display contains "Autenticazione richiesta"
    - Assert countdown visibile e parte da 10s
    - Inserire carta 42 → assert display contains "Operatore autorizzato (42)"
    - Assert countdown fermato
    - Click "Chiudi Cassetta" → assert pulsanti Sì/No visibili
    - Assert messaggio contiene saldo (regex: /\d+\.\d{2}€/)
    - Click "Sì" → assert display "Saldo azzerato"
    - Attendere 3s → assert stato ritorna IDLE
    - Assert console log contiene: APERTURA, AUTH_SUCCESS, CHIUSURA, AZZERAMENTO (azzerato: true)

- [ ] T034 [US1] Aggiungere test E2E in tests/e2e/feature-003-us1.spec.js
  - Test 2: Svuotamento con mantenimento saldo No
    - Inserire monete per creare saldo > 0 (es. 0.50€)
    - Eseguire flusso apri → autentica → chiudi
    - Click "No" → assert display "Saldo mantenuto"
    - Verificare saldo gettoniera non cambiato (via console window.app.gettoniera)
    - Assert log: AZZERAMENTO (azzerato: false)

- [ ] T035 [US1] Aggiungere test E2E in tests/e2e/feature-003-us1.spec.js
  - Test 3: Autenticazione fallita con codice non autorizzato
    - Click "Apri Cassetta"
    - Inserire carta 777 (non autorizzata) → assert "Accesso negato (777)"
    - Attendere 2s → assert display torna "Autenticazione richiesta"
    - Assert countdown ancora attivo e < 10s
    - Inserire carta 42 valida → assert autenticazione successo
    - Completare flusso normalmente

---

## Phase 4: User Story 2 - Timeout Autenticazione → FUORI_SERVIZIO (P1 MVP)

**Story Goal**: Sistema entra in FUORI_SERVIZIO con suoneria se operatore non autentica entro 10s, disabilitando tutti input cliente

**Priority**: P1 (MVP - must have for security)

**Independent Test Criteria**:
- [ ] Countdown 10s → 0s senza auth → suoneria attiva + display "⚠️ FUORI SERVIZIO"
- [ ] Durante FUORI_SERVIZIO: tutti input cliente (monete, carte, QR) ignorati
- [ ] Suoneria continua finché non resettato manualmente
- [ ] Console log: [ERROR] TIMEOUT, [ERROR] FUORI_SERVIZIO

**Duration**: ~2 ore

### Tasks

- [ ] T036 [US2] Aggiungere stato FUORI_SERVIZIO a js/chiosco.js
  - In constructor, this.stati, aggiungere: 'FUORI_SERVIZIO': { permessi: ['IDLE'] }

- [ ] T037 [US2] Implementare handler onEntraFuoriServizio() in js/chiosco.js
  - Attivare suoneria: this.suoneria.attiva()
  - Disabilitare tutti input: this.abilitaInput(false)
  - Display: this.display.mostraFuoriServizio()
  - LogEvento: if (this.operazioneCorrente) { this.operazioneCorrente.logEvento('FUORI_SERVIZIO') }

- [ ] T038 [P] [US2] Implementare Display.mostraFuoriServizio() in js/display.js
  - Aggiungere classe 'fuori-servizio' a elemento display
  - Mostrare messaggio: '⚠️ FUORI SERVIZIO - Chiamare assistenza'
  - Mostrare icona speaker: aggiungere `<span class="icona-suoneria">🔊</span>`

- [ ] T039 [US2] Aggiungere stili display fuori servizio in css/components.css
  - .display.fuori-servizio: background red/orange gradient, color white, font-size 2rem, text-align center
  - .icona-suoneria: font-size 3rem, display block, margin 20px auto, animation pulse infinite

### Tasks - Testing E2E US2 (OBBLIGATORIO)

- [ ] T040 [US2] Creare test E2E Playwright in tests/e2e/feature-003-us2.spec.js
  - Test: Timeout → FUORI_SERVIZIO + tutti input cliente disabilitati
    - Click "Apri Cassetta", NON inserire carta
    - Attendere countdown 10s → 0s
    - Assert display contiene "FUORI SERVIZIO" e icona ⚠️
    - Assert display ha classe CSS 'fuori-servizio' (sfondo rosso)
    - Assert console log: [ERROR] TIMEOUT, [ERROR] FUORI_SERVIZIO
    - Testare TUTTI input cliente ignorati:
      - Click moneta 1€ → assert window.app.chiosco.stato === 'FUORI_SERVIZIO'
      - Click "Paga con Carta" → assert stato unchanged
      - Inserire QR 42 → assert stato unchanged
      - Inserire carta contactless 50 → assert stato unchanged (no accesso cliente)
    - Assert display sempre "FUORI SERVIZIO", nessuna transizione

- [ ] T041 [US2] ELIMINATO (duplicato, consolidato in T040)

---

## Phase 5: User Story 3 - Reset Manuale da FUORI_SERVIZIO (P2)

**Story Goal**: Operatore autorizzato può ripristinare sistema da FUORI_SERVIZIO con carta autorizzata

**Priority**: P2 (importante per recovery, ma non blocking MVP)

**Independent Test Criteria**:
- [ ] Durante FUORI_SERVIZIO: inserire carta autorizzata 50 → suoneria stop, display "Sistema ripristinato (50)" → IDLE dopo 3s
- [ ] Carta non autorizzata 888 → display "Accesso negato (888)" 2s, rimane FUORI_SERVIZIO
- [ ] Console log: [INFO] RESET (codice operatore), Stato: FUORI_SERVIZIO → IDLE

**Duration**: ~1 ora

### Tasks

- [ ] T042 [US3] Implementare resetDaFuoriServizio() in js/chiosco.js
  - Parametro: codiceOperatore (string)
  - Validare: Validatore.isCodiceAutorizzato(codiceOperatore)
  - Se valido:
    - LogEvento: log.info(`Reset sistema da operatore: ${codiceOperatore}`)
    - Disattivare suoneria: this.suoneria.disattiva()
    - Mostrare messaggio: this.display.mostraMessaggio(`Sistema ripristinato da operatore (${codiceOperatore})`, 'success')
    - Transizione: setTimeout(() => this.transizione('IDLE'), 3000)
  - Se non valido:
    - Mostrare "Accesso negato" 2s
    - Rimanere in FUORI_SERVIZIO

- [ ] T043 [US3] Modificare verificaCarta() per gestire reset da FUORI_SERVIZIO in js/chiosco.js
  - Aggiungere check: if (this.stato === 'FUORI_SERVIZIO') { this.resetDaFuoriServizio(codice); return; }

- [ ] T044 [US3] Implementare onEsceFuoriServizio() (handler uscita stato) in js/chiosco.js
  - Disattivare suoneria se ancora attiva: if (this.suoneria.isAttiva()) { this.suoneria.disattiva(); }
  - Riabilitare input: this.abilitaInput(true)
  - Rimuovere classe fuori-servizio da display
  - Reset operazione corrente: this.operazioneCorrente = null

### Tasks - Testing E2E US3 (OBBLIGATORIO)

- [ ] T045 [US3] Creare test E2E Playwright in tests/e2e/feature-003-us3.spec.js
  - Test: Reset da FUORI_SERVIZIO (successo + fallimento)
    - Portare sistema in FUORI_SERVIZIO (apri cassetta, attendere timeout)
    - **Tentativo 1 - Carta non autorizzata**:
      - Inserire carta 888 → assert display "Accesso negato (888)"
      - Attendere 2s → assert display torna "FUORI SERVIZIO"
      - Assert window.app.chiosco.stato === 'FUORI_SERVIZIO'
    - **Tentativo 2 - Carta autorizzata**:
      - Inserire carta 50 → assert display "Sistema ripristinato da operatore (50)"
      - Attendere 3s → assert window.app.chiosco.stato === 'IDLE'
      - Assert console log: [INFO] RESET (50), Transizione: FUORI_SERVIZIO → IDLE
    - **Verifica ripristino funzionalità**:
      - Inserire moneta 1€ → assert transizione a PAGAMENTO_MONETE (input funzionano)

- [ ] T046 [US3] ELIMINATO (consolidato in T045)

---

## Phase 6: User Story 4 - Logging Operazioni Manutenzione (P3)

**Story Goal**: Ogni operazione manutenzione genera log completi con timestamp per audit trail

**Priority**: P3 (nice-to-have, già implementato parzialmente in US1-US3)

**Independent Test Criteria**:
- [ ] Operazione completa con azzeramento → log include: APERTURA, AUTH_SUCCESS, CHIUSURA, AZZERAMENTO con timestamp, codice operatore, saldo prima/dopo
- [ ] Timeout → log include: APERTURA, TIMEOUT, FUORI_SERVIZIO
- [ ] Reset → log include: RESET con codice operatore, transizione stato

**Duration**: ~1 ora (principalmente verifica e completamento)

### Tasks

- [ ] T047 [US4] Verificare logging completo OperazioneSvuotamento in js/gestore-manutenzione.js
  - Verifica tutti eventi loggati: APERTURA, AUTH_SUCCESS, AUTH_FAIL, TIMEOUT, CHIUSURA, AZZERAMENTO, FUORI_SERVIZIO, RESET
  - Verifica timestamp ISO 8601 in tutti log
  - Verifica dettagli appropriati per ogni evento (codice operatore, saldo, ecc.)

- [ ] T048 [US4] Aggiungere logging transizioni stato FSM in js/chiosco.js metodo transizione()
  - Dopo validazione transizione successo, aggiungere:
    ```javascript
    log.info(`Transizione stato: ${this.stato} → ${nuovoStato}`, { timestamp: new Date().toISOString() });
    ```

### Tasks - Testing E2E US4 (OBBLIGATORIO)

- [ ] T049 [US4] Aggiungere test E2E verifica logging in tests/e2e/feature-003-us4.spec.js
  - Test 1: Log completi flusso successo
    - Catturare console log durante esecuzione
    - Eseguire flusso: apri → autentica (42) → chiudi → azzera (Sì)
    - Assert log contiene sequenza (in ordine, con regex):
      - /SensoreCassetta.*cassetta aperta/
      - /Transizione.*IDLE.*MANUTENZIONE_AUTH_PENDING/
      - /Manutenzione.*APERTURA.*\d{4}-\d{2}-\d{2}/ (timestamp ISO)
      - /Manutenzione.*AUTH_SUCCESS.*42/
      - /Manutenzione.*CHIUSURA/
      - /Manutenzione.*AZZERAMENTO.*azzerato.*true/
      - /Transizione.*MANUTENZIONE_SCELTA_AZZERAMENTO.*IDLE/
  - Test 2: Log timeout scenario
    - Apri cassetta, attendere timeout
    - Assert log: APERTURA, TIMEOUT, FUORI_SERVIZIO
    - Reset con carta 50
    - Assert log: RESET, Operatore: 50

- [ ] T050 [US4] ELIMINATO (consolidato in T049)

---

## Phase 7: User Story 5 - Apertura Cassetta Durante Transito (Edge Case)

**Story Goal**: Gestire correttamente apertura cassetta durante transito cliente o pagamento in corso

**Priority**: Implicito (requisito funzionale FR per robustezza)

**Independent Test Criteria**:
- [ ] Porta aperta (cliente in transito) + apertura cassetta → log "Attesa fine transito", nessuna transizione immediata, manutenzione avviata dopo chiusura porta
- [ ] Pagamento monete in corso + apertura cassetta → annulla pagamento, transizione immediata a MANUTENZIONE_AUTH_PENDING

**Duration**: ~1 ora

### Tasks

- [ ] T051 [US5] Aggiungere flag pendenteAperturaCassetta in js/chiosco.js constructor
  - Aggiungere: this.pendenteAperturaCassetta = false

- [ ] T052 [US5] Modificare onCassettaAperta() per gestire apertura durante transito in js/chiosco.js
  - Già implementato parzialmente in T013
  - Verificare: se stato in ['PORTA_APERTA', 'PAGAMENTO_MONETE', 'PAGAMENTO_CARTA'] → set flag, log warning, return
  - Se stato === 'PAGAMENTO_MONETE': annullare pagamento (reset gettoniera), log.warn('Pagamento annullato per manutenzione')

- [ ] T053 [US5] Gestire retry manutenzione dopo ritorno IDLE in js/chiosco.js
  - Modificare handler onEntraIdle():
    - Aggiungere check all'inizio:
      ```javascript
      if (this.pendenteAperturaCassetta) {
        log.info('Ripresa operazione manutenzione pendente');
        this.pendenteAperturaCassetta = false;
        this.transizione('MANUTENZIONE_AUTH_PENDING');
        return;
      }
      ```

### Tasks - Testing E2E US5 (OBBLIGATORIO)

- [ ] T054 [US5] Creare test E2E Playwright in tests/e2e/feature-003-us5.spec.js
  - Test 1: Apertura cassetta durante transito cliente
    - Simulare accesso: inserire monete 1.20€ → porta aperta (stato PORTA_APERTA)
    - Click "Apri Cassetta" → assert log "Attesa fine transito"
    - Assert window.app.chiosco.stato === 'PORTA_APERTA' (no cambio immediato)
    - Assert window.app.chiosco.pendenteAperturaCassetta === true
    - Click "Persona passata" (chiudi porta)
    - Assert transizione automatica a MANUTENZIONE_AUTH_PENDING dopo IDLE
    - Completare manutenzione (autentica + chiudi + azzera)
  - Test 2: Apertura durante pagamento monete → annullamento
    - Inserire moneta 0.50€ (parziale, stato PAGAMENTO_MONETE)
    - Click "Apri Cassetta" → assert log "Pagamento annullato"
    - Assert transizione immediata a MANUTENZIONE_AUTH_PENDING
    - Assert saldo gettoniera resettato (verificare via console)

- [ ] T055 [US5] ELIMINATO (consolidato in T054)

---

## Phase 8: Polish & Cross-Cutting Concerns

**Goal**: Finalizzazione, test regressione, validazione release criteria

**Duration**: ~2-3 ore

### Tasks - Testing Regressione (OBBLIGATORIO)

- [ ] T056 Creare test E2E regressione in tests/e2e/feature-003-regression.spec.js
  - Test 1: Feature 001 - Pagamento monete → assert porta apre
  - Test 2: Feature 001 - Carta VISA → assert porta apre
  - Test 3: Feature 001 - QR codice 42 → assert porta apre
  - Test 4: Feature 001 - Carta autorizzata 50 → assert porta apre
  - Test 5: Feature 002 - Pulsante "Persona passata" → assert porta chiude immediatamente
  - Tutti test devono passare (zero breaking changes)

- [ ] T057-T060 ELIMINATI (consolidati in T056)

- [ ] T061 Aggiungere test E2E edge cases in tests/e2e/feature-003-edge-cases.spec.js
  - Test 1: Doppio click "Sì" azzeramento
    - Eseguire flusso fino a pulsanti Sì/No
    - Click rapido 2x su "Sì" → assert btn disabled dopo primo click
    - Assert saldo azzerato 1 sola volta (no doppia elaborazione)
  - Test 2: Saldo gettoniera anomalo (NaN/negativo)
    - Via console: `window.app.gettoniera.importoTotale = NaN`
    - Eseguire svuotamento → assert validaSaldo() ritorna 0.00€
    - Assert log warning "saldo anomalo"

- [ ] T062 ELIMINATO (consolidato in T061)

- [ ] T063 Test cross-browser: Chrome, Firefox, Safari, Edge
  - Verifica Web Audio API funziona (suoneria)
  - Verifica countdown visibile e preciso
  - Verifica CSS stili fuori-servizio corretti
  - Verifica autoplay policy gestita (resume AudioContext su click)

- [ ] T064 Ottimizzazioni performance:
  - Verificare CPU usage suoneria < 2% (DevTools Performance)
  - Verificare countdown setInterval overhead < 0.5% CPU
  - Verificare nessun memory leak dopo 10+ operazioni (DevTools Memory)

- [ ] T065 Validazione Constitution Check:
  - Principle I (Italiano): Verifica tutti testi UI, log, commenti in italiano
  - Principle II (Static-First): Verifica nessun backend richiesto
  - Principle III (Vanilla JS): Verifica zero framework aggiunti
  - Principle IV (Build-Free): Verifica file linkati direttamente, no build step
  - Principle V (Osservabilità): Verifica log completi su console

- [ ] T066 Release Criteria Check:
  - [ ] Tutti 22 requisiti funzionali (FR-001 a FR-022) implementati
  - [ ] Tutti 7 requisiti non funzionali (NFR-001 a NFR-007) verificati
  - [ ] 10 criteri successo (SC-001 a SC-010) passati
  - [ ] Zero breaking changes feature 001/002
  - [ ] Documentazione completa (quickstart.md, data-model.md, research.md, plan.md)

- [ ] T067 Cleanup code:
  - Rimuovere console.log debug non necessari (mantenere solo log.* strutturati)
  - Verificare nomi variabili leggibili in italiano
  - Verificare commenti codice in italiano
  - Formattare codice consistentemente

- [ ] T068 Preparare commit finale:
  - Verificare git status pulito (nessun file non tracciato accidentale)
  - Preparare messaggio commit dettagliato seguendo template repository

---

## Dependency Graph

### Story Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOCKER per tutte le US
    ↓
    ├─→ Phase 3 (US1 - Svuotamento Autorizzato) ← MVP
    │       ↓
    │   Phase 4 (US2 - Timeout FUORI_SERVIZIO) ← MVP (dipende da US1 parzialmente)
    │       ↓
    │   Phase 5 (US3 - Reset) ← Dipende da US2 (stato FUORI_SERVIZIO)
    │       ↓
    ├─→ Phase 6 (US4 - Logging) ← Cross-cutting, può essere parallelo con US1-US3
    │
    └─→ Phase 7 (US5 - Apertura Durante Transito) ← Dipende da US1 (FSM esteso)
            ↓
        Phase 8 (Polish & Testing)
```

**Note**:
- US1 e US2 sono fortemente correlate (US2 dipende da countdown di US1)
- US3 dipende da US2 (stato FUORI_SERVIZIO)
- US4 (logging) è cross-cutting: può essere implementato in parallelo con US1-US3
- US5 è edge case management: dipende da FSM completo (US1)

### Critical Path

**Shortest path to MVP**:
```
Setup (30 min) → Foundational (2-3h) → US1 (4-5h) → US2 (2h) → Testing MVP (1h)
Total: ~10-12 ore
```

**Full implementation**:
```
MVP (10-12h) → US3 (1h) → US4 (1h) → US5 (1h) → Polish (2-3h)
Total: ~15-18 ore
```

---

## Parallel Execution Opportunities

### Phase 2 (Foundational)

**Parallel Block 1** (può essere fatto simultaneamente):
- T005 (SensoreCassetta)
- T006 (Suoneria)
- T007 (GestoreManutenzione base)
- T008 (OperazioneSvuotamento)

**Sequential**:
- T009 (dipende da T007 + T008)
- T010 (finale, dipende da tutti)

### Phase 3 (US1)

**Parallel Block 2** (dopo T011-T018 completati):
- T019 (Display.aggiornaCountdown)
- T020 (Display.mostraPulsantiAzzeramento)
- T021 (Display.nascondiPulsantiAzzeramento)
- T022 (Gettoniera.validaSaldo)
- T023 (Gettoniera.azzeraSaldo)

**Sequential**:
- T024-T029 (UI/CSS - possono essere fatti dopo T011-T018)
- T030-T032 (Integration - dipende da tutto precedente)
- T033-T035 (Testing - finale)

### Phase 4 (US2)

**Parallel Block 3**:
- T038 (Display.mostraFuoriServizio) può essere fatto in parallelo con T036-T037

**Sequential**:
- T039-T041 (CSS e testing - dipendono da implementazione)

### Phase 5-7 (US3-US5)

**Mostly sequential** (dipendenze forti tra stati FSM)

### Phase 8 (Polish)

**Parallel Block 4** (test regressione indipendenti):
- T056-T060 (possono essere eseguiti in parallelo)
- T063 (cross-browser - parallelo)

---

## Progress Tracking

**MVP Completion** (US1 + US2):
- [ ] Phase 1: Setup (4 tasks)
- [ ] Phase 2: Foundational (6 tasks)
- [ ] Phase 3: US1 (23 tasks)
- [ ] Phase 4: US2 (6 tasks)
- **Total MVP: 39 tasks**

**Full Feature Completion** (US1-US5):
- [ ] Phase 5: US3 (5 tasks)
- [ ] Phase 6: US4 (4 tasks)
- [ ] Phase 7: US5 (5 tasks)
- [ ] Phase 8: Polish (13 tasks)
- **Total Full: 66 tasks**

---

## Quick Reference

### File Changes Summary

| File | New/Modified | Tasks |
|------|-------------|-------|
| js/sensore-cassetta.js | NEW | T005 |
| js/suoneria.js | NEW | T006 |
| js/gestore-manutenzione.js | NEW | T007-T009 |
| js/chiosco.js | MODIFIED | T011-T018, T032, T036-T037, T042-T044, T048, T051-T053 |
| js/display.js | MODIFIED | T019-T021, T038 |
| js/gettoniera.js | MODIFIED | T022-T023 |
| js/app.js | MODIFIED | T030-T031 |
| index.html | MODIFIED | T010, T024-T026 |
| css/components.css | MODIFIED | T027-T029, T039 |

### Task Count by Priority

- **P1 (MVP)**: US1 (23 tasks) + US2 (6 tasks) = 29 tasks
- **P2**: US3 (5 tasks)
- **P3**: US4 (4 tasks)
- **Edge Cases**: US5 (5 tasks)
- **Setup/Polish**: Phase 1 (4) + Phase 2 (6) + Phase 8 (13) = 23 tasks

**Total**: 59 tasks (dopo consolidamento test duplicati)

### Estimated Duration by Phase

| Phase | Duration | Cumulative |
|-------|----------|-----------|
| Phase 1 | 30 min | 0.5h |
| Phase 2 | 2-3h | 3.5h |
| Phase 3 (US1) | 4-5h | 8.5h |
| Phase 4 (US2) | 2h | 10.5h |
| **MVP Complete** | - | **~11h** |
| Phase 5 (US3) | 1h | 11.5h |
| Phase 6 (US4) | 1h | 12.5h |
| Phase 7 (US5) | 1h | 13.5h |
| Phase 8 (Polish) | 2-3h | 16h |
| **Full Complete** | - | **~16h** |

---

**Tasks Status**: ✅ Ready for implementation
**Generated**: 2025-10-17
**Next Step**: Esegui `/speckit.implement` per assistenza implementazione guidata, oppure inizia manualmente da Phase 1
