# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Simulatore web-based di un chiosco ingresso ferroviario. Gli utenti possono accedere pagando 1,20€ tramite monete o carta di credito, oppure mostrando codici autorizzati (QR o carta contactless).

**Stack**: HTML5 + CSS3 + JavaScript ES6+ vanilla (no framework, no build step)
**Architettura**: Static-first, completamente client-side
**Lingua**: Tutto in italiano (UI, codice, commenti, variabili)

## Constitution Principles

Il progetto segue una "costituzione" rigorosa:

1. **Lingua Italiana**: Tutto in italiano (testi UI, nomi variabili leggibili, commenti, messaggi)
2. **Static-First**: Solo file statici (HTML/CSS/JS), deployabile su CDN o file server
3. **JavaScript Vanilla**: Preferenza per vanilla JS (eccezione: libreria logging per osservabilità)
4. **Build-Free**: Nessun bundler, transpiler o build step - file linkati direttamente
5. **Osservabilità**: Logging completo su console browser con livelli di gravità (DEBUG, INFO, WARN, ERROR)
6. **Qualità del Codice**: Produrre codice di elevata qualità evitando ripetizioni eccessive - due occorrenze sono accettabili, tre richiedono refactoring (regola DRY pragmatica)

**Importante**: Qualsiasi violazione di questi principi deve essere documentata in `specs/*/plan.md` sotto "Complexity Tracking" con giustificazione.

## Project Structure

```
/
├── index.html              # Entry point - layout chiosco
├── css/
│   ├── styles.css          # Stili generali
│   ├── components.css      # Stili componenti hardware
│   └── animations.css      # Animazioni (porta, feedback)
├── js/
│   ├── app.js              # Inizializzazione + event handlers
│   ├── chiosco.js          # FSM principale (Finite State Machine)
│   ├── display.js          # Gestione display messaggi
│   ├── porta.js            # Simulazione porta (apre/chiude)
│   ├── gettoniera.js       # Simulazione monete + calcolo importo
│   ├── lettore-carte.js    # Lettore contactless (pagamento + autorizzazione)
│   ├── lettore-qr.js       # Scanner QR
│   ├── validatore.js       # Regole hardcoded validazione
│   └── logger.js           # Wrapper loglevel
├── assets/
│   └── lib/
│       └── loglevel.min.js # Unica dipendenza esterna
└── specs/                  # Feature specs (SpecKit format)
    ├── 001-un-mockup-che/  # Chiosco ingresso base
    │   ├── spec.md
    │   ├── plan.md
    │   ├── research.md
    │   ├── data-model.md
    │   └── quickstart.md
    └── 002-la-porta-deve/  # Chiusura porta su passaggio persona
        ├── spec.md         # User stories, requisiti funzionali
        ├── plan.md         # Piano implementazione, testing
        ├── research.md     # Decisioni tecniche
        ├── data-model.md   # Schema entità
        └── quickstart.md   # Guida uso simulatore
```

## Architecture

### Finite State Machine (FSM)

Il sistema è orchestrato da una macchina a stati (`chiosco.js`):

**Stati**:
- `IDLE`: Attesa azione utente
- `PAGAMENTO_MONETE`: Inserimento monete in corso (con timeout 20s)
- `PAGAMENTO_CARTA`: Transazione carta di credito in corso
- `VERIFICA_QR`: Verifica codice QR autorizzato
- `VERIFICA_CARTA`: Verifica carta contactless autorizzata
- `PORTA_APERTA`: Porta aperta (si chiude automaticamente dopo 15s)
- `TIMEOUT`: Timeout inattività (ritorna a IDLE dopo 2s)

**Pattern di transizione**: `chiosco.transizione(nuovoStato, dati)` verifica transizioni permesse e chiama handler `onEntraX()`

### Component Communication

- **Chiosco** (FSM) coordina tutti i componenti
- **Display** centralizza TUTTA la manipolazione del DOM (UI Decoupling)
- Ogni componente (Display, Porta, Gettoniera, Lettori) è una classe indipendente
- `app.js` inizializza componenti, li collega al Chiosco e registra event handlers
- Comunicazione via riferimenti diretti: `chiosco.display.mostraMessaggio(...)`, `chiosco.porta.apri()`
- Debugging: componenti esposti su `window.app` (es. `window.app.chiosco.stato`)

### Validation Rules (Hardcoded)

Definite in `validatore.js`:
- **Codici autorizzati** (QR/carte): numeri da 1 a 99 (`Validatore.isCodiceAutorizzato()`)
- **Carte di credito**: solo VISA (numero inizia con "4", `Validatore.isCartaVISA()`)

## Running the Application

**Sviluppo locale**:
```bash
# Opzione 1: Aprire direttamente index.html nel browser (protocollo file://)
# Opzione 2: Server HTTP statico
python3 -m http.server 8000
# Visita: http://localhost:8000
```

**Testing Automato (Playwright)**:
```bash
npm test              # Esegue tutti i test (headless)
npm run test:ui       # Apre UI interattiva Playwright
npm run test:headed   # Esegue test con browser visibile
```

