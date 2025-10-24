# Quickstart: Visualizzazione Stato Cassetta e Controlli Manutenzione

**Feature**: 004-mostra-lo-stato
**Date**: 2025-10-24
**Audience**: Sviluppatori, tester, operatori

## Panoramica

Questa feature aggiunge un pannello manutenzione cassetta che mostra lo stato corrente (APERTA/CHIUSA) e fornisce pulsanti per simulare eventi di apertura/chiusura. Il sistema è completamente indipendente dalla logica del chiosco (FSM) e funziona in modo event-driven.

**Cosa fa**:
- ✅ Visualizza badge stato cassetta: verde "APERTA" o grigio "CHIUSA"
- ✅ Pulsanti "Apri Cassetta" e "Chiudi Cassetta" sempre abilitati
- ✅ Aggiornamento UI automatico <500ms da evento
- ✅ Gestione eventi idempotenti (apertura quando già aperta è valido)
- ✅ Logging completo su console browser
- ✅ Test E2E automatizzati con Playwright

**Cosa NON fa**:
- ❌ Non controlla hardware reale (simulazione pura)
- ❌ Non salva stato (reset al reload pagina)
- ❌ Non influenza FSM chiosco (porta, pagamenti, etc.)

---

## Setup Iniziale

### Prerequisiti

