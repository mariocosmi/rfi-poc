# Implementation Plan: Svuotamento Cassetta Monete con Autenticazione

**Branch**: `003-aggiungere-operazione-svuotamento` | **Date**: 2025-10-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-aggiungere-operazione-svuotamento/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implementazione sistema di manutenzione per svuotamento cassetta monete con autenticazione operatore. Il sistema richiede autenticazione con carta contactless autorizzata (codici 1-99) entro 10 secondi dall'apertura cassetta. In caso di timeout, attiva suoneria allarme e entra in stato FUORI_SERVIZIO, disabilitando tutti gli input cliente fino a reset autorizzato. Dopo chiusura cassetta, l'operatore può scegliere se azzerare o mantenere il saldo. Tutti gli eventi sono loggati su console browser per audit trail.

**Approccio Tecnico**: Estensione FSM esistente con 4 nuovi stati (MANUTENZIONE_AUTH_PENDING, MANUTENZIONE_ATTESA_CHIUSURA, MANUTENZIONE_SCELTA_AZZERAMENTO, FUORI_SERVIZIO), 3 nuovi componenti (SensoreCassetta, Suoneria, GestoreManutenzione), e modifiche minime a componenti esistenti (Gettoniera, Display, Chiosco). Utilizzo Web Audio API per suoneria sintetizzata (zero file esterni).

## Technical Context