**Testing Manuale**: Aprire DevTools console per vedere log dettagliati. Set log level:
```javascript
log.setLevel('debug')  // DEBUG, INFO, WARN, ERROR
```

**Browser supportati**: Ultime 2 versioni di Chrome, Firefox, Safari, Edge (risoluzione minima 1024x768)

## Development Workflow

### SpecKit Integration

Il progetto usa SpecKit per gestire feature specs. Ogni feature ha una directory in `specs/`:

- `spec.md`: Definizione requisiti (user stories, scenari accettazione)
- `plan.md`: Piano implementazione (struttura, testing, Constitution check)
- `research.md`: Decisioni tecniche dettagliate
- `data-model.md`: Schema entità e stato
- `quickstart.md`: Guida rapida uso
- `tasks.md`: Task breakdown per implementazione

**Comandi SpecKit** (se disponibili):
- `/speckit.plan`: Genera plan.md da spec.md
- `/speckit.tasks`: Genera tasks.md da plan.md
- `/speckit.implement`: Assistenza implementazione guidata

### Making Changes

1. **Per nuove feature**: Creare spec in `specs/NNN-nome-feature/spec.md` seguendo template
2. **Per modifiche UI/logica**: Modificare file JS/CSS appropriato
3. **Testing**: Eseguire `npm test` per regressioni + verifica manuale
4. **Logging**: Aggiungere log appropriati (`log.debug/info/warn/error`)
5. **Constitution check**: Verificare conformità principi (specialmente se aggiungete dipendenze)

### Git Workflow

Branch format: `NNN-nome-feature` (es. `001-un-mockup-che`)
Commit in italiano con formato standard del repository

## Key Implementation Details

### Currency Precision
La classe `Gettoniera` gestisce internamente gli importi in **centesimi (interi)** per evitare errori di precisione floating point. L'interfaccia pubblica accetta/restituisce Euro per compatibilità.

### Timeout Management

- `GestoreTimeout` (in `chiosco.js`) gestisce timeout inattività 20s durante pagamento monete
- Countdown visibile su display (`display.aggiornaCountdown()`)
- Ogni inserimento moneta resetta timeout
- Timeout disabilitato per operazioni rapide (QR, carte)

### Input Locking

- Durante operazioni (lettura carte/QR, transazioni), altri input disabilitati tramite `chiosco.display.abilitaInput(false)`
- Previene accessi simultanei e conflitti stato

### Payment Flow

**Monete**:
1. Click moneta → transizione `IDLE` → `PAGAMENTO_MONETE`
2. `gettoniera.inserisciMoneta(valore)` → converte in centesimi, calcola rimanente
3. Se rimanente <= 0 → `chiosco.verificaPagamento()` → transizione `PORTA_APERTA`

**Carta (pagamento)**:
1. Click "Paga con Carta" → transizione `PAGAMENTO_CARTA`
2. Simula lettura carta, verifica VISA, elabora transazione
3. Se successo → `PORTA_APERTA`, se fallimento → `IDLE`

**QR/Carta (autorizzazione)**:
1. Input codice → transizione `VERIFICA_QR` / `VERIFICA_CARTA`
2. Verifica codice con `Validatore.isCodiceAutorizzato()`
3. Se valido (1-99) → `PORTA_APERTA`, altrimenti → `IDLE`

### Door Behavior

- Apertura: animazione CSS (`porta.apri()` aggiunge classe `aperta`)
- Chiusura automatica: 15s dopo apertura
- **Chiusura manuale** (feature 002): Pulsante "Persona passata" visibile quando porta aperta, chiude immediatamente cancellando timer 15s
- Dopo chiusura: transizione automatica a `IDLE` (reset completo)

## Testing

Testing manuale esplorativo con checklist in `specs/001-un-mockup-che/plan.md` (sezione "Fase 2: Test di Accettazione").

**Test console** per validazione:
```javascript
// Verifica regole hardcoded
console.assert(Validatore.isCodiceAutorizzato("42") === true)
console.assert(Validatore.isCodiceAutorizzato("100") === false)
console.assert(Validatore.isCartaVISA("4111111111111111") === true)
console.assert(Validatore.isCartaVISA("5500000000000004") === false)
```

**Criteri rilascio**: Vedere `specs/001-un-mockup-che/plan.md` - "Criteri di Rilascio"

## Debugging

Componenti esposti globalmente:
```javascript
window.app.chiosco.stato           // Stato corrente FSM
window.app.chiosco.reset()         // Reset manuale a IDLE
window.app.gettoniera.getImportoRimanente()  // Importo rimanente
window.app.display.mostraMessaggio('Test', 'info')  // Test display
log.setLevel('debug')              // Aumenta verbosità log
```

## Important Notes

- **No REST API**: Tutto client-side, nessun backend
- **No persistence**: Stato perso al reload (intenzionale)
- **Monete accettate**: 1€, 0,50€, 0,20€, 0,10€, 0,05€, 0,02€, 0,01€
- **No resto**: Sovrapagamenti accettati ma non erogato resto
- **Single user**: Sistema gestisce un utente alla volta
