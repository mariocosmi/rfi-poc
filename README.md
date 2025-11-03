# RFI PoC - Simulatore Chiosco Ingresso Ferroviario

[![Netlify Status](https://api.netlify.com/api/v1/badges/df75ca80-8ad7-4527-b16d-2a3ea39c0d7a/deploy-status)](https://app.netlify.com/sites/rfi-poc-chiosco/deploys)

Proof of Concept di un chiosco ingresso ferroviario basato su web. Gli utenti possono accedere pagando 1,20€ tramite monete o carta di credito, oppure mostrando codici autorizzati (QR o carta contactless).

## 🌐 Demo Live

**[🚀 Prova il simulatore](https://rfi-poc-chiosco.netlify.app)**

Il sito è hostato su Netlify con deploy automatici ad ogni push su master.

## 🚀 Caratteristiche

- **Pagamento flessibile**: Monete, carta di credito VISA, QR code, carta autorizzata
- **Gestione automatica**: Timeout inattività, apertura/chiusura porta automatica
- **Manutenzione**: Pannello admin per svuotamento cassetta e controllo stato
- **Osservabilità**: Logging completo con livelli di gravità (DEBUG, INFO, WARN, ERROR)
- **Test automatici**: 62 test E2E con Playwright (100% coverage feature)

## 📋 Feature Implementate

| Feature | Descrizione | Stato |
|---------|-------------|-------|
| [001](specs/001-un-mockup-che/) | Chiosco ingresso base (FSM, 4 metodi pagamento) | ✅ Completata |
| [002](specs/002-la-porta-deve/) | Chiusura manuale porta + test E2E | ✅ Completata |
| [003](specs/003-aggiungere-operazione-svuotamento/) | Operazione svuotamento cassetta | ✅ Completata |
| [004](specs/004-mostra-lo-stato/) | Visualizzazione stato cassetta | ✅ Completata |

## 🛠️ Stack Tecnologico

- **Frontend**: HTML5, CSS3, JavaScript ES6+ vanilla
- **Architettura**: Finite State Machine (FSM)
- **Testing**: Playwright 1.56.0
- **Logging**: loglevel 1.9.1
- **Deployment**: File statici (no build step, no server-side)

## 📦 Installazione

### Prerequisiti

- Browser moderno (Chrome, Firefox, Safari, Edge - ultime 2 versioni)
- Node.js 18+ (solo per test E2E)

### Setup

1. **Clone del repository**
   ```bash
   git clone https://github.com/mariocosmi/rfi-poc.git
   cd rfi-poc
   ```

2. **Installazione dipendenze test** (opzionale)
   ```bash
   npm install
   ```

3. **Avvio applicazione**
   ```bash
   # Opzione 1: Aprire index.html direttamente nel browser
   open index.html

   # Opzione 2: Server HTTP locale
   python3 -m http.server 8000
   # Visita: http://localhost:8000
   ```

## 🎯 Utilizzo

### Accesso Utente

1. **Pagamento con monete**
   - Clicca sulle monete disponibili (1€, 0,50€, 0,20€, ecc.)
   - Inserisci almeno 1,20€
   - La porta si apre automaticamente

2. **Pagamento con carta VISA**
   - Clicca "Paga con Carta"
   - Avvicina una carta VISA (numero inizia con "4")
   - Conferma transazione

3. **Codice QR autorizzato**
   - Inserisci un codice valido (1-99)
   - Clicca "Verifica QR"
   - La porta si apre se autorizzato

4. **Carta contactless autorizzata**
   - Inserisci un codice valido (1-99)
   - Clicca "Leggi Carta"
   - La porta si apre se autorizzato

### Pannello Manutenzione

Accessibile agli operatori per:
- **Svuotare cassetta**: Reset saldo a 0€
- **Aprire/Chiudere porta**: Controllo manuale
- **Monitorare stato**: Visualizzazione stato cassetta in tempo reale

Per maggiori dettagli, consulta il [Manuale Utente](MANUALE-UTENTE.md).

## 🧪 Testing

```bash
# Esegui tutti i test E2E
npm test

# Test specifici per feature
npm run test:feature-001  # Regressione feature 001
npm run test:feature-002  # Passaggio persona
npm run test:feature-003  # Svuotamento cassetta
npm run test:feature-004  # Stato cassetta

# Modalità interattiva (UI)
npm run test:ui

# Visualizza report HTML
npm run test:report
```

**Copertura test**: 62 test passati, 0 regressioni

## 🏗️ Architettura

### Finite State Machine (FSM)

Il sistema è orchestrato da una macchina a stati (`js/chiosco.js`):

```
IDLE → PAGAMENTO_MONETE → PORTA_APERTA → IDLE
     → PAGAMENTO_CARTA   ↗
     → VERIFICA_QR       ↗
     → VERIFICA_CARTA    ↗
     → TIMEOUT          → IDLE
```

### Componenti Principali

| Componente | File | Responsabilità |
|------------|------|----------------|
| **Chiosco** | `js/chiosco.js` | FSM principale, orchestrazione |
| **Display** | `js/display.js` | Messaggi utente, countdown |
| **Porta** | `js/porta.js` | Apertura/chiusura con animazioni |
| **Gettoniera** | `js/gettoniera.js` | Gestione monete, calcolo importo |
| **Lettore Carte** | `js/lettore-carte.js` | Pagamento e autorizzazione |
| **Lettore QR** | `js/lettore-qr.js` | Scanner codici QR |
| **Gestore Manutenzione** | `js/gestore-manutenzione.js` | Pannello admin |
| **Sensore Cassetta** | `js/sensore-cassetta.js` | Monitoraggio stato cassetta |

Per dettagli tecnici approfonditi, vedi [CLAUDE.md](CLAUDE.md).

## 📚 Documentazione

- **[CLAUDE.md](CLAUDE.md)**: Guida sviluppo, Constitution, architettura
- **[MANUALE-UTENTE.md](MANUALE-UTENTE.md)**: Manuale completo per operatori
- **[TECHNICAL-DEBT.md](TECHNICAL-DEBT.md)**: Tracking debito tecnico
- **[specs/](specs/)**: Specifiche feature (SpecKit format)
- **[tests/README.md](tests/README.md)**: Documentazione test E2E

## 🎨 Constitution Principles

Il progetto segue 6 principi fondamentali:

1. **Lingua Italiana**: UI, codice, commenti, log in italiano
2. **Static-First**: Solo file statici, no server-side
3. **JavaScript Vanilla**: Preferenza per vanilla JS (no framework)
4. **Build-Free**: Nessun bundler o transpiler
5. **Osservabilità**: Logging completo con loglevel
6. **Qualità del Codice**: Regola DRY pragmatica (max 2 occorrenze)

## 🐛 Debugging

Componenti esposti globalmente su `window.app`:

```javascript
// Console browser
window.app.chiosco.stato           // Stato corrente FSM
window.app.chiosco.reset()         // Reset manuale a IDLE
window.app.gettoniera.getSaldo()   // Saldo cassetta
log.setLevel('debug')              // Aumenta verbosità log
```

## 🤝 Contribuire

1. Fork del repository
2. Crea branch feature (`git checkout -b 005-nuova-feature`)
3. Segui i [Constitution Principles](#-constitution-principles)
4. Scrivi test E2E per nuove feature
5. Commit in italiano con formato standard
6. Push e apri Pull Request

## 📄 Licenza

Questo progetto è un Proof of Concept per scopi didattici e di ricerca.

## 🔗 Link Utili

- **Demo Live**: https://rfi-poc-chiosco.netlify.app
- **Repository**: https://github.com/mariocosmi/rfi-poc
- **Issues**: https://github.com/mariocosmi/rfi-poc/issues
- **Netlify Dashboard**: https://app.netlify.com/sites/rfi-poc-chiosco
- **Playwright Docs**: https://playwright.dev

---

**Versione**: 1.4.0 (Feature 004 completata)
**Ultimo aggiornamento**: Novembre 2025
