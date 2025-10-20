# Technical Debt

Questo documento traccia il debito tecnico identificato nel progetto, in particolare violazioni del **Principio 6 - Qualità del Codice** della Constitution.

**Data identificazione**: 2025-10-20
**Stato codebase**: Post Feature 003 US1
**Metrica**: 9 categorie di violazioni DRY con 50+ pattern duplicati

---

## Violazioni Alta Priorità

### TD-001: Pattern Animazione Click (9 occorrenze)
**File**: `js/app.js`
**Linee**: 64-65, 100-101, 129-130, 166-167, 193-194, 208-209, 223-224, 238-239, 253-254
**Impatto**: ALTO - Manutenzione difficile, rischio inconsistenze

**Pattern duplicato**:
```javascript
this.classList.add('clicked');
setTimeout(() => this.classList.remove('clicked'), 200);
```

**Refactoring proposto**: Creare `js/utils.js` con helper `aggiungiAnimazioneClick(elemento, nomeAzione)`

**Stima effort**: 2h
**Beneficio**: -18 linee, centralizzazione logica animazione

---

### TD-002: Pattern Verifica Autorizzazione (4 occorrenze)
**File**: `js/chiosco.js` (211-223, 641-650), `js/lettore-carte.js` (140-159), `js/lettore-qr.js` (39-58)
**Impatto**: ALTO - Logica critica duplicata, rischio bug

**Pattern duplicato**:
```javascript
setTimeout(() => {
  const autorizzato = Validatore.isCodiceAutorizzato(codice);
  if (autorizzato) {
    // display successo + transizione PORTA_APERTA
  } else {
    // display errore + transizione IDLE
  }
}, 500);
```

**Refactoring proposto**: Metodo `chiosco.verificaAccessoConCodice(codice, tipoIngresso)`

**Stima effort**: 3h
**Beneficio**: -40 linee, logica centralizzata, riduzione bug

---

### TD-003: Pattern getElementById + Event Handler (10+ occorrenze)
**File**: `js/app.js` (multiple sezioni)
**Impatto**: MEDIO-ALTO - Verbosità eccessiva, inconsistenze gestione errori

**Pattern duplicato**:
```javascript
const btn = document.getElementById('btn-id');
if (btn) {
  btn.addEventListener('click', function() {
    // logica handler
  });
}
```

**Refactoring proposto**: Helper `registraClickHandler(elementId, handler, animazione)`

**Stima effort**: 4h
**Beneficio**: -80 linee, gestione errori consistente

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

### Sprint 1 (Priorità ALTA)
- [ ] TD-001: Pattern animazione click
- [ ] TD-002: Pattern verifica autorizzazione
- [ ] TD-003: Pattern getElementById + handler

**Outcome**: Riduzione ~140 linee, miglioramento manutenibilità core features

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
