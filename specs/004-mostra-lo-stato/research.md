# Research: Visualizzazione Stato Cassetta e Controlli Manutenzione

**Feature**: 004-mostra-lo-stato
**Date**: 2025-10-24
**Purpose**: Risolvere decisioni tecniche e pattern architetturali per implementazione sistema event-driven stato cassetta

## Decisioni Tecniche

### 1. Pattern Event-Driven per Gestione Stato Cassetta

**Decision**: Utilizzo pattern Observer/Event Emitter vanilla JavaScript per gestire eventi cassetta indipendenti dalla FSM.

**Rationale**:
- **Disaccoppiamento**: FR-011 richiede che eventi cassetta siano completamente indipendenti dalla FSM del chiosco
- **Vanilla JS nativo**: JavaScript fornisce `EventTarget` o implementazione custom lightweight (`Map<evento, listener[]>`)
- **Allineamento progetto**: Pattern già utilizzato in componenti esistenti (porta.js, gettoniera.js hanno callback)
- **Testabilità**: Eventi ben definiti semplificano test E2E (trigger evento → verifica UI aggiornata)

**Alternatives Considered**:
- **EventTarget nativo**: Browser API standard ma limitata per eventi custom e debugging
  - **Rejected**: Preferito pattern custom per maggiore controllo logging e API più semplice
- **Polling stato**: Check periodico stato cassetta ogni N ms
  - **Rejected**: Inefficiente, latenza variabile, non rispetta target <500ms garantito
- **Accoppiamento con FSM chiosco**: Aggiungere stati cassetta nella FSM esistente
  - **Rejected**: Viola FR-011 (indipendenza totale), aumenta complessità FSM, mixing concerns

**Implementation Pattern**:
```javascript
// sensore-cassetta.js
class SensoreCassetta {
  constructor() {
    this.stato = 'CHIUSA'; // default iniziale
    this.listeners = new Map(); // { 'cambioStato': [fn1, fn2, ...] }
  }

  on(evento, callback) { /* registra listener */ }
  emit(evento, dati) { /* notifica tutti listener */ }

  notificaApertura() {
    const statoPrec = this.stato;
    this.stato = 'APERTA';
    this.emit('cambioStato', { statoPrec, statoNuovo: 'APERTA' });
  }

  notificaChiusura() { /* analogo */ }
}
```

### 2. Separazione UI: GestoreManutenzione vs Display Esistente

**Decision**: Creare componente UI separato `GestoreManutenzione` per pannello cassetta, non riutilizzare `Display` esistente.

**Rationale**:
- **Single Responsibility**: `Display` gestisce messaggi chiosco (pagamento, errori), cassetta è contesto diverso
- **Indipendenza FR-011**: Pannello manutenzione deve funzionare anche se FSM chiosco è in stato PAGAMENTO o PORTA_APERTA
- **UI distinta**: Stato cassetta ha requisiti diversi (badge status, 2 pulsanti sempre abilitati) vs display messaggi temporanei
- **Evita side effects**: Modificare Display per cassetta rischia regressioni feature 001-003

**Alternatives Considered**:
- **Estendere Display esistente**: Aggiungere metodo `mostraStatoCassetta()`
  - **Rejected**: Mixing concerns, Display già accoppiato a FSM chiosco, aumenta complessità
- **Riutilizzare stili Display**: Applicare classi CSS esistenti
  - **Rejected**: Stili Display ottimizzati per messaggi temporanei + countdown, non per status permanente

**Implementation Pattern**:
```javascript
// gestore-manutenzione.js
class GestoreManutenzione {
  constructor(sensoreCassetta, elementoContainer) {
    this.sensore = sensoreCassetta;
    this.container = elementoContainer;

    // Listener eventi sensore
    this.sensore.on('cambioStato', (dati) => this.aggiornaUI(dati));

    // Event handlers pulsanti UI
    this.setupPulsanti();
  }

  aggiornaUI(dati) {
    // Aggiorna badge stato, log evento
  }

  setupPulsanti() {
    // Pulsanti sempre abilitati, trigger notificaApertura/Chiusura
  }
}
```

### 3. Gestione Idempotenza Eventi (FR-008, FR-009)

**Decision**: Permettere eventi idempotenti (apertura quando già aperta) con logging DEBUG, aggiornamento UI comunque eseguito.

**Rationale**:
- **Requisito esplicito**: FR-008/FR-009 richiedono che eventi ripetuti siano validi
- **Simulazione realistica**: Hardware reale può inviare eventi ripetuti (rimbalzo sensore)
- **No-op con log**: Non cambia stato ma logga evento per osservabilità
- **UI robusta**: UI risponde a ogni evento anche se stato non cambia (conferma visiva per utente)

