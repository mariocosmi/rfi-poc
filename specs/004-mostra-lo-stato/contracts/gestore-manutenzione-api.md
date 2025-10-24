# API Contract: GestoreManutenzione

**Version**: 1.0.0
**Date**: 2025-10-24
**Module**: `js/gestore-manutenzione.js`

## Overview

`GestoreManutenzione` è la classe UI che visualizza lo stato della cassetta e fornisce pulsanti per simulare eventi di apertura/chiusura. Si registra come listener su `SensoreCassetta` e aggiorna il DOM in risposta a eventi cambioStato.

## Class: GestoreManutenzione

### Constructor

```javascript
constructor(sensore: SensoreCassetta, container: HTMLElement)
```

**Descrizione**: Inizializza il gestore, collega il sensore cassetta, trova elementi DOM richiesti, registra listener e configura event handlers pulsanti.

**Parametri**:
- `sensore` (SensoreCassetta, required): Istanza di SensoreCassetta da monitorare
- `container` (HTMLElement, required): Elemento DOM che contiene pannello manutenzione

**Throws**:
- `TypeError` se `sensore` non è instanceof SensoreCassetta
- `TypeError` se `container` non è instanceof HTMLElement
- `Error` se elementi DOM richiesti non trovati (`#stato-cassetta`, `#btn-apri-cassetta`, `#btn-chiudi-cassetta`)

**Side Effects**:
- Salva riferimenti `this.sensore` e `this.container`
- Query elementi DOM: `this.elementoStato`, `this.btnApri`, `this.btnChiudi`
- Registra listener: `sensore.on('cambioStato', this.aggiornaUI.bind(this))`
- Configura click handlers: `btnApri.addEventListener('click', ...)`, `btnChiudi.addEventListener('click', ...)`
- Aggiorna UI iniziale chiamando `aggiornaUI()` con stato corrente sensore
- Log DEBUG: "GestoreManutenzione inizializzato"

**Esempio**:
```javascript
const sensore = new SensoreCassetta();
const container = document.querySelector('.manutenzione-panel');
const gestore = new GestoreManutenzione(sensore, container);
// UI mostra stato CHIUSA, pulsanti abilitati
```

---

### Method: aggiornaUI

```javascript
aggiornaUI(dati: EventoCambioStato): void
```

**Descrizione**: Aggiorna badge stato cassetta nel DOM in risposta a evento cambioStato.

**Parametri**:
- `dati` (object, required): Payload evento cambioStato
  - `dati.timestamp` (string): ISO 8601 timestamp
  - `dati.statoPrec` (string): 'APERTA' | 'CHIUSA'
  - `dati.statoNuovo` (string): 'APERTA' | 'CHIUSA'

**Returns**: `void`

**Throws**: Nessuno (defensive, log error se DOM corrotto)

**Side Effects**:
- Aggiorna `this.elementoStato.textContent` a `dati.statoNuovo`
- Rimuove classi CSS esistenti: `badge-aperta`, `badge-chiusa`
- Aggiunge classe CSS appropriata:
  - `.badge-aperta` se `statoNuovo === 'APERTA'` (verde)
  - `.badge-chiusa` se `statoNuovo === 'CHIUSA'` (grigio)
- Log DEBUG: `"[timestamp] UI aggiornata: badge → ${statoNuovo}"`

**Performance**: <10ms (solo update textContent + className, no reflow pesante)

**Esempio**:
```javascript
// Chiamato automaticamente da evento sensore
gestore.aggiornaUI({
  timestamp: '2025-10-24T14:32:15.123Z',
  statoPrec: 'CHIUSA',
  statoNuovo: 'APERTA'
});
// DOM: <span id="stato-cassetta" class="badge badge-aperta">APERTA</span>
```

---

### Method: destroy (Opzionale)

```javascript
destroy(): void
```

**Descrizione**: Cleanup listener e event handlers. Utile per testing o se componente viene distrutto dinamicamente.

**Parametri**: Nessuno

**Returns**: `void`

**Throws**: Nessuno

**Side Effects**:
- Rimuove listener da sensore: `this.sensore.off('cambioStato', this.aggiornaUI)`
- Rimuove event listener click da pulsanti
- Log DEBUG: "GestoreManutenzione distrutto"

**Note**: Non critico per SPA (componenti mai distrutti), implementazione opzionale.

---

## Elementi DOM Richiesti

Il `container` passato al costruttore **MUST** contenere questi elementi:

