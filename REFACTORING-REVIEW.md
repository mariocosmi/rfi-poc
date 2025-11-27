# Code Review - Post Sprint 4

**Data**: 2025-11-27
**Revisione**: Refactoring architetturali Sprint 4 (TD-010, TD-011, TD-012)
**Stato**: Completati con successo - Test E2E 57/57 passati

---

## Punti di Forza 🎯

### 1. State Pattern (TD-012)
- ✅ Eliminato switch monolitico da `chiosco.js`
- ✅ Ogni stato in una classe separata (`js/stati.js`)
- ✅ Ottima estendibilità per nuovi stati
- ✅ Open/Closed Principle rispettato

### 2. Separazione UI/Logica (TD-011)
- ✅ Display centralizza tutta la manipolazione DOM
- ✅ Chiosco completamente agnostico rispetto al DOM
- ✅ Metodi `bind*()` in Display per event binding
- ✅ Pattern eccellente per testabilità

### 3. Precisione Valuta (TD-010)
- ✅ Interi (centesimi) internamente, Euro nell'interfaccia pubblica
- ✅ Elimina completamente errori floating point
- ✅ API pubblica invariata (backward compatibility)

### 4. Inizializzazione Pulita
- ✅ `app.js` molto leggibile: `createAppComponents()` + `registerEventListeners()`
- ✅ Buona separazione delle responsabilità
- ✅ Dipendenze esplicite e chiare

### 5. Logging Consistente
- ✅ Emoji uniforme e significativa (🏠 🔄 💰 ✅ ❌)
- ✅ Livelli di gravità appropriati (info, warn, error)
- ✅ Messaggi descrittivi e actionable

---

## Suggerimenti di Miglioramento 💡

### 1. Duplicazione Logica: Stati vs Metodi `onEntra*()`

**Priorità**: 🔴 ALTA
**File**: `js/chiosco.js` (linee 271-374)
**Effort**: ~1h

**Problema**:
I metodi `onEntraManutenzioneAuthPending()`, `onEntraManutenzioneAttesaChiusura()`, etc. in `chiosco.js` duplicano la logica già presente in `js/stati.js`. Doppia fonte di verità per comportamento degli stati.

**Soluzione**:
Rimuovi completamente i metodi `onEntra*()` da `chiosco.js`:

```javascript
// ❌ Da rimuovere da chiosco.js (linee 271-374)
onEntraManutenzioneAuthPending() { ... }
onEntraManutenzioneAttesaChiusura() { ... }
onEntraManutenzioneSceltaAzzeramento() { ... }
onEntraFuoriServizio() { ... }
```

Il State Pattern in `stati.js` è già l'unica fonte di verità - non serve duplicazione.

**Benefici**:
- Elimina ~100 linee duplicate
- Single source of truth per logica stati
- Riduce rischio di inconsistenze future

---

### 2. Gestione Timer: Salvare Stato nei Componenti

**Priorità**: 🟡 MEDIA
**File**: `js/stati.js` (linea 158), `js/chiosco.js`
**Effort**: ~30min

**Problema**:
In `StatoPortaAperta.entra()`, il timer viene salvato direttamente su proprietà del componente:

```javascript
// stati.js:158 - Viola incapsulamento
chiosco.porta.timerChiusuraAutomatica = timerChiusuraAuto;
```

Lo stato modifica direttamente proprietà interne di altri componenti.

**Soluzione A** (Preferita): Gestisci timer lifecycle nello stato stesso:

```javascript
class StatoPortaAperta extends Stato {
    entra(chiosco, dati) {
        // ... logica esistente ...

        this.timerChiusuraAuto = setTimeout(() => {
            if (chiosco.porta) {
                chiosco.porta.chiudi();
            }
            setTimeout(() => {
                chiosco.transizione('IDLE');
            }, 1500);
        }, 15000);
    }

    esci(chiosco) {
        // Cancella timer se ancora attivo
        if (this.timerChiusuraAuto) {
            clearTimeout(this.timerChiusuraAuto);
            this.timerChiusuraAuto = null;
        }
    }
}
```

**Soluzione B**: Aggiungi metodo `porta.programmaChiusuraAutomatica(callback, ritardo)` per incapsulare logica.

**Benefici**:
- Migliora incapsulamento
- Lifecycle timer più esplicito
- Previene timer "orfani" se transizione interrotta
- Più testabile

---

### 3. Logic Condizionale Rimanente: `verificaCarta()`

**Priorità**: 🟡 MEDIA
**File**: `js/chiosco.js` (linee 409-442)
**Effort**: ~1h

**Problema**:
Il metodo `verificaCarta()` ha ancora logica condizionale basata sullo stato corrente:

```javascript
// chiosco.js:409-442 - Anti-pattern State Pattern
verificaCarta(codice) {
    if (this.stato === 'FUORI_SERVIZIO') {
        // ... logica reset ...
    } else if (this.stato === 'MANUTENZIONE_AUTH_PENDING') {
        // ... logica auth ...
    } else {
        // ... logica normale ...
    }
}
```

