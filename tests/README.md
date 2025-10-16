# Test E2E - RFI POC

Test automatici end-to-end con Playwright per feature 001 e 002.

## 📋 Copertura Test

### Feature 002: Passaggio Persona
**File:** `e2e/feature-002-passaggio-persona.spec.js`

- ✅ **US1 (P1)** - Chiusura manuale porta
  - Chiusura < 2s dal click
  - Timer 15s cancellato correttamente
  - Pulsante disabilitato dopo click
  - Display mostra "Passaggio rilevato"

- ✅ **US2 (P2)** - Visibilità pulsante
  - Nascosto in IDLE/PAGAMENTO
  - Visibile in PORTA_APERTA
  - Tooltip funzionante

- ✅ **US3 (P3)** - Logging completo
  - Log include tempo apertura
  - Log include metodo (monete, carta, qr, carta-autorizzata)
  - Tutti i 4 metodi testati

- ✅ **Edge Cases**
  - Click multipli → solo primo elaborato
  - Click immediato (<200ms) accettato
  - Click a 14.5s → timer cancellato

- ✅ **Success Criteria**
  - SC-001: Riduzione tempo ciclo ~40%
  - SC-002: Visibilità condizionale
  - SC-005: Zero breaking changes

**Totale:** 18 test

### Feature 001: Regressione Base
**File:** `e2e/feature-001-regressione.spec.js`

- ✅ Pagamento monete (1.20€)
- ✅ Pagamento carta VISA (randomizzato)
- ✅ QR code autorizzato (42, 50, 99)
- ✅ QR code non autorizzato
- ✅ Carta autorizzata (42, 50, 99)
- ✅ Carta non autorizzata
- ✅ Timeout 20s inattività
- ✅ Chiusura automatica porta 15s
- ✅ Transizioni FSM
- ✅ Animazioni CSS
- ✅ Logging console

**Totale:** 20 test

## 🚀 Quick Start

### Eseguire tutti i test

```bash
npm test
```

### Eseguire test in modalità UI (interattiva)

```bash
npm run test:ui
```

### Eseguire test con browser visibile (headed mode)

```bash
npm run test:headed
```

### Eseguire solo test feature 002

```bash
npm run test:feature-002
```

### Eseguire solo test feature 001 (regressione)

```bash
npm run test:feature-001
```

### Visualizzare report HTML

```bash
npm run test:report
```

## 📊 Output Esempio

```
Running 38 tests using 1 worker

  ✓ [chromium] › feature-002-passaggio-persona.spec.js:28:3 › US1-T016: Click pulsante chiude porta < 2s (1.2s)
  ✓ [chromium] › feature-002-passaggio-persona.spec.js:56:3 › US1-T014: Pulsante disabilitato dopo click (843ms)
  ✓ [chromium] › feature-002-passaggio-persona.spec.js:70:3 › US1-T015: Display mostra "Passaggio rilevato" (921ms)
  ...

  38 passed (1.5m)
```

## 🎯 Test Specifici

### Test singolo (by name)

```bash
npx playwright test -g "US1-T016"
```

### Test con debug

```bash
npx playwright test --debug
```

### Test solo falliti

```bash
npx playwright test --last-failed
```

## 📁 Struttura File

```
tests/
├── e2e/
│   ├── feature-001-regressione.spec.js    # 20 test regressione
│   └── feature-002-passaggio-persona.spec.js  # 18 test feature 002
└── README.md                               # Questa guida
```

## ⚙️ Configurazione

**File:** `playwright.config.js`

- **Browser:** Chromium (Chrome/Edge)
- **Base URL:** http://localhost:8000
- **Server:** Auto-start Python HTTP server
- **Timeout:** 30s per test
- **Screenshot:** Solo su fallimento
- **Video:** Solo su fallimento
- **Report:** HTML + List

## 🐛 Troubleshooting

### Test falliscono con "ERR_CONNECTION_REFUSED"

Verifica che il server sia avviato:

```bash
npm run server
```

Poi in un'altra finestra:

```bash
npm test
```

### Browser non si apre

Installa dipendenze browser:

```bash
npx playwright install chromium
```

### Test "Pagamento carta" fallisce casualmente

**Normale!** Il pagamento carta ha successo randomizzato 80%, quindi ~20% dei test potrebbero fallire. Questo è comportamento atteso per simulare rifiuti carta reali.

Per test deterministici, skippa quel test o aumenta retries in `playwright.config.js`.

## 📖 Riferimenti

- **Spec Feature 002:** `specs/002-la-porta-deve/spec.md`
- **Tasks Feature 002:** `specs/002-la-porta-deve/tasks.md`
- **Quickstart Feature 002:** `specs/002-la-porta-deve/quickstart.md`
- **Playwright Docs:** https://playwright.dev

## ✅ Success Criteria Verification

I test automatici verificano **tutti i Success Criteria**:

- ✅ **SC-001**: Riduzione tempo ciclo ~40% (test cronometra chiusura)
- ✅ **SC-002**: Pulsante visibile solo quando porta aperta (test visibilità)
- ✅ **SC-003**: Chiusura < 2s dal click (test timeout 2000ms)
- ✅ **SC-004**: Log include timestamp, tempo, metodo (test console logs)
- ✅ **SC-005**: Zero breaking changes (38 test regressione + feature 002)
- ✅ **SC-006**: Click multipli bloccati (test edge case)

## 🎭 CI/CD Integration

Per integrare in GitHub Actions, crea `.github/workflows/test.yml`:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

**Ultimo aggiornamento:** 2025-10-16
**Test totali:** 38
**Tempo esecuzione:** ~90s
