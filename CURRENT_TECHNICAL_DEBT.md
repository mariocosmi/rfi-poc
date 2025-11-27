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

### ⚪ Dependency Injection Manuale - Pattern Corretto

**Decisione**: Il wiring manuale delle dipendenze in `createAppComponents()` è il pattern appropriato per questo progetto.

```javascript
// app.js - Pattern attuale (mantenuto):
function createAppComponents() {
  const chiosco = new Chiosco();
  chiosco.display = display;
  chiosco.porta = porta;
  // ... wiring esplicito
}
```

**Motivazioni**:
1. ✅ **Chiaro e leggibile** - 25 righe per 9 componenti è ragionevole
2. ✅ **Manutenibile** - Aggiungere un componente = 3 righe
3. ✅ **Test E2E funzionano** - 57/57 senza mock complessi
4. ✅ **YAGNI** - DI container sarebbe over-engineering

**Alternativa rifiutata (DI Container/Factory)**:
- ❌ Boilerplate eccessivo per progetto di questa dimensione
- ❌ Beneficio marginale vs. effort (3-4h)
- ❌ Aggiunge complessità senza risolvere problemi reali

**Quando riconsiderare**: Solo se componenti superano 15-20 e grafo dipendenze diventa non gestibile.

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

## Debiti Risolti (Riferimento)

Questi erano nel report precedente ma sono stati **già risolti**:

- ✅ **Gestione Valuta Float** → Risolto in Sprint 4 (Gettoniera usa centesimi)
- ✅ **Accoppiamento UI/Logica** → Risolto in Sprint 4 (Display centralizzato)
- ✅ **Switch Statement Monolitico** → Risolto in Sprint 4 (State Pattern)
- ✅ **Duplicazione Logica Stati** → Risolto in Sprint 5 (metodi onEntra rimossi)
- ✅ **Timer Lifecycle** → Risolto in Sprint 5 (esci() in StatoPortaAperta)
- ✅ **Export SensoreCassetta/GestoreUICassetta** → Risolto (2025-11-27) - Aggiunti export globali per coerenza

---

## Riepilogo e Raccomandazioni

### Priorità di Intervento

1. ** TD-A03 (Magic Numbers Timeout)** - Quick win, alto ROI
2. **🟡 TD-A02 (Magic Strings Stati)** - Miglioramento manutenibilità

### Note
- **Non compromettono funzionalità**: Tutti i debiti sono di qualità/manutenibilità
- **Tutti i test E2E passano**: 57/57 ✅
- **ES6 Modules consapevolmente rifiutati**: Pattern `window.*` è la scelta corretta per questo progetto (vedi "Decisioni Architetturali")