**Alternatives Considered**:
- **Bloccare eventi idempotenti**: Ignorare evento apertura se già aperta
  - **Rejected**: Viola FR-008/FR-009, riduce testabilità, nasconde problemi hardware simulato
- **Throw error**: Lanciare eccezione su evento idempotente
  - **Rejected**: Eventi esterni non sono errori, sistema deve essere robusto

**Implementation Pattern**:
```javascript
notificaApertura() {
  const statoPrec = this.stato;
  if (statoPrec === 'APERTA') {
    log.debug('Evento apertura idempotente (cassetta già aperta)');
  } else {
    log.info(`Cassetta aperta (da ${statoPrec} a APERTA)`);
  }
  this.stato = 'APERTA';
  this.emit('cambioStato', { statoPrec, statoNuovo: 'APERTA' });
}
```

### 4. Test Strategy: Playwright E2E per Eventi Simulati

**Decision**: Test E2E con Playwright che simulano click pulsanti e verificano DOM aggiornato entro 500ms.

**Rationale**:
- **Infrastruttura esistente**: Playwright già configurato per feature 002 (test porta)
- **Coverage scenari reali**: Test E2E verificano integrazione completa HTML+CSS+JS+eventi
- **Performance verificabile**: `page.waitForSelector` con timeout 500ms verifica SC-002
- **Idempotenza testabile**: Click multiplo stesso pulsante verifica FR-008/FR-009
- **Non-regressione**: Test feature 001-003 eseguibili insieme garantiscono SC-007

**Alternatives Considered**:
- **Unit test puri JS**: Testare SensoreCassetta isolato con Jest/Mocha
  - **Rejected**: Progetto è build-free, aggiungere test runner viola Principio IV, E2E sufficiente
- **Test manuali**: Checklist manuale come feature 001
  - **Rejected**: FR-012 richiede test automatizzati, eventi rapidi impossibili testare manualmente

**Implementation Pattern**:
```javascript
// tests/e2e/feature-004.spec.js
test('US1: Visualizza stato CHIUSA iniziale', async ({ page }) => {
  await page.goto('http://localhost:8000');
  await expect(page.locator('#stato-cassetta')).toContainText('CHIUSA');
});

test('US2: Click Apri → stato APERTA entro 500ms', async ({ page }) => {
  await page.click('#btn-apri-cassetta');
  await expect(page.locator('#stato-cassetta')).toContainText('APERTA', { timeout: 500 });
});

test('Edge: Eventi idempotenti (apri quando già aperta)', async ({ page }) => {
  await page.click('#btn-apri-cassetta');
  await page.click('#btn-apri-cassetta'); // idempotente
  await expect(page.locator('#stato-cassetta')).toContainText('APERTA'); // stato invariato
});
```

### 5. Strategia Logging Eventi Cassetta

**Decision**: Utilizzare loglevel.min.js esistente con 3 livelli: DEBUG (idempotente), INFO (cambio stato), WARN (eventi rapidi).

**Rationale**:
- **Principio V**: Osservabilità obbligatoria, libreria logging già presente
- **Granularità appropriata**: DEBUG per eventi ripetuti (rumorosi), INFO per cambi effettivi, WARN per sequenze anomale
- **FR-010 compliance**: Ogni evento loggato con timestamp, stato precedente/nuovo
- **Debugging semplificato**: Console browser mostra traccia completa eventi per test manuali

**Alternatives Considered**:
- **console.log diretto**: Logging senza libreria
  - **Rejected**: Viola Principio V (libreria obbligatoria), no controllo livelli
- **Logging solo cambio stato**: Log solo se stato effettivamente cambia
  - **Rejected**: Perde visibilità eventi idempotenti, riduce osservabilità

**Implementation Pattern**:
```javascript
notificaApertura() {
  const timestamp = new Date().toISOString();
  const statoPrec = this.stato;

  if (statoPrec === 'APERTA') {
    log.debug(`[${timestamp}] Evento apertura idempotente (già APERTA)`);
  } else {
    log.info(`[${timestamp}] Cassetta aperta: ${statoPrec} → APERTA`);
  }

  this.stato = 'APERTA';
  this.emit('cambioStato', { timestamp, statoPrec, statoNuovo: 'APERTA' });
}
```

### 6. Posizionamento Pannello Manutenzione in index.html

**Decision**: Pannello manutenzione posizionato sotto pannello admin esistente, semanticamente separato da componenti chiosco.