- Browser moderno (Chrome/Firefox/Safari/Edge ultime 2 versioni)
- Web server locale (Python, Node, o aprire file:// direttamente)
- Node.js + npm (solo per test E2E)

### Installazione

1. **Clone repository** (se non già fatto):
   ```bash
   cd /home/mario/rfi-poc
   git checkout 004-mostra-lo-stato
   ```

2. **Nessuna installazione richiesta**: Feature è build-free, file statici pronti all'uso.

3. **Per test E2E** (opzionale):
   ```bash
   npm install  # Playwright già configurato
   ```

---

## Avvio Applicazione

### Opzione 1: Python Web Server (Raccomandato)

```bash
cd /home/mario/rfi-poc
python3 -m http.server 8000
```

Apri browser: `http://localhost:8000`

### Opzione 2: Aprire File Direttamente

```bash
# Linux/Mac
open index.html

# Windows
start index.html
```

**Nota**: Alcune funzionalità potrebbero richiedere web server (CORS policy). Preferire Opzione 1.

---

## Utilizzo Feature

### 1. Localizza Pannello Manutenzione

Scorri in basso la pagina, sotto il pannello admin. Troverai:

```
┌─────────────────────────────────┐
│ Manutenzione Cassetta           │
├─────────────────────────────────┤
│ Stato: [CHIUSA]  ← Badge grigio │
│                                  │
│ [Apri Cassetta] [Chiudi Cassetta]│
└─────────────────────────────────┘
```

### 2. Simulare Apertura Cassetta

1. Click su **"Apri Cassetta"**
2. Badge diventa verde e mostra **"APERTA"**
3. Console browser logga: `[timestamp] Cassetta aperta: CHIUSA → APERTA`

**Nota**: Pulsante "Apri Cassetta" rimane sempre abilitato (puoi clickare anche se già aperta).

### 3. Simulare Chiusura Cassetta

1. Click su **"Chiudi Cassetta"**
2. Badge diventa grigio e mostra **"CHIUSA"**
3. Console browser logga: `[timestamp] Cassetta chiusa: APERTA → CHIUSA`

### 4. Verificare Logging

Apri **DevTools Console** (F12):

```
[INFO] [2025-10-24T14:32:15.123Z] Cassetta aperta: CHIUSA → APERTA
[DEBUG] [2025-10-24T14:32:16.456Z] Evento apertura idempotente (già APERTA)
[INFO] [2025-10-24T14:32:20.789Z] Cassetta chiusa: APERTA → CHIUSA
```

**Livelli Log**:
- `INFO`: Cambio stato effettivo
- `DEBUG`: Eventi idempotenti (ripetuti)
- `WARN`: Sequenze rapide anomale (>5 eventi/sec)

**Cambiare Livello**:
```javascript
// In console browser
log.setLevel('debug');  // Mostra tutto
log.setLevel('info');   // Nascondi DEBUG (default)
```

---

## Scenari di Test Manuale

### Test 1: Stato Iniziale

**Obiettivo**: Verificare stato default CHIUSA al caricamento.

**Passi**:
1. Ricarica pagina (F5)
2. Localizza pannello manutenzione

**Risultato Atteso**:
- Badge grigio mostra "CHIUSA"
- Entrambi pulsanti abilitati
- Console logga "SensoreCassetta inizializzato (stato: CHIUSA)"

**Success Criteria**: SC-001 (identificazione stato <2 secondi)

---

### Test 2: Ciclo Apertura-Chiusura

**Obiettivo**: Verificare transizioni stato complete.

**Passi**:
1. Click "Apri Cassetta"
2. Verifica badge verde "APERTA"
3. Click "Chiudi Cassetta"
4. Verifica badge grigio "CHIUSA"

**Risultato Atteso**:
- Badge cambia colore/testo immediatamente (<500ms)
- Console mostra 2 log INFO con stati corretti
- Nessun errore console

**Success Criteria**: SC-002 (update <500ms), SC-004 (ciclo completo)

---

### Test 3: Eventi Idempotenti

**Obiettivo**: Verificare che eventi ripetuti siano validi.

**Passi**:
1. Click "Apri Cassetta" (stato diventa APERTA)
2. Click "Apri Cassetta" nuovamente
3. Verifica badge ancora "APERTA"
4. Console mostra log DEBUG "idempotente"

**Risultato Atteso**:
- Badge rimane verde "APERTA" (stato invariato)
- Console mostra log DEBUG (non ERROR)
- Pulsante ancora cliccabile (non disabilitato)

**Success Criteria**: SC-004 (gestione idempotenza)

---

### Test 4: Eventi Rapidi

**Obiettivo**: Verificare gestione click veloci.

**Passi**:
1. Click rapido alternato: Apri-Chiudi-Apri-Chiudi-Apri (5 click in 1 sec)
2. Verifica stato finale badge

**Risultato Atteso**:
- Badge mostra "APERTA" (ultimo click)
- Tutti eventi processati (5 log console)
- UI non "lagga" o freeza

**Success Criteria**: SC-005 (gestione 5 eventi/sec)

---

### Test 5: Indipendenza da Chiosco FSM

**Obiettivo**: Verificare che cassetta non influenza chiosco.

**Passi**:
1. Avvia pagamento con monete (chiosco in stato PAGAMENTO_MONETE)
2. Click "Apri Cassetta" durante pagamento
3. Verifica badge cassetta diventa "APERTA"
4. Verifica chiosco continua pagamento normalmente

**Risultato Atteso**:
- Cassetta aperta (badge verde)
- Chiosco ancora in PAGAMENTO_MONETE (display mostra countdown)
- Nessun side effect tra sistemi

**Success Criteria**: FR-011 (indipendenza FSM)

---

## Esecuzione Test E2E

### Comandi Test

```bash
# Test feature 004 isolata
npm run test:feature-004

# Test tutte feature (verifica non-regressione)
npm test

# Test con UI interattiva
npm run test:ui

# Test con report HTML
npm run test:report
```

### Output Atteso

```
✅ US1: Visualizza stato CHIUSA iniziale
✅ US1: Aggiornamento automatico UI su cambio stato
✅ US2: Click Apri → stato APERTA entro 500ms
✅ US2: Pulsante Apri sempre abilitato
✅ US3: Click Chiudi → stato CHIUSA entro 500ms
✅ US3: Pulsante Chiudi sempre abilitato
✅ Edge: Eventi idempotenti (apri quando già aperta)
✅ Edge: Eventi idempotenti (chiudi quando già chiusa)
✅ Edge: Sequenza rapida 5 eventi in 1 secondo
✅ Regressione: Feature 001 (chiosco base) funziona
✅ Regressione: Feature 002 (porta passaggio) funziona
✅ Regressione: Feature 003 (svuotamento) funziona

12 test passati, 0 falliti
```

**Se Test Falliscono**:
1. Verifica web server locale attivo (`http://localhost:8000`)
2. Controlla console browser per errori JavaScript
3. Verifica elementi DOM hanno ID corretti (`#stato-cassetta`, `#btn-apri-cassetta`, `#btn-chiudi-cassetta`)

---

## Troubleshooting

### Problema: Badge Non Si Aggiorna

**Sintomi**: Click pulsante ma badge rimane invariato.

**Soluzioni**:
1. Apri console browser (F12), cerca errori JavaScript
2. Verifica log: Dovrebbe mostrare "Cassetta aperta/chiusa: ..."
3. Controlla `window.app.sensoreCassetta.getStato()` in console:
   ```javascript
   console.log(window.app.sensoreCassetta.getStato()); // Deve essere 'APERTA' o 'CHIUSA'
   ```

**Causa Probabile**: Errore in `gestore-manutenzione.js` → `aggiornaUI()` non eseguito.

---

### Problema: Pulsanti Disabilitati

**Sintomi**: Pulsanti "Apri Cassetta" o "Chiudi Cassetta" grigi/non cliccabili.

**Soluzioni**:
1. **BUG!** Pulsanti devono essere sempre abilitati (FR-003/FR-004)
2. Verifica HTML: `<button>` NON deve avere attributo `disabled`
3. Verifica CSS: Nessun `pointer-events: none` applicato

**Causa Probabile**: Implementazione errata, viola specifica.

---

### Problema: Console Piena di Log DEBUG

**Sintomi**: Console illeggibile, troppi log idempotenti.

**Soluzioni**:
1. Cambia livello log in console:
   ```javascript
   log.setLevel('info');  // Nascondi DEBUG
   ```
2. Alternativa: Filter console DevTools per livello (hide DEBUG)

**Causa**: Eventi idempotenti frequenti, comportamento atteso.

---

### Problema: Test E2E Timeout

**Sintomi**: Test Playwright fallisce con "Timeout 500ms exceeded".

**Soluzioni**:
1. Verifica web server localhost attivo
2. Aumenta timeout temporaneamente (debugging):
   ```javascript
   await expect(page.locator('#stato-cassetta')).toContainText('APERTA', { timeout: 2000 });
   ```
3. Controlla performance browser (CPU usage <80%)

**Causa Probabile**: Update UI lento (viola SC-002), refactoring necessario.

---

## Debug Avanzato

### Inspect Componenti in Console

```javascript
// Accesso globale componenti (esposti da app.js)
const sensore = window.app.sensoreCassetta;
const gestore = window.app.gestoreManutenzione;

// Check stato corrente
console.log(sensore.getStato());  // 'APERTA' | 'CHIUSA'

// Simulare evento programmaticamente
sensore.notificaApertura();

// Verificare listener registrati
console.log(sensore.listeners);  // Map { 'cambioStato' => [function] }
```

### Forzare Reset Stato

```javascript
// In console browser
window.app.sensoreCassetta.stato = 'CHIUSA';
window.app.gestoreManutenzione.aggiornaUI({
  timestamp: new Date().toISOString(),
  statoPrec: 'APERTA',
  statoNuovo: 'CHIUSA'
});
```

### Test Performance Manuale

```javascript
// Misura tempo aggiornamento UI
console.time('update');
window.app.sensoreCassetta.notificaApertura();
console.timeEnd('update');  // Deve essere <500ms
```

---

## File Coinvolti

### Nuovi File

- `js/sensore-cassetta.js` - Classe gestione stato cassetta
- `js/gestore-manutenzione.js` - Classe UI pannello manutenzione
- `tests/e2e/feature-004.spec.js` - Test E2E Playwright

### File Modificati

- `index.html` - Aggiunta sezione `.manutenzione-panel`
- `css/components.css` - Stili badge stato + pulsanti manutenzione
- `js/app.js` - Inizializzazione `SensoreCassetta` e `GestoreManutenzione`
- `package.json` - Script npm `test:feature-004`

### File Invariati

- `js/chiosco.js` - FSM non modificata (indipendenza FR-011)
- `js/porta.js`, `js/display.js`, etc. - Componenti esistenti non toccati

---

## FAQ

### Q: La cassetta è hardware reale?

**A**: No, è completamente simulata. I pulsanti simulano eventi hardware che in produzione verrebbero da sensori fisici.

### Q: Lo stato cassetta è salvato?

**A**: No, reset al reload pagina. Feature futura potrebbe aggiungere persistence in localStorage.

### Q: Posso aprire cassetta durante pagamento?

**A**: Sì! Cassetta è indipendente dalla FSM chiosco (FR-011). Apertura cassetta non influenza porta/pagamento/etc.

### Q: Perché posso cliccare "Apri" quando già aperta?

**A**: Comportamento intenzionale (FR-008). Simula hardware reale che può inviare eventi ripetuti. Sistema gestisce idempotenza con log DEBUG.

### Q: Test E2E modificano feature esistenti?

**A**: No, test 004 sono isolati. Test regressione verificano che feature 001-003 funzionino ancora correttamente (SC-007).

---

## Prossimi Passi

1. **Leggere Spec Completa**: [spec.md](./spec.md) per requisiti dettagliati
2. **Esaminare Data Model**: [data-model.md](./data-model.md) per architettura
3. **Studiare API Contracts**: [contracts/](./contracts/) per interfacce pubbliche
4. **Eseguire Test E2E**: `npm run test:feature-004` per verificare implementazione

---

## Support

**Bug Report**: Verificare test E2E prima, poi segnalare issue con:
- Browser/versione usata
- Log console completi (errori JavaScript)
- Passi per riprodurre
- Screenshot badge + console

**Documentazione Completa**:
- Feature Spec: [spec.md](./spec.md)
- Implementation Plan: [plan.md](./plan.md)
- Research: [research.md](./research.md)
- Data Model: [data-model.md](./data-model.md)

---

**Versione**: 1.0.0 | **Ultima Modifica**: 2025-10-24
