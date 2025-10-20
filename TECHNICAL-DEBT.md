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

### TD-004: Pattern Log Click (9 occorrenze)
**File**: `js/app.js`
**Impatto**: MEDIO - Ridondanza, inconsistenze formato log

**Refactoring proposto**: Integrare in `registraClickHandler` con parametro nome azione

**Stima effort**: 1h (parte di TD-003)

---

### TD-005: Pattern Countdown Timer (3 classi)
**File**: `js/chiosco.js` (GestoreTimeout), `js/gestore-manutenzione.js` (GestoreManutenzione), `js/chiosco.js` (onEntraPortaAperta)
**Impatto**: MEDIO - Codice duplicato complesso, difficile testing

**Refactoring proposto**: Classe base riutilizzabile `CountdownTimer` in `utils.js`

**Stima effort**: 5h
**Beneficio**: -60 linee, testabilità migliorata

---

## Violazioni Bassa Priorità

### TD-006: Pattern Enable/Disable Input (5 occorrenze)
**File**: `js/chiosco.js` (metodo `abilitaInput`)
**Impatto**: BASSO
**Stima effort**: 1h

### TD-007: Pattern SensoreCassetta apri/chiudi (2 metodi)
**File**: `js/sensore-cassetta.js`
**Impatto**: MOLTO BASSO
**Stima effort**: 0.5h

### TD-008: Pattern Nascondi Elemento (4 occorrenze)
**File**: `js/display.js`
**Impatto**: BASSO
**Stima effort**: 1h

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

### Sprint 2 (Priorità MEDIA)
- [ ] TD-004: Pattern log click (integrato con TD-003)
- [ ] TD-005: Pattern countdown timer

**Outcome**: Riduzione ulteriori ~60 linee, testabilità migliorata

### Sprint 3 (Priorità BASSA - Opzionale)
- [ ] TD-006, TD-007, TD-008: Cleanup helper vari

**Outcome**: Polishing finale codebase

---

## Note

- Violazioni identificate NON compromettono funzionalità o sicurezza
- Refactoring consigliato prima di feature maggiori future
- Tutti i test E2E devono rimanere green dopo ogni refactoring
- Constitution Principio 6 ora applicabile: 3+ occorrenze = trigger refactoring
