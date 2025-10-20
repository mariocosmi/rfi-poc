# Technical Debt

Questo documento traccia il debito tecnico identificato nel progetto, in particolare violazioni del **Principio 6 - Qualità del Codice** della Constitution.

**Data identificazione**: 2025-10-20
**Stato codebase**: Post Feature 003 US1
**Metrica iniziale**: 9 categorie di violazioni DRY con 50+ pattern duplicati

## Sprint Completati

### ✅ Sprint 1 (2025-10-20) - Priorità ALTA
**Commit**: `545bf94`
**Effort**: 9h pianificate, completato in 1 sessione
**Violazioni risolte**: TD-001, TD-002, TD-003

**Risultati**:
- ✅ Creato `js/utils.js` con 5 helper riutilizzabili (102 linee)
- ✅ Refactored `js/app.js`: 281→218 linee (-22%)
- ✅ Refactored `js/chiosco.js`: +metodo verificaAccessoConCodice
- ✅ Refactored `js/lettore-carte.js`: 164→148 linee (-10%)
- ✅ Eliminati 38 pattern duplicati
- ✅ Riduzione codebase: -65 linee (-2.6%)
- ✅ Test E2E: 6/6 passati, 0 regressioni

**Benefici**:
- Manutenibilità migliorata (modifiche centralizzate)
- Codice più dichiarativo e leggibile
- Gestione errori DOM consistente
- Helper riutilizzabili per future feature

### ✅ Sprint 2 (2025-10-20) - Priorità MEDIA
**Commit**: `d434a49`
**Effort**: 6h pianificate, completato in 1 sessione
**Violazioni risolte**: TD-004 (già risolto), TD-005

**Risultati**:
- ✅ Creata classe `CountdownTimer` in `js/utils.js` (+120 linee)
- ✅ Refactored `GestoreTimeout` in `js/chiosco.js`: 63→44 linee (-30%)
- ✅ Refactored `GestoreManutenzione` in `js/gestore-manutenzione.js`: 94→67 linee (-29%)
- ✅ Eliminati 2 pattern countdown duplicati
- ✅ Investimento netto: +74 linee (helper riutilizzabile)
- ✅ Test E2E: 6/6 passati, 0 regressioni

**Benefici**:
- Gestione countdown centralizzata (timer + intervalli)
- Prevenzione future duplicazioni (soglia 3+ rispettata)
- Testabilità migliorata (logica isolata)
- API consistente per tutti i countdown

### ✅ Sprint 3 (2025-10-20) - Priorità BASSA
**Commit**: `[in corso]`
**Effort**: 2.5h pianificate, completato in 1 sessione
**Violazioni risolte**: TD-008
**Violazioni valutate (no refactoring)**: TD-006, TD-007

**Risultati**:
- ✅ TD-006: Valutato `abilitaInput()` - già centralizzato in singolo metodo, nessun refactoring
- ✅ TD-007: Valutato `apri()`/`chiudi()` SensoreCassetta - solo 2 occorrenze (sotto soglia 3), pattern accettabile
- ✅ TD-008: Refactored `js/display.js` - 6 pattern show/hide usano helper `nascondiElemento()`/`mostraElemento()`
- ✅ Riduzione codebase: -12 linee (rimozione guard clause duplicati)
- ✅ Test E2E: 6/6 passati, 0 regressioni

**Benefici**:
- Consistenza migliorata: display.js usa helper utils.js uniformemente
- Manutenibilità: logica show/hide centralizzata
- Polishing finale codebase bassa priorità completato

---

## Violazioni Alta Priorità

### ✅ TD-001: Pattern Animazione Click (9 occorrenze) - COMPLETATO
**Status**: ✅ Risolto in Sprint 1 (commit `545bf94`)
**File**: `js/app.js`
**Soluzione**: Creato helper `aggiungiAnimazioneClick()` in `js/utils.js`
**Risultato**: -18 linee duplicate, logica centralizzata

---

### ✅ TD-002: Pattern Verifica Autorizzazione (4 occorrenze) - COMPLETATO
**Status**: ✅ Risolto in Sprint 1 (commit `545bf94`)
**File**: `js/chiosco.js`, `js/lettore-carte.js`
**Soluzione**: Metodo `chiosco.verificaAccessoConCodice(codice, tipoIngresso)`
**Risultato**: -37 linee duplicate, logica critica centralizzata

---

### ✅ TD-003: Pattern getElementById + Event Handler (10+ occorrenze) - COMPLETATO
**Status**: ✅ Risolto in Sprint 1 (commit `545bf94`)
**File**: `js/app.js`
**Soluzione**: Helper `registraClickHandler()` in `js/utils.js`
**Risultato**: -80 linee boilerplate, gestione errori consistente