Questo è l'opposto del pattern State - il context non dovrebbe fare switch sullo stato.

**Soluzione**: Sposta logica negli stati con template method:

```javascript
// Aggiungi a classe base Stato
class Stato {
    // ...
    gestisciInputCarta(chiosco, codice) {
        // Default: usa helper DRY per verifica normale
        chiosco.verificaAccessoConCodice(codice, 'Carta');
    }
}

// Override solo negli stati che hanno comportamento diverso
class StatoFuoriServizio extends Stato {
    gestisciInputCarta(chiosco, codice) {
        chiosco.resetDaFuoriServizio(codice);
    }
}

class StatoManutenzioneAuthPending extends Stato {
    gestisciInputCarta(chiosco, codice) {
        if (Validatore.isCodiceAutorizzato(codice)) {
            chiosco.gestoreManutenzione.fermaCountdown();
            if (chiosco.operazioneCorrente) {
                chiosco.operazioneCorrente.logEvento('AUTH_SUCCESS', { codice });
            }
            chiosco.transizione('MANUTENZIONE_ATTESA_CHIUSURA');
        } else {
            // ... logica failure ...
        }
    }
}

// Semplifica chiosco.js
verificaCarta(codice) {
    this.statoCorrente.gestisciInputCarta(this, codice);
}
```

**Benefici**:
- Completa migrazione a State Pattern
- Elimina conditional logic dal context
- Ogni stato incapsula completamente il proprio comportamento
- Più facile aggiungere nuovi stati in futuro

---

### 4. Metodo `getNome()` Ridondante

**Priorità**: ⚪ BASSA
**File**: `js/stati.js` (tutte le classi stato)
**Effort**: ~15min

**Problema**:
Ogni stato implementa `getNome()` che ritorna una stringa costante:

```javascript
class StatoIdle extends Stato {
    getNome() { return 'IDLE'; }  // Ridondante - nome implicito
}
```

Il nome è derivabile automaticamente dal nome della classe.

**Soluzione** (opzionale): Auto-deriva dalla classe nella classe base:

```javascript
class Stato {
    getNome() {
        // "StatoIdle" -> "IDLE", "StatoPagamentoMonete" -> "PAGAMENTO_MONETE"
        const nome = this.constructor.name.replace('Stato', '');
        // Converti camelCase in SCREAMING_SNAKE_CASE
        return nome.replace(/([A-Z])/g, '_$1').toUpperCase().substring(1);
    }
    // ...
}
```

Poi rimuovi tutte le implementazioni di `getNome()` nelle sottoclassi.

**Benefici**:
- Micro-refactoring DRY
- Una classe in meno da aggiornare per nuovi stati
- Riduce boilerplate

**Nota**: Questo è opzionale e cosmetico. Implementa solo se la ripetizione ti disturba.

---

### 5. Testabilità: Dependency Injection per Timer

**Priorità**: ⚪ OPZIONALE (solo se pianifichi unit testing)
**File**: `js/chiosco.js`, `js/stati.js`
**Effort**: ~2h

**Problema**:
Gli stati usano `setTimeout()` e `clearTimeout()` direttamente, rendendo difficile il testing unitario senza mocks complessi o "fake timers".

**Soluzione**: Inietta timer factory come dipendenza:

```javascript
// Esempio pattern (non implementare ora se non serve)
class Chiosco {
    constructor(timerFactory = window) {
        this.timerFactory = timerFactory;  // Default: { setTimeout, clearTimeout }
        // ...
    }
}

// Negli stati
class StatoPortaAperta extends Stato {
    entra(chiosco, dati) {
        this.timerChiusuraAuto = chiosco.timerFactory.setTimeout(() => {
            // ...
        }, 15000);
    }

    esci(chiosco) {
        chiosco.timerFactory.clearTimeout(this.timerChiusuraAuto);
    }
}

// In test, inietta fake timer controllabili
const fakeTimer = {
    setTimeout: (fn, delay) => { /* ... */ },
    clearTimeout: (id) => { /* ... */ }
};
const chiosco = new Chiosco(fakeTimer);
```

**Benefici**:
- Unit test deterministici (no race conditions)
- Test più veloci (no attese reali)
- Maggiore controllo su timing

**Nota**: Implementa solo se pianifichi suite di unit test. Per testing E2E attuale (Playwright) non è necessario.

---

### 6. Coerenza Event Binding: Missing Handler

**Priorità**: ⚪ BASSA
**File**: `js/display.js` (linea 417-421)
**Effort**: ~10min

**Problema**:
Il metodo `bindChiudiCassetta()` è definito ma mai chiamato in `app.js`:

```javascript
// display.js:417 - Definito ma non usato
bindChiudiCassetta(handler) {
    registraClickHandler('btn-chiudi-cassetta', handler, 'Chiudi Cassetta');
}
```

**Soluzione A**: Se il binding è gestito da `GestoreUICassetta`, rimuovi il metodo da Display.

