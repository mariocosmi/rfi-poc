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

---

## Debiti Risolti (Riferimento)

Questi erano nel report precedente ma sono stati **già risolti**:

- ✅ **Gestione Valuta Float** → Risolto in Sprint 4 (Gettoniera usa centesimi)
- ✅ **Accoppiamento UI/Logica** → Risolto in Sprint 4 (Display centralizzato)
- ✅ **Switch Statement Monolitico** → Risolto in Sprint 4 (State Pattern)
- ✅ **Duplicazione Logica Stati** → Risolto in Sprint 5 (metodi onEntra rimossi)
- ✅ **Timer Lifecycle** → Risolto in Sprint 5 (esci() in StatoPortaAperta)
- ✅ **Export SensoreCassetta/GestoreUICassetta** → Risolto (2025-11-27) - Aggiunti export globali per coerenza
- ✅ **Magic Numbers Timeout** → Risolto (2025-11-27) - Centralizzati in `constants.js` (TD-A03)
- ✅ **Magic Strings Stati** → Risolto (2025-11-27) - Sostituite con `STATI.*` (TD-A02)

---

## Riepilogo e Raccomandazioni

### Priorità di Intervento

*Nessun debito tecnico attivo ad alta/media priorità rimasto!* 🎉

### Note
- **Non compromettono funzionalità**: Tutti i debiti sono di qualità/manutenibilità
- **Tutti i test E2E passano**: 57/57 ✅
- **ES6 Modules consapevolmente rifiutati**: Pattern `window.*` è la scelta corretta per questo progetto (vedi "Decisioni Architetturali")