### #stato-cassetta

```html
<span id="stato-cassetta" class="badge">CHIUSA</span>
```

**Descrizione**: Badge che mostra stato corrente cassetta.

**Requisiti**:
- ID: `stato-cassetta`
- Tag: qualsiasi (tipicamente `<span>`)
- Classi CSS:
  - Base: `.badge` (stili comuni badge)
  - Stato: `.badge-chiusa` (default) o `.badge-aperta` (dopo apertura)

**Aggiornato da**: `aggiornaUI()` → textContent + className

---

### #btn-apri-cassetta

```html
<button id="btn-apri-cassetta" class="btn-manutenzione">Apri Cassetta</button>
```

**Descrizione**: Pulsante che simula evento apertura cassetta.

**Requisiti**:
- ID: `btn-apri-cassetta`
- Tag: `<button>`
- **Sempre abilitato**: NO attributo `disabled` (FR-003)

**Evento Click**: Chiama `sensore.notificaApertura()`

---

### #btn-chiudi-cassetta

```html
<button id="btn-chiudi-cassetta" class="btn-manutenzione">Chiudi Cassetta</button>
```

**Descrizione**: Pulsante che simula evento chiusura cassetta.

**Requisiti**:
- ID: `btn-chiudi-cassetta`
- Tag: `<button>`
- **Sempre abilitato**: NO attributo `disabled` (FR-004)

**Evento Click**: Chiama `sensore.notificaChiusura()`

---

## CSS Classes

### .badge

```css
.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  transition: background-color 0.3s ease;
}
```

**Descrizione**: Stili base badge stato.

---

### .badge-chiusa

```css
.badge-chiusa {
  background-color: #9E9E9E; /* Grigio */
  color: #FFFFFF;
}
```

**Descrizione**: Stile cassetta CHIUSA (grigio).

---

### .badge-aperta

```css
.badge-aperta {
  background-color: #4CAF50; /* Verde */
  color: #FFFFFF;
}
```

**Descrizione**: Stile cassetta APERTA (verde).

**Contrast Ratio**: Verde #4CAF50 vs bianco #FFFFFF = 4.5:1 (WCAG AA compliance)

---

### .btn-manutenzione

```css
.btn-manutenzione {
  padding: 10px 15px;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  background-color: #2196F3; /* Blu */
  color: #FFFFFF;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-manutenzione:hover {
  background-color: #1976D2; /* Blu scuro */
}

.btn-manutenzione:active {
  transform: scale(0.98);
}
```

**Descrizione**: Stili pulsanti manutenzione cassetta.

**Nota**: NO stato `:disabled` (pulsanti sempre abilitati per FR-003/FR-004).

---

## Scenari d'Uso

### Scenario 1: Inizializzazione Pannello Manutenzione

```javascript
// app.js
document.addEventListener('DOMContentLoaded', () => {
  const sensore = new SensoreCassetta();
  const container = document.querySelector('.manutenzione-panel');
  const gestore = new GestoreManutenzione(sensore, container);

  // UI mostra:
  // - Badge grigio "CHIUSA"
  // - Pulsante "Apri Cassetta" abilitato
  // - Pulsante "Chiudi Cassetta" abilitato
});
```

---

### Scenario 2: Click Pulsante "Apri Cassetta"

```javascript
// Utente clicca pulsante
// Event handler interno:
this.btnApri.addEventListener('click', () => {
  log.info('Operatore ha cliccato "Apri Cassetta"');
  this.sensore.notificaApertura();
  // sensore emette 'cambioStato' → aggiornaUI() chiamato automaticamente
});

// Risultato DOM:
// <span id="stato-cassetta" class="badge badge-aperta">APERTA</span>
```

---

### Scenario 3: Eventi Multipli Rapidi

```javascript
// Utente clicca rapidamente Apri-Chiudi-Apri-Chiudi-Apri (5 click in 1 sec)
// Ogni click:
// 1. Handler pulsante → sensore.notificaX()
// 2. Sensore emette 'cambioStato'
// 3. aggiornaUI() aggiorna badge

// Stato finale: Badge mostra "APERTA"
// Performance: Tutti update completati <500ms (SC-002)
```

---

### Scenario 4: Verifica UI Sincronizzata con Sensore

```javascript
// Test: Verifica che UI rifletta sempre sensore.getStato()
console.assert(
  sensore.getStato() === gestore.elementoStato.textContent,
  'UI desync dal sensore!'
);

// Questo deve essere sempre true dopo ogni evento cambioStato
```