**Soluzione B**: Se vuoi centralizzare tutti i binding in `app.js`, aggiungi:

```javascript
// app.js registerEventListeners()
display.bindChiudiCassetta(() => {
    chiosco.sensoreCassetta.chiudi();
});
```

**Benefici**:
- Elimina codice morto (soluzione A)
- Oppure completa centralizzazione binding (soluzione B)

---

## Riepilogo Priorità

| Priorità | Refactoring | File | Effort | Beneficio | Rischio |
|----------|-------------|------|--------|-----------|---------|
| 🔴 **ALTA** | Rimuovi metodi `onEntra*()` duplicati | `chiosco.js` | 1h | Elimina ~100 linee duplicate | Basso |
| 🟡 **MEDIA** | Gestione timer in `esci()` degli stati | `stati.js` | 30min | Migliora encapsulation | Basso |
| 🟡 **MEDIA** | Sposta `verificaCarta()` logic negli stati | `chiosco.js`, `stati.js` | 1h | Completa State Pattern | Medio |
| ⚪ **BASSA** | Rimuovi `getNome()` ridondante | `stati.js` | 15min | DRY micro-refactoring | Minimo |
| ⚪ **BASSA** | Handler `bindChiudiCassetta()` non usato | `display.js`, `app.js` | 10min | Cleanup codice morto | Minimo |
| ⚪ **OPZ** | Dependency injection per timer | `chiosco.js`, `stati.js` | 2h | Testabilità unitaria | Medio |

**Effort totale**: ~5h (escluso opzionale)

---

## Piano Consigliato - Sprint 5

### Fase 1: Quick Wins (1h)
1. ✅ Rimuovi metodi `onEntra*()` da `chiosco.js` (TD-013)
2. ✅ Gestisci timer lifecycle in `StatoPortaAperta.esci()` (TD-014)

### Fase 2: State Pattern Completamento (1h)
3. ✅ Sposta `verificaCarta()` conditional logic negli stati (TD-015)

### Fase 3: Polishing (30min - opzionale)
4. ✅ Rimuovi `getNome()` ridondante se desiderato
5. ✅ Cleanup `bindChiudiCassetta()` handler

**Outcome atteso**:
- Eliminazione ulteriori ~100 linee duplicate
- State Pattern completato al 100%
- Riduzione complessità ciclomatica in `Chiosco`
- Preparazione per feature future più pulita

---

## Note Finali

### Cosa NON Cambiare ✅

Questi aspetti sono eccellenti e NON necessitano modifiche:

1. **Logging con emoji** - Consistente e leggibile
2. **Struttura `app.js`** - Chiara separazione `create` + `register`
3. **Metodi `bind*()` in Display** - Pattern ottimo per decoupling
4. **Gestione centesimi in Gettoniera** - Risolve problema float perfettamente
5. **Helper in `utils.js`** - DRY ben applicato
6. **CountdownTimer riutilizzabile** - Ottima astrazione

### Compatibilità Constitution

Tutti i suggerimenti rispettano i 6 principi della Constitution:

- ✅ **Principio 1 (Italiano)**: Nomi variabili e commenti già in italiano
- ✅ **Principio 2 (Static-First)**: Nessun build step richiesto
- ✅ **Principio 3 (Vanilla JS)**: Nessuna dipendenza aggiunta
- ✅ **Principio 4 (Build-Free)**: File linkati direttamente
- ✅ **Principio 5 (Osservabilità)**: Logging mantenuto e migliorato
- ✅ **Principio 6 (Qualità)**: Riduzione duplicazioni, rispetto soglia 3+

### Metriche Post-Refactoring (Stimate)

Se implementati tutti i suggerimenti ALTA+MEDIA:

| Metrica | Pre-Sprint 5 | Post-Sprint 5 | Delta |
|---------|--------------|---------------|-------|
| Linee `chiosco.js` | ~515 | ~420 | -95 (-18%) |
| Linee `stati.js` | ~274 | ~320 | +46 (logica spostata) |
| Duplicazioni HIGH | 0 | 0 | ✅ |
| State Pattern coverage | 85% | 100% | +15% |
| Cyclomatic complexity `Chiosco` | 12 | 6 | -50% |

---

## Conclusione 🎉

Il codice è in **ottima forma** dopo lo Sprint 4. I refactoring architetturali hanno raggiunto l'obiettivo principale:

- ✅ Precisione valuta risolta
- ✅ UI/Logica disaccoppiate
- ✅ State Pattern implementato

I suggerimenti proposti sono **polishing finale** per:
1. Completare la migrazione a State Pattern (rimuovere conditional logic residua)
2. Migliorare encapsulation (timer lifecycle)
3. Eliminare duplicazione residua (metodi `onEntra*()`)

**Raccomandazione**: Implementa almeno i suggerimenti ALTA priorità prima di iniziare Feature 005, per massimizzare la qualità del codebase.

---

**Review completata da**: Claude Code
**Data**: 2025-11-27
**Prossimo step**: Valutare implementazione Sprint 5 oppure procedere con nuove feature
