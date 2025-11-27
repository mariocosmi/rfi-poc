# Debiti Tecnici Attuali - Analisi Completa

**Data**: 2025-11-27  
**Stato Codebase**: Post Sprint 5 (State Pattern completato)

## Legenda Priorità

- 🔴 **ALTA**: Impatta architettura, manutenibilità a lungo termine, o introdurrebbe breaking changes
- 🟡 **MEDIA**: Migliora qualità del codice, riduce rischio errori, facilita estensioni future
- 🟢 **BASSA**: Nice-to-have, polish generale, minor improvements

---

## Decisioni Architetturali

### ⚪ Pattern Globale `window.*` - Mantenuto Intenzionalmente

**Decisione**: Il progetto usa deliberatamente il pattern `window.*` per esporre classi globalmente invece di moduli ES6.

```javascript
// Pattern attuale (mantenuto):
class Chiosco { ... }
window.Chiosco = Chiosco;
```

**Motivazioni**:
1. ✅ **Accesso file:// fondamentale** - Doppio click su `index.html` deve funzionare
2. ✅ **Constitution Principle 2**: Static-First deployment su qualsiasi hosting
3. ✅ **Constitution Principle 4**: Build-Free (no bundler richiesti)
4. ✅ **Semplicità**: Zero configurazione, zero dipendenze build
5. ✅ **Debug facile**: Tutte le classi accessibili da console browser

**Alternativa rifiutata (ES6 Modules)**:
- ❌ Richiede server HTTP (blocca `file://`)
- ❌ Necessita bundler per produzione ottimale
- ❌ Viola principi Constitution

**Conclusione**: Pattern `window.*` è la scelta **corretta** per questo progetto, non un debito tecnico.

---

## Debiti Tecnici Attivi

### 🟡 TD-A02: Qualità Codice - Magic Strings per Stati

**Categoria**: Manutenibilità
**Priorità**: MEDIA
**File coinvolti**: `chiosco.js`, `app.js`, `stati.js`

#### Problema
I nomi degli stati sono stringhe hardcoded sparse nel codice:
```javascript
// chiosco.js
this.stato = 'IDLE';  // ❌ Magic string
if (chiosco.stato === 'IDLE') { ... }  // ❌ Rischio typo

// Mappa transizioni con stringhe ripetute
this.transizioniPermesse = {
  'IDLE': ['PAGAMENTO_MONETE', 'PAGAMENTO_CARTA', ...],
  'PAGAMENTO_MONETE': ['PORTA_APERTA', 'TIMEOUT', 'IDLE', ...],
  // ... 50+ occorrenze totali
};
```

**Rischi**:
- Typo silenti (nessun errore a compile-time)
- Refactoring difficile (find & replace rischioso)
- Nessun autocomplete IDE

#### Soluzione Proposta
Creare `constants.js` con pattern globale:
```javascript
// constants.js
const STATI = Object.freeze({
  IDLE: 'IDLE',
  PAGAMENTO_MONETE: 'PAGAMENTO_MONETE',
  PAGAMENTO_CARTA: 'PAGAMENTO_CARTA',
  // ...
});

window.STATI = STATI;

// Uso:
this.stato = STATI.IDLE;  // ✅ Autocomplete + type safe
```

**Effort stimato**: 2-3h
**Benefici**: Autocomplete IDE, eliminazione typo, refactoring sicuro

---

### 🟡 TD-A03: Qualità Codice - Magic Numbers per Timeout

**Categoria**: Configurabilità  
**Priorità**: MEDIA  
**File coinvolti**: `chiosco.js`, `stati.js`, `app.js`

#### Problema
Valori di timeout sparsi come magic numbers:
```javascript
// chiosco.js
setTimeout(() => { ... }, 1500);  // ❌ Cosa significa?
setTimeout(() => { ... }, 3000);  // ❌ Duplicato in più punti

// stati.js
}, 15000);  // ❌ Chiusura porta
}, 2000);   // ❌ Timeout messaggio
```

**Impatti**:
- Difficile capire la logica temporale
- Modifiche richiedono find & replace
- Testing (velocizzazione simulazioni)
- Nessuna configurazione centralizzata