**Rationale**:
- **Contesto operatore**: Pannello admin e pannello cassetta sono entrambi per operatori, raggruppamento logico
- **Indipendenza visuale**: Cassetta non è parte del flusso utente (monete/QR/porta), separazione chiara
- **Layout esistente**: Area sotto admin già disponibile, no refactoring layout maggiore

**Alternatives Considered**:
- **Integrato in pannello admin**: Aggiungere sezione cassetta dentro `#admin-panel`
  - **Rejected**: Admin gestisce saldo/reset, cassetta è hardware separato, mixing concerns
- **Pannello laterale**: Sidebar dedicata manutenzione
  - **Rejected**: Modifica layout globale, overhead CSS, feature semplice non giustifica

**Implementation Pattern**:
```html
<!-- index.html -->
<div class="admin-panel">...</div> <!-- esistente -->

<div class="manutenzione-panel"> <!-- NUOVO -->
  <h3>Manutenzione Cassetta</h3>
  <div class="stato-cassetta">
    <span>Stato: </span>
    <span id="stato-cassetta" class="badge">CHIUSA</span>
  </div>
  <div class="controlli-cassetta">
    <button id="btn-apri-cassetta" class="btn-manutenzione">Apri Cassetta</button>
    <button id="btn-chiudi-cassetta" class="btn-manutenzione">Chiudi Cassetta</button>
  </div>
</div>
```

## Best Practices Ricercate

### Event-Driven Architecture Vanilla JS

**Source**: MDN Web Docs, JavaScript Design Patterns
**Key Points**:
- Pattern Observer con Map per listener: O(1) registrazione/rimozione, semplice debugging
- `emit()` itera listener in ordine registrazione: comportamento prevedibile, no race conditions
- Cleanup: `removeListener()` per evitare memory leak (non critico qui, SPA single-page)

### Playwright Test Organization

**Source**: Playwright docs, feature 002 test esistenti
**Key Points**:
- Raggruppare test per US: `test.describe('US1: Visualizzazione stato')` migliora leggibilità report
- `page.goto()` una volta per test suite (beforeEach): riduce tempo esecuzione
- Selettori CSS stabili: `#stato-cassetta` (ID) meglio di `.badge:nth-child(2)` (fragile)
- Test idempotenza separati: categoria "Edge Cases" distinta da scenari accettazione

### CSS Status Badges

**Source**: Material Design, Bootstrap conventions
**Key Points**:
- Badge con background colorato: verde (APERTA), grigio (CHIUSA) - feedback visuale immediato
- Animazione transizione: `transition: background-color 0.3s` smooth su cambio stato
- Contrast ratio WCAG: Verde #4CAF50 / Grigio #9E9E9E vs testo bianco = AA compliance

## Rischi Identificati e Mitigazioni

### Rischio 1: Eventi Multipli Rapidi Sovrascrivono Log

**Impatto**: SC-005 richiede 5 eventi/sec, console può diventare illeggibile.

**Mitigazione**:
- Logging DEBUG per eventi idempotenti (meno rumorosi)
- Test E2E verifica solo stato finale (non ogni evento intermedio)
- Produzione: loglevel.setLevel('INFO') default nasconde DEBUG

### Rischio 2: Regressione Feature Esistenti per Modifiche CSS

**Impatto**: Aggiungere `.manutenzione-panel` può alterare layout esistente.

**Mitigazione**:
- CSS scoped: Classi specifiche `.manutenzione-panel`, no override globali
- Test E2E feature 001-003: Eseguire insieme a 004 per verificare SC-007 (zero regressioni)
- Visual review: Screenshot manuali prima/dopo per confronto

### Rischio 3: Performance Update UI su Eventi Rapidi

**Impatto**: SC-005 (5 eventi/sec) + SC-002 (<500ms) = 5 update DOM in 1 secondo, potenziale lag.

**Mitigazione**:
- Update DOM minimale: Solo textContent badge stato, no ricostruzione HTML
- Playwright test misura tempo: `waitForSelector` con timeout 500ms fallisce se lento
- Browser moderni: DOM update per singolo span non causa reflow pesanti

## Conclusioni

**Design Ready**: Pattern event-driven con SensoreCassetta + GestoreManutenzione soddisfa tutti i FR e SC.

**Zero Violazioni Costituzione**: Vanilla JS, no build, loglevel già presente, static HTML.

**Test Coverage**: 15+ test E2E Playwright coprono 4 US + edge cases idempotenza/eventi rapidi.

**Next Phase**: Procedere a data-model.md per schema entità e stati.