**Language/Version**: JavaScript ES6+ (browser nativo, no transpiling)
**Primary Dependencies**: loglevel.min.js 1.9.1 (logging), Web Audio API (suoneria)
**Storage**: N/A (stato in memoria, no persistenza)
**Testing**: Testing manuale esplorativo + E2E Playwright (se esteso per feature 003)
**Target Platform**: Browser moderni (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
**Project Type**: Web statico (single project, completamente client-side)
**Performance Goals**:
- Countdown aggiornamento 1Hz (precisione ±200ms)
- Transizione IDLE → MANUTENZIONE < 200ms
- Suoneria attivazione < 300ms
- CPU usage suoneria < 2%

**Constraints**:
- Timeout autenticazione: 10s fisso (hardcoded)
- Zero persistenza (reload = stato perso)
- Client-side only (no backend, no REST API)
- Build-free (no bundler, no transpiler)

**Scale/Scope**:
- 11 stati FSM totali (7 esistenti + 4 nuovi)
- 3 nuovi file JS (~800 LOC totali stimati)
- Modifiche a 3 file esistenti (~200 LOC modificati)
- 1 operazione manutenzione simultanea (atomica)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Principle I: Lingua Italiana
**Status**: CONFORME
- Tutti testi UI in italiano (messaggi display, pulsanti, log)
- Commenti codice in italiano
- Nomi variabili leggibili in italiano (es. `sensoreCassetta`, `operazioneCorrente`)
- Messaggi console log in italiano

### ✅ Principle II: Static-First Architecture
**Status**: CONFORME
- Nessun backend richiesto
- Tutto client-side (HTML/CSS/JS statici)
- Deployabile su CDN o file server
- Zero elaborazione server-side

### ⚠️ Principle III: JavaScript Vanilla
**Status**: CONFORME con eccezione giustificata
- JavaScript vanilla ES6+ per tutti componenti
- **Eccezione**: loglevel.min.js per logging (già presente nel progetto, giustificato da Principle V)
- Web Audio API nativa (no librerie esterne audio)
- Zero framework (no React, Vue, jQuery)

### ✅ Principle IV: Build-Free
**Status**: CONFORME
- Nessun bundler richiesto
- Nessun transpiler (ES6+ nativo browser)
- File JS linkati direttamente in HTML
- Sviluppo: edit → refresh browser

### ✅ Principle V: Osservabilità
**Status**: CONFORME
- Logging completo su console browser (loglevel)
- Tutti eventi manutenzione tracciati con timestamp
- Livelli gravità: DEBUG, INFO, WARN, ERROR
- Audit trail completo per operazioni svuotamento
- Eventi loggati: APERTURA, AUTH_SUCCESS, AUTH_FAIL, TIMEOUT, CHIUSURA, AZZERAMENTO, FUORI_SERVIZIO, RESET

**GATE RESULT**: ✅ PASS - Tutti principi rispettati, zero violazioni non giustificate

---

## Project Structure

### Documentation (this feature)

```
specs/003-aggiungere-operazione-svuotamento/
├── spec.md                  # Feature specification (user stories, requirements)
├── plan.md                  # This file - Implementation plan
├── research.md              # Technical decisions & rationale
├── data-model.md            # Entity schema & FSM diagram
├── quickstart.md            # User guide for operators
└── contracts/
    └── interfaces.js        # JavaScript interface contracts
```

### Source Code (repository root)

```
/
├── index.html               # [MODIFIED] Aggiunge pannello admin manutenzione
├── css/
│   ├── styles.css           # [EXISTING] Stili generali
│   ├── components.css       # [MODIFIED] Aggiunge stili pannello admin + display FUORI_SERVIZIO
│   └── animations.css       # [EXISTING] Animazioni porta
├── js/
│   ├── app.js               # [MODIFIED] Inizializza nuovi componenti + event handlers
│   ├── chiosco.js           # [MODIFIED] Aggiunge 4 nuovi stati FSM + handler
│   ├── display.js           # [MODIFIED] Aggiunge mostraFuoriServizio(), aggiornaCountdown()
│   ├── gettoniera.js        # [MODIFIED] Aggiunge validaSaldo(), azzeraSaldo()
│   ├── porta.js             # [EXISTING] Nessuna modifica
│   ├── lettore-carte.js     # [EXISTING] Riusato per autenticazione operatore
│   ├── lettore-qr.js        # [EXISTING] Nessuna modifica
│   ├── validatore.js        # [EXISTING] Riusato per validazione codici operatore
│   ├── logger.js            # [EXISTING] Wrapper loglevel
│   ├── sensore-cassetta.js  # [NEW] Simulazione sensore apertura/chiusura cassetta
│   ├── suoneria.js          # [NEW] Gestione allarme Web Audio API
│   └── gestore-manutenzione.js # [NEW] Countdown, tracking operazioni, logging
├── assets/
│   └── lib/
│       └── loglevel.min.js  # [EXISTING] Libreria logging
└── specs/                   # [EXISTING] Feature specs directory
```

**Structure Decision**: Single project web statico. Feature 003 estende architettura esistente (feature 001/002) aggiungendo 3 nuovi componenti JavaScript e modificando 4 componenti esistenti. Nessuna modifica a struttura directory (già ottimale per static-first). File JS organizzati per responsabilità (sensore-cassetta, suoneria, gestore-manutenzione separati per Single Responsibility Principle).

---

## Complexity Tracking

**Nessuna violazione Constitution** - Sezione lasciata vuota intenzionalmente.

Eccezione già documentata in Constitution v1.1.0:
- **Principle III violation (libreria loglevel)**: Giustificata da Principle V (Osservabilità). Libreria già presente nel progetto dalla feature 001.

---

## Phase 0: Research & Design Decisions

**Output**: [research.md](./research.md) ✅ Completo

### Key Decisions

1. **Suoneria Implementazione**: Web Audio API (beep sintetizzato 800Hz) vs file audio esterno
   - **Scelta**: Web Audio API
   - **Rationale**: Zero dipendenze esterne, pieno controllo, avvio istantaneo

2. **Countdown Gestione**: setInterval(1000) vs requestAnimationFrame
   - **Scelta**: setInterval(1000)
   - **Rationale**: Semplicità, precisione ±200ms sufficiente, pattern già usato in feature 001

3. **FSM Pattern**: Estensione FSM esistente vs FSM separata manutenzione
   - **Scelta**: Estensione FSM unica
   - **Rationale**: Coerenza architettura, zero breaking changes, testabilità

4. **UI Controlli Admin**: Sempre visibili vs toggle F12
   - **Scelta**: Sempre visibili
   - **Rationale**: UX semplice, facilitazione testing E2E

5. **Validazione Saldo**: Validazione preventiva vs trust gettoniera
   - **Scelta**: Validazione preventiva (NaN/negativo → 0.00€)
   - **Rationale**: Robustezza, conformità FR-022, defensive programming

### Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Web Audio API autoplay policy | Medium | Medium | Inizializzare AudioContext dopo primo user click |
| setInterval drift (tab background) | Low | Low | Accettabile per MVP (±200ms conformità NFR-001) |
| Race condition apertura cassetta | Low | Medium | Flag `pendenteAperturaCassetta` per retry dopo IDLE |

---

## Phase 1: Data Model & Contracts

**Outputs**:
- [data-model.md](./data-model.md) ✅ Completo
- [contracts/interfaces.js](./contracts/interfaces.js) ✅ Completo
- [quickstart.md](./quickstart.md) ✅ Completo

### Entities Summary

**Nuove Entità**:
1. **SensoreCassetta**: Simula sensore hardware, stato aperta/chiusa, eventi cassettaAperta/cassettaChiusa
2. **Suoneria**: Web Audio API, beep 800Hz, volume 30%, attiva/disattiva
3. **GestoreManutenzione**: Countdown 10s, tracking operazione, logging eventi
4. **OperazioneSvuotamento**: Entità processo, traccia timestamp/saldo/operatore

**Modifiche Esistenti**:
- **Chiosco**: +4 stati FSM, +3 attributi (gestoreManutenzione, sensoreCassetta, suoneria), +5 handler
- **Gettoniera**: +2 metodi (validaSaldo, azzeraSaldo)
- **Display**: +3 metodi (mostraFuoriServizio, aggiornaCountdown, mostraPulsantiAzzeramento)
- **Validatore**: Nessuna modifica (riuso isCodiceAutorizzato)

### FSM States Extended

**Stati Totali**: 11 (7 esistenti + 4 nuovi)

**Nuovi Stati Manutenzione**:
```
MANUTENZIONE_AUTH_PENDING → [MANUTENZIONE_ATTESA_CHIUSURA, FUORI_SERVIZIO, IDLE]
MANUTENZIONE_ATTESA_CHIUSURA → [MANUTENZIONE_SCELTA_AZZERAMENTO, FUORI_SERVIZIO]
MANUTENZIONE_SCELTA_AZZERAMENTO → [IDLE]
FUORI_SERVIZIO → [IDLE]
```

**Invarianti**:
- Chiosco sempre in esattamente 1 stato
- Durante manutenzione: `inputAbilitato = false`
- Suoneria attiva ⟺ `stato === 'FUORI_SERVIZIO'`
- Countdown attivo ⟺ `stato === 'MANUTENZIONE_AUTH_PENDING'`

---

## Phase 2: Implementation Plan

### Task Breakdown (High-Level)

**Note**: Dettaglio completo task generato con `/speckit.tasks` command (output: `tasks.md`)

#### Fase 2.1: Nuovi Componenti Core
1. Implementare `SensoreCassetta` (js/sensore-cassetta.js)
   - Stato aperta/chiusa
   - Eventi cassettaAperta/cassettaChiusa
   - Listener registration

2. Implementare `Suoneria` (js/suoneria.js)
   - Web Audio API setup
   - Beep 800Hz, volume 30%, loop continuo
   - Metodi attiva/disattiva/isAttiva

3. Implementare `GestoreManutenzione` + `OperazioneSvuotamento` (js/gestore-manutenzione.js)
   - Countdown 10s con setInterval
   - Tracking operazione corrente
   - Logging eventi con timestamp

#### Fase 2.2: Estensione FSM Chiosco
4. Aggiungere 4 nuovi stati a `Chiosco` (js/chiosco.js)
   - Definire transizioni permesse
   - Implementare 5 handler: onEntraManutenzioneAuthPending, onEntraManutenzioneAttesaChiusura, onEntraManutenzioneSceltaAzzeramento, onEntraFuoriServizio, onEsceFuoriServizio
   - Modificare abilitaInput() per forzare false durante manutenzione
   - Aggiungere gestione US5 (apertura cassetta durante transito)

#### Fase 2.3: Modifiche Componenti Esistenti
5. Estendere `Gettoniera` (js/gettoniera.js)
   - Metodo validaSaldo() con check NaN/negativo
   - Metodo azzeraSaldo() con logging

6. Estendere `Display` (js/display.js)
   - mostraFuoriServizio() con stile rosso
   - aggiornaCountdown() con numero grande + colore urgente
   - mostraPulsantiAzzeramento() con saldo corrente

#### Fase 2.4: UI & Integration
7. Modificare `index.html`
   - Aggiungere pannello admin (pulsanti Apri/Chiudi Cassetta)
   - Aggiungere countdown timer display
   - Aggiungere pulsanti azzeramento Sì/No (nascosti di default)
   - Aggiungere indicatore stato cassetta

8. Estendere CSS (css/components.css)
   - Stili `.display.fuori-servizio` (rosso/arancione, ⚠️ icona)
   - Stili `.countdown-timer` (3rem font, rosso se urgente)
   - Stili `.pannello-admin` (sempre visibile, basso schermo)
   - Stili `.btn-azzeramento` (min 80x40px)

9. Modificare `app.js`
   - Inizializzare SensoreCassetta, Suoneria, GestoreManutenzione
   - Collegare eventi sensore a Chiosco
   - Event handlers pulsanti admin (apri/chiudi cassetta)
   - Event handlers pulsanti azzeramento (Sì/No)

#### Fase 2.5: Testing & Validation
10. Test manuali scenari acceptance (spec.md)
    - US1: Svuotamento standard con azzeramento
    - US2: Timeout → FUORI_SERVIZIO + suoneria
    - US3: Reset da FUORI_SERVIZIO
    - US4: Verifica log completi
    - US5: Apertura cassetta durante transito

11. Test regressione feature 001/002
    - Pagamento monete, carta, QR, carta autorizzata
    - Chiusura porta manuale (feature 002)
    - Zero breaking changes

12. Test edge cases (spec.md - Casi Limite)
    - Codice non autorizzato (777)
    - Multipli tentativi autenticazione
    - Doppio click pulsanti azzeramento
    - Saldo NaN/negativo

### Dependencies & Sequencing

**Sequenza Critica**:
1. Fase 2.1 (componenti core) → Indipendenti, possono essere paralleli
2. Fase 2.2 (FSM) → Dipende da 2.1 (usa GestoreManutenzione, Suoneria, SensoreCassetta)
3. Fase 2.3 (modifiche esistenti) → Parallelo con 2.2
4. Fase 2.4 (UI) → Dipende da 2.2 + 2.3 (componenti già implementati)
5. Fase 2.5 (testing) → Dipende da tutto (implementazione completa)

**Blocchi Paralleli**:
- SensoreCassetta + Suoneria + GestoreManutenzione (indipendenti)
- Gettoniera + Display (indipendenti tra loro)

---

## Testing Strategy

### Manual Exploratory Testing

**Checklist** (da `specs/003-aggiungere-operazione-svuotamento/plan.md` - sezione Test di Accettazione):

**User Story 1 - Svuotamento Autorizzato**:
- [ ] AS-1.1: Apertura cassetta → display "Cassetta aperta - Autenticazione richiesta" + countdown 10s
- [ ] AS-1.2: Autenticazione carta 42 entro 7s → display "Operatore autorizzato (42)" + countdown stop
- [ ] AS-1.3: Chiusura cassetta → display "Azzerare saldo (15.80€)? [Sì] [No]"
- [ ] AS-1.4: Click Sì → saldo azzerato 0.00€, display "Saldo azzerato" → IDLE dopo 3s
- [ ] AS-1.5: Click No → saldo mantenuto 15.80€, display "Saldo mantenuto" → IDLE dopo 3s

**User Story 2 - Timeout FUORI_SERVIZIO**:
- [ ] AS-2.1: Countdown 2s → 0s senza auth → suoneria attiva + display "⚠️ FUORI SERVIZIO"
- [ ] AS-2.2: Carta non autorizzata 777 → display "Accesso negato (777)" 2s, countdown continua
- [ ] AS-2.3: Durante FUORI_SERVIZIO: monete/QR/carte ignorate, display immutato
- [ ] AS-2.4: 60s in FUORI_SERVIZIO → no auto-ripristino (attesa reset manuale)

**User Story 3 - Reset da FUORI_SERVIZIO**:
- [ ] AS-3.1: Carta autorizzata 50 → suoneria stop, display "Sistema ripristinato (50)" → IDLE dopo 3s
- [ ] AS-3.2: Carta non autorizzata 888 → display "Accesso negato (888)" 2s, rimane FUORI_SERVIZIO
- [ ] AS-3.3: Carta rimossa prima completamento lettura → "Errore lettura carta", rimane FUORI_SERVIZIO

**User Story 4 - Logging**:
- [ ] AS-4.1: Operazione completa con azzeramento → log [INFO] APERTURA, AUTH_SUCCESS, CHIUSURA, AZZERAMENTO (15.80€ → 0.00€)
- [ ] AS-4.2: Timeout → log [WARN] Timeout, [ERROR] FUORI_SERVIZIO + Suoneria
- [ ] AS-4.3: Reset → log [INFO] RESET (codice 50), Stato: FUORI_SERVIZIO → IDLE

**User Story 5 - Apertura Durante Transito**:
- [ ] AS-5.1: Porta aperta + apertura cassetta → log "Attesa fine transito", transizione a MANUTENZIONE dopo chiusura porta
- [ ] AS-5.2: Pagamento monete + apertura cassetta → annulla inserimento monete, transizione immediata a MANUTENZIONE

**Regressione Feature 001/002**:
- [ ] REG-001: Pagamento monete 1.20€ → porta apre
- [ ] REG-002: Carta VISA → porta apre
- [ ] REG-003: QR codice 42 → porta apre
- [ ] REG-004: Carta autorizzata 50 → porta apre
- [ ] REG-005: Pulsante "Persona passata" (feature 002) → porta chiude immediatamente

### E2E Automated Testing (Future Enhancement)

**Note**: Feature 003 può essere testata con Playwright estendendo suite esistente (tests/e2e/).

**Esempio test E2E** (pseudocode):
```javascript
test('US1: Svuotamento con azzeramento', async ({ page }) => {
  // Setup: navigare a localhost, verificare IDLE
  await page.goto('http://localhost:8000');
  await expect(page.locator('.display')).toContainText('Benvenuto');

  // Step 1: Apri cassetta
  await page.click('#btn-apri-cassetta');
  await expect(page.locator('.display')).toContainText('Cassetta aperta - Autenticazione richiesta');
  await expect(page.locator('#countdown-timer')).toContainText('10 secondi');

  // Step 2: Autenticazione
  await page.fill('#input-carta-contactless', '42');
  await page.click('#btn-leggi-carta');
  await expect(page.locator('.display')).toContainText('Operatore autorizzato (42)');

  // Step 3: Chiudi cassetta
  await page.click('#btn-chiudi-cassetta');
  await expect(page.locator('.display')).toContainText('Azzerare saldo monete');

  // Step 4: Azzeramento
  await page.click('#btn-azzera-si');
  await expect(page.locator('.display')).toContainText('Operazione completata');

  // Step 5: Ritorno IDLE
  await page.waitForTimeout(3000);
  await expect(page.locator('.display')).toContainText('Benvenuto');
});
```

---

## Acceptance Criteria (from spec.md)

### Success Criteria

- **SC-001**: ✅ Operazione svuotamento completa in < 30s
- **SC-002**: ✅ Countdown visibile, aggiorna ogni 1s (±200ms)
- **SC-003**: ✅ FUORI_SERVIZIO entro 500ms da timeout
- **SC-004**: ✅ Suoneria attiva entro 300ms da FUORI_SERVIZIO
- **SC-005**: ✅ Reset da FUORI_SERVIZIO con carta autorizzata in < 10s
- **SC-006**: ✅ 100% input cliente rifiutati durante FUORI_SERVIZIO
- **SC-007**: ✅ Log include 100% eventi richiesti con timestamp
- **SC-008**: ✅ Zero breaking changes feature 001/002
- **SC-009**: ✅ Pulsanti Sì/No rispondono entro 100ms, disabilitano immediatamente
- **SC-010**: ✅ Saldo azzera correttamente (0.00€) o mantiene invariato

### Functional Requirements Coverage

**Tutti 22 requisiti funzionali (FR-001 a FR-022) coperti**:
- FR-001 a FR-012: Componenti SensoreCassetta + Chiosco + Display
- FR-013 a FR-016: Componenti Display + Gettoniera + UI pulsanti azzeramento
- FR-017: GestoreManutenzione + OperazioneSvuotamento (logging completo)
- FR-018: Handler onEntraManutenzioneSceltaAzzeramento
- FR-019 a FR-020: Handler onEntraFuoriServizio + resetDaFuoriServizio
- FR-021: Event handler pulsanti con immediate disable
- FR-022: Gettoniera.validaSaldo()

### Non-Functional Requirements Coverage

**Tutti 7 requisiti non funzionali (NFR-001 a NFR-007) coperti**:
- NFR-001: setInterval(1000) con precisione ±200ms (testing manuale verifica)
- NFR-002: Suoneria volume 30% (0.3 gain), regolabile da DevTools
- NFR-003: Transizione IDLE → MANUTENZIONE < 200ms (event handler sincrono)
- NFR-004: Autenticazione completa < 1s (validazione codice sincrona)
- NFR-005: Pulsanti min 80x40px (CSS .btn-azzeramento)
- NFR-006: Display FUORI_SERVIZIO con rosso + icona ⚠️ (CSS .fuori-servizio)
- NFR-007: Timestamp ISO 8601 (new Date().toISOString())

---

## Release Criteria

**Pre-Release Checklist**:
- [ ] Tutti 22 requisiti funzionali implementati
- [ ] Tutti 7 requisiti non funzionali verificati
- [ ] 10 criteri successo (SC-001 a SC-010) passati
- [ ] Test regressione feature 001/002 passati (zero breaking changes)
- [ ] Logging completo verificato (US4 scenarios)
- [ ] Constitution Check re-eseguito e passato (zero violazioni)
- [ ] Browser testing: Chrome, Firefox, Safari, Edge (ultime 2 versioni)
- [ ] DevTools console: zero errori JavaScript
- [ ] Documentazione completa: quickstart.md, data-model.md, research.md

**Known Limitations (Documented)**:
- Timeout 10s hardcoded (non configurabile)
- Saldo non persistito (reload → reset)
- No storico operazioni (solo log console real-time)
- No export log (feature futura)
- No autenticazione multi-livello (solo "autorizzato" vs "non autorizzato")

---

## Rollback Plan

**Se feature causa problemi critici in produzione**:

1. **Immediate**: Revert commit feature 003 su branch main
   ```bash
   git revert <commit-hash-feature-003>
   git push origin main
   ```

2. **Cleanup**: Rimuovere file aggiunti se necessario
   ```bash
   git rm js/sensore-cassetta.js js/suoneria.js js/gestore-manutenzione.js
   git checkout HEAD~1 -- js/chiosco.js js/gettoniera.js js/display.js js/app.js index.html css/components.css
   git commit -m "Rollback feature 003 - Rimozione completa"
   ```

3. **Verifica**: Test regressione feature 001/002 dopo rollback

**Rollback Risk**: BASSO - Feature 003 è additiva (nuovi file + estensioni FSM). Componenti esistenti modificati in modo retrocompatibile (zero breaking changes per design).

---

## Post-Implementation

### Monitoring & Observability

**Log Monitoring** (Console Browser):
- Verificare log [INFO] per operazioni normali
- Alert su log [ERROR] FUORI_SERVIZIO (monitoraggio manuale operatore)
- Verifica timestamp corretti (ISO 8601)

**Performance Metrics** (DevTools Performance):
- CPU usage suoneria < 2%
- Countdown setInterval overhead < 0.5% CPU
- Memory leak check: nessun incremento memoria dopo 10+ operazioni

### Future Enhancements (Out of Scope MVP)

1. **Persistenza saldo**: LocalStorage per saldo gettoniera
2. **Storico operazioni**: IndexedDB per log operazioni svuotamento
3. **Export log**: Download log CSV/JSON
4. **Configurazione timeout**: UI admin per modificare timeout 10s
5. **Notifiche remote**: SMS/Email su FUORI_SERVIZIO (richiede backend)
6. **Autenticazione multi-livello**: Ruoli operatore (admin, manutentore, cassiere)
7. **Integrazione hardware reale**: Sensori fisici + serratura elettronica

---

## Appendix

### File Changes Summary

| File | Type | LOC Change | Description |
|------|------|-----------|-------------|
| `js/sensore-cassetta.js` | NEW | ~80 | Simulazione sensore cassetta |
| `js/suoneria.js` | NEW | ~60 | Web Audio API allarme |
| `js/gestore-manutenzione.js` | NEW | ~150 | Countdown + tracking + logging |
| `js/chiosco.js` | MODIFIED | +120 | 4 nuovi stati FSM + handler |
| `js/gettoniera.js` | MODIFIED | +30 | validaSaldo + azzeraSaldo |
| `js/display.js` | MODIFIED | +50 | mostraFuoriServizio + aggiornaCountdown |
| `js/app.js` | MODIFIED | +40 | Inizializzazione nuovi componenti |
| `index.html` | MODIFIED | +30 | Pannello admin + countdown timer |
| `css/components.css` | MODIFIED | +80 | Stili manutenzione + FUORI_SERVIZIO |
| **TOTAL** | - | **~640 LOC** | 3 new files, 6 modified files |

### External Dependencies

| Dependency | Version | License | Usage |
|-----------|---------|---------|-------|
| loglevel | 1.9.1 | MIT | Logging (già esistente) |
| Web Audio API | Native | W3C | Suoneria (no dependency) |

**Note**: Zero nuove dipendenze esterne aggiunte (Web Audio API è browser nativo).

---

**Plan Status**: ✅ Completo - Ready for `/speckit.tasks` command
**Last Updated**: 2025-10-17
**Reviewers**: Pending review
**Approval**: Pending approval for implementation start