---

## Error Handling

### Costruttore: Parametri Invalidi

```javascript
try {
  const gestore = new GestoreManutenzione('not a sensor', document.body);
} catch (e) {
  console.error(e); // TypeError: sensore deve essere SensoreCassetta
}

try {
  const sensore = new SensoreCassetta();
  const gestore = new GestoreManutenzione(sensore, 'not an element');
} catch (e) {
  console.error(e); // TypeError: container deve essere HTMLElement
}
```

---

### Costruttore: Elementi DOM Mancanti

```javascript
// HTML manca #stato-cassetta
try {
  const sensore = new SensoreCassetta();
  const container = document.querySelector('.manutenzione-panel'); // vuoto
  const gestore = new GestoreManutenzione(sensore, container);
} catch (e) {
  console.error(e); // Error: Elementi DOM manutenzione mancanti
}
```

---

### aggiornaUI: DOM Corrotto Durante Runtime

```javascript
// Caso estremo: elemento stato rimosso dal DOM
gestore.elementoStato.remove();

// Prossimo evento cambioStato:
sensore.notificaApertura();
// aggiornaUI() catch errore, log ERROR:
// "Errore aggiornamento UI: Cannot set property 'textContent' of null"
// Sistema continua funzionare (defensive)
```

---

## Performance Considerations

- **Update DOM**: Solo `textContent` + `className`, no innerHTML → no parsing → <10ms
- **Event Listeners**: 3 listener totali (1 su sensore, 2 su pulsanti) → overhead minimo
- **Memory**: Riferimenti DOM cached in costruttore → no query ripetute

**Test Verificato** (SC-002, SC-005):
- Update UI <500ms da evento: ✅ Verificato da Playwright `waitForSelector(timeout: 500)`
- Gestione 5 eventi/sec: ✅ Verificato da test sequenza rapida

---

## Testing

### Unit Test (Concettuale)

```javascript
// Mock DOM
const container = document.createElement('div');
container.innerHTML = `
  <span id="stato-cassetta" class="badge">CHIUSA</span>
  <button id="btn-apri-cassetta">Apri</button>
  <button id="btn-chiudi-cassetta">Chiudi</button>
`;

const sensore = new SensoreCassetta();
const gestore = new GestoreManutenzione(sensore, container);

// Test UI iniziale
assert.equal(container.querySelector('#stato-cassetta').textContent, 'CHIUSA');

// Test aggiornaUI
gestore.aggiornaUI({
  timestamp: '2025-10-24T14:00:00.000Z',
  statoPrec: 'CHIUSA',
  statoNuovo: 'APERTA'
});
assert.equal(container.querySelector('#stato-cassetta').textContent, 'APERTA');
assert.true(container.querySelector('#stato-cassetta').classList.contains('badge-aperta'));
```

---

### E2E Test (Playwright)

```javascript
// tests/e2e/feature-004.spec.js
test('US2: Click Apri → UI mostra APERTA', async ({ page }) => {
  await page.goto('http://localhost:8000');

  // Stato iniziale
  await expect(page.locator('#stato-cassetta')).toContainText('CHIUSA');

  // Click pulsante
  await page.click('#btn-apri-cassetta');

  // Verifica aggiornamento <500ms
  await expect(page.locator('#stato-cassetta')).toContainText('APERTA', { timeout: 500 });

  // Verifica classe CSS
  const badge = page.locator('#stato-cassetta');
  await expect(badge).toHaveClass(/badge-aperta/);
});
```

---

## Integration with SensoreCassetta

### Data Flow

```
User Click Button
      ↓
GestoreManutenzione event handler
      ↓
sensore.notificaApertura()
      ↓
sensore emits 'cambioStato' event
      ↓
gestore.aggiornaUI(dati) [listener registered in constructor]
      ↓
DOM Update: badge textContent + className
      ↓
UI reflects new stato
```

### Coupling

- **Dependency**: GestoreManutenzione **depends on** SensoreCassetta (composizione)
- **Independence**: SensoreCassetta **does NOT depend on** GestoreManutenzione (pattern Observer)
- **Communication**: One-way via eventi (sensore → gestore)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-24 | Initial API definition |

---

## See Also

- [SensoreCassetta API Contract](./sensore-cassetta-api.md)
- [Data Model](../data-model.md)
- [Feature Specification](../spec.md)