---

## Violazioni Media Priorità

### ✅ TD-004: Pattern Log Click (9 occorrenze) - COMPLETATO
**Status**: ✅ Risolto in Sprint 1 (commit `545bf94`)
**File**: `js/app.js`
**Soluzione**: Parametro `nomeAzione` in `registraClickHandler()` centralizza logging
**Risultato**: Pattern duplicato eliminato come parte di TD-003

---

### ✅ TD-005: Pattern Countdown Timer (3 classi) - COMPLETATO
**Status**: ✅ Risolto in Sprint 2 (commit `d434a49`)
**File**: `js/chiosco.js`, `js/gestore-manutenzione.js`
**Soluzione**: Classe `CountdownTimer` riutilizzabile in `js/utils.js`
**Risultato**: -46 linee duplicate + 120 linee helper = investimento +74 linee

**Note**: Timeout porta (1 occorrenza) valutato e considerato accettabile (sotto soglia 3, pattern diverso)

---

## Violazioni Bassa Priorità

### ✅ TD-006: Pattern Enable/Disable Input (5 occorrenze) - VALUTATO
**Status**: ✅ Valutato in Sprint 3 - Nessun refactoring necessario
**File**: `js/chiosco.js` (metodo `abilitaInput`)
**Soluzione**: Pattern già centralizzato in singolo metodo con logica complessa
**Risultato**: Pattern accettabile - non costituisce violazione DRY (non duplicato across files)

### ✅ TD-007: Pattern SensoreCassetta apri/chiudi (2 metodi) - VALUTATO
**Status**: ✅ Valutato in Sprint 3 - Nessun refactoring necessario
**File**: `js/sensore-cassetta.js`
**Soluzione**: Solo 2 occorrenze (sotto soglia 3 del Principio 6)
**Risultato**: Pattern simmetrico leggibile - refactoring ridurrebbe chiarezza senza beneficio

### ✅ TD-008: Pattern Nascondi Elemento (6 occorrenze) - COMPLETATO
**Status**: ✅ Risolto in Sprint 3
**File**: `js/display.js`
**Soluzione**: Refactored per usare helper `nascondiElemento()`/`mostraElemento()` da `utils.js`
**Risultato**: -12 linee, consistenza migliorata con helper pattern esistente

### TD-009: Pattern Log Formattazione Importo (8 occorrenze)
**File**: `js/gettoniera.js`
**Impatto**: MOLTO BASSO - Uso corretto di metodo statico helper
**Nota**: Accettabile, non richiede refactoring

---

## Metriche Complessive

| Metrica | Valore |
|---------|--------|
| File analizzati | 11 |
| Linee totali codebase | ~2500 |
| Violazioni trovate | 9 categorie |
| Occorrenze duplicazioni | 50+ |
| Linee risparmio stimato | 200-250 (~10%) |
| Effort totale refactoring | ~17h |
| Priorità ALTA effort | ~9h |

---

## Piano di Rimborso

### ✅ Sprint 1 (Priorità ALTA) - COMPLETATO
- [x] TD-001: Pattern animazione click
- [x] TD-002: Pattern verifica autorizzazione
- [x] TD-003: Pattern getElementById + handler

**Outcome Pianificato**: Riduzione ~140 linee, miglioramento manutenibilità core features
**Outcome Effettivo**: Riduzione 135 linee, manutenibilità migliorata, 0 regressioni

### ✅ Sprint 2 (Priorità MEDIA) - COMPLETATO
- [x] TD-004: Pattern log click (già risolto in Sprint 1)
- [x] TD-005: Pattern countdown timer

**Outcome Pianificato**: Riduzione ulteriori ~60 linee, testabilità migliorata
**Outcome Effettivo**: Investimento +74 linee (CountdownTimer riutilizzabile), -46 linee duplicate, testabilità migliorata, 0 regressioni

### ✅ Sprint 3 (Priorità BASSA - Opzionale) - COMPLETATO
- [x] TD-006: Valutato abilitaInput (già ottimizzato)
- [x] TD-007: Valutato apri/chiudi SensoreCassetta (sotto soglia)
- [x] TD-008: Refactored display.js show/hide patterns

**Outcome Pianificato**: Polishing finale codebase
**Outcome Effettivo**: Cleanup completato, -12 linee, consistenza utils.js migliorata, 0 regressioni

---

## Note

- Violazioni identificate NON compromettono funzionalità o sicurezza
- Refactoring consigliato prima di feature maggiori future
- Tutti i test E2E devono rimanere green dopo ogni refactoring
- Constitution Principio 6 ora applicabile: 3+ occorrenze = trigger refactoring
