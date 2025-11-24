# Report Nuovi Debiti Tecnici Individuati

In aggiunta a quanto già tracciato in `TECHNICAL-DEBT.md`, sono stati individuati i seguenti debiti tecnici durante l'analisi del codice JavaScript.

## 1. Architettura e Modularità (Priorità ALTA)

### Mancanza di Moduli ES6
Il progetto utilizza ancora il pattern IIFE (Immediately Invoked Function Expression) e l'assegnazione a `window` per esporre le classi globalmente (es. `window.Chiosco = Chiosco`).
- **Problema**: Inquina il namespace globale, rende difficile la gestione delle dipendenze e impedisce il tree-shaking.
- **Soluzione**: Migrare a ES6 Modules (`import` / `export`).

### Accoppiamento Logica-UI
Le classi di logica come `Chiosco` e `LettoreCarte` manipolano direttamente il DOM (es. `document.getElementById`, `classList.add`).
- **Problema**: Viola il principio di separazione delle responsabilità (SoC). La logica di business non dovrebbe conoscere i dettagli dell'implementazione UI.
- **Esempi**:
  - `Chiosco.js`: Metodi `onEntraIDLE`, `onEntraPortaAperta` modificano direttamente classi CSS e proprietà `disabled` dei pulsanti.
  - `LettoreCarte.js`: Gestisce direttamente i listener sui propri elementi DOM nel costruttore.
- **Soluzione**: Centralizzare tutta la manipolazione del DOM nella classe `Display` o in un nuovo componente `UIManager`, facendo comunicare la logica tramite eventi o chiamate a metodi astratti.

## 2. Qualità del Codice (Priorità MEDIA)

### Gestione Valuta con Floating Point
La classe `Gettoniera` utilizza numeri in virgola mobile per gestire gli importi (es. `1.20`, `0.50`).
- **Problema**: I calcoli in virgola mobile possono portare a errori di arrotondamento imprevisti (es. `0.1 + 0.2 !== 0.3`). L'uso di `Math.round(x * 100) / 100` è un workaround fragile.
- **Soluzione**: Utilizzare interi per rappresentare i centesimi (es. `120` invece di `1.20`) e formattare solo a livello di visualizzazione.

### Magic Numbers e Stringhe Hardcoded
Sono presenti numerosi valori letterali sparsi nel codice.
- **Esempi**:
  - Timeout: `1500`, `2000`, `3000` in `chiosco.js`.
  - Stati: Stringhe come `'IDLE'`, `'PAGAMENTO_MONETE'` ripetute più volte.
  - Probabilità: `0.8` in `lettore-carte.js`.
- **Soluzione**: Estrarre questi valori in costanti o file di configurazione (es. `CONSTANTS.js` o `Config.js`).

### Switch Statement Complesso
Il metodo `onCambioStato` in `Chiosco.js` è un grande switch statement che crescerà con ogni nuovo stato.
- **Problema**: Viola l'Open/Closed Principle. Aggiungere uno stato richiede la modifica di questo metodo centrale.
- **Soluzione**: Implementare il pattern State completo, dove ogni stato è una classe che gestisce il proprio comportamento (es. `StatoIdle`, `StatoPagamento`).

## 3. Manutenibilità (Priorità BASSA)

### Funzione `init` Monolitica
La funzione `init` in `app.js` è responsabile di troppe cose: istanziazione, wiring delle dipendenze e definizione degli event handler.
- **Problema**: Difficile da testare e manutenere.
- **Soluzione**: Separare la configurazione delle dipendenze (Dependency Injection setup) dalla logica di avvio e dalla definizione degli handler.

### Codice Commentato/Inutilizzato
Sebbene il codice sia generalmente pulito, ci sono alcune sezioni che potrebbero beneficiare di una pulizia o documentazione migliore sui "perché" piuttosto che sui "cosa".