#### Soluzione Proposta
```javascript
// constants.js
export const TIMEOUTS = Object.freeze({
  CHIUSURA_PORTA_AUTO: 15000,        // 15s
  TRANSIZIONE_IDLE: 3000,            // 3s
  ANIMAZIONE_PORTA: 1500,            // 1.5s
  MESSAGGIO_TEMPORANEO: 2000,        // 2s
  TIMEOUT_INATTIVITA: 20000,         // 20s (default)
  // ...
});

// Uso:
setTimeout(() => { ... }, TIMEOUTS.ANIMAZIONE_PORTA);
```

**Effort stimato**: 1-2h  
**Benefici**: Configurazione centralizzata, testing semplificato

---

### 🟢 TD-A04: Architettura - Dependency Injection Manuale

**Categoria**: Testabilità  
**Priorità**: BASSA  
**File coinvolti**: `app.js`

#### Problema
Il wiring delle dipendenze è completamente manuale in `createAppComponents()`:
```javascript
// app.js - wiring imperativo
const chiosco = new Chiosco();
chiosco.display = display;
chiosco.porta = porta;
chiosco.gettoniera = gettoniera;
// ... 10+ assegnazioni manuali
```

**Impatti**:
- Setup verboso
- Testing richiede mock pesanti
- Difficile capire grafo dipendenze

#### Soluzione Proposta
Introdurre lightweight DI container o Factory Pattern:
```javascript
// container.js (opzione 1)
export class Container {
  register(name, factory) { ... }
  get(name) { ... }
}

// factory.js (opzione 2 - più semplice)
export function createApp(config = {}) {
  const display = config.display || new Display();
  const chiosco = new Chiosco({ display, porta: config.porta || new Porta() });
  return { chiosco, display, ... };
}
```

**Effort stimato**: 3-4h  
**Note**: BASSA priorità - pattern attuale funziona, refactoring non urgente

---

### 🟢 TD-A05: Compatibilità - Export `SensoreCassetta` Mancante

**Categoria**: Consistency  
**Priorità**: BASSA  
**File**: `sensore-cassetta.js`

#### Problema
`SensoreCassetta` è l'unica classe che **NON** esporta su `window`:
```javascript
// sensore-cassetta.js - manca export!
class SensoreCassetta { ... }
// ❌ Nessun window.SensoreCassetta

// Tutti gli altri file:
window.Chiosco = Chiosco;  // ✅
window.Display = Display;  // ✅
```

**Impatti**:
- Inconsistenza pattern (confusing)
- Impossibile accedere dalla console browser per debug
- Potenziale problema se servisse in altri contesti

#### Soluzione
Aggiungere export:
```javascript
// Fine file sensore-cassetta.js
window.SensoreCassetta = SensoreCassetta;
log.info('✅ SensoreCassetta caricato');
```

**Effort stimato**: 5 minuti  
**Note**: Triviale ma aumenta consistenza codebase

---

## Debiti Risolti (Riferimento)

Questi erano nel report precedente ma sono stati **già risolti**:

- ✅ **Gestione Valuta Float** → Risolto in Sprint 4 (Gettoniera usa centesimi)
- ✅ **Accoppiamento UI/Logica** → Risolto in Sprint 4 (Display centralizzato)
- ✅ **Switch Statement Monolitico** → Risolto in Sprint 4 (State Pattern)
- ✅ **Duplicazione Logica Stati** → Risolto in Sprint 5 (metodi onEntra rimossi)
- ✅ **Timer Lifecycle** → Risolto in Sprint 5 (esci() in StatoPortaAperta)

---

## Riepilogo e Raccomandazioni

### Priorità di Intervento

1. **🟢 TD-A05 (Export SensoreCassetta)** - 5 minuti, fallo subito
2. **🟡 TD-A03 (Magic Numbers Timeout)** - Quick win, alto ROI
3. **🟡 TD-A02 (Magic Strings Stati)** - Miglioramento manutenibilità
4. **🟢 TD-A04 (DI)** - Nice-to-have, non urgente

### Note
- **Non compromettono funzionalità**: Tutti i debiti sono di qualità/manutenibilità
- **Tutti i test E2E passano**: 57/57 ✅
- **ES6 Modules consapevolmente rifiutati**: Pattern `window.*` è la scelta corretta per questo progetto (vedi "Decisioni Architetturali")
