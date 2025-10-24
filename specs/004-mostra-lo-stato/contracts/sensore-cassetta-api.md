# API Contract: SensoreCassetta

**Version**: 1.0.0
**Date**: 2025-10-24
**Module**: `js/sensore-cassetta.js`

## Overview

`SensoreCassetta` è la classe che mantiene lo stato della cassetta (APERTA/CHIUSA) e notifica i listener quando lo stato cambia. Implementa pattern Observer per permettere disaccoppiamento tra logica stato e UI.

## Class: SensoreCassetta

### Constructor

```javascript
constructor()
```

**Descrizione**: Inizializza il sensore con stato default CHIUSA e Map listener vuota.

**Parametri**: Nessuno

**Throws**: Nessuno

**Side Effects**:
- Inizializza `this.stato` a `'CHIUSA'`
- Inizializza `this.listeners` a `new Map()`
- Log DEBUG: "SensoreCassetta inizializzato (stato: CHIUSA)"

**Esempio**:
```javascript
const sensore = new SensoreCassetta();
console.log(sensore.getStato()); // 'CHIUSA'
```

---

### Method: on

```javascript
on(evento: string, callback: Function): void
```

**Descrizione**: Registra un listener per l'evento specificato.

**Parametri**:
- `evento` (string, required): Nome evento da ascoltare (es. `'cambioStato'`)
- `callback` (Function, required): Funzione chiamata quando evento emesso
  - Signature: `(dati: object) => void`
  - `dati` contiene payload specifico dell'evento

**Returns**: `void`

**Throws**:
- `TypeError` se `callback` non è una funzione

**Side Effects**:
- Aggiunge `callback` all'array di listener per `evento` nella Map
- Se `evento` non esiste nella Map, crea nuovo array con `callback`

**Esempio**:
```javascript
sensore.on('cambioStato', (dati) => {
  console.log(`Stato cambiato da ${dati.statoPrec} a ${dati.statoNuovo}`);
});
```

---

### Method: off (Opzionale)

```javascript
off(evento: string, callback: Function): void
```

**Descrizione**: Rimuove un listener precedentemente registrato.

**Parametri**:
- `evento` (string, required): Nome evento
- `callback` (Function, required): Stessa funzione passata a `on()`

**Returns**: `void`

**Throws**: Nessuno (silently ignore se listener non trovato)

**Side Effects**:
- Rimuove `callback` dall'array listener per `evento`
- Se array diventa vuoto, rimuove `evento` dalla Map (cleanup)

**Note**: Non critico per SPA, implementazione opzionale.

---

### Method: notificaApertura

```javascript
notificaApertura(): void
```

**Descrizione**: Simula evento di apertura fisica della cassetta. Aggiorna stato interno a APERTA e notifica listener.

**Parametri**: Nessuno

**Returns**: `void`

**Throws**: Nessuno

**Side Effects**:
- Salva stato precedente in variabile locale
- Aggiorna `this.stato` a `'APERTA'`
- Log INFO se cambio effettivo (da CHIUSA a APERTA): `"[timestamp] Cassetta aperta: CHIUSA → APERTA"`
- Log DEBUG se idempotente (già APERTA): `"[timestamp] Evento apertura idempotente (già APERTA)"`
- Chiama `emit('cambioStato', { timestamp, statoPrec, statoNuovo: 'APERTA' })`

**Idempotenza**: Chiamare quando già APERTA è valido, emette evento comunque (FR-008).

**Esempio**:
```javascript
sensore.notificaApertura();
// Console: "[2025-10-24T14:32:15.123Z] Cassetta aperta: CHIUSA → APERTA"
// Listener 'cambioStato' invocati con { timestamp: "...", statoPrec: "CHIUSA", statoNuovo: "APERTA" }
```

---

### Method: notificaChiusura

```javascript
notificaChiusura(): void
```

**Descrizione**: Simula evento di chiusura fisica della cassetta. Aggiorna stato interno a CHIUSA e notifica listener.

**Parametri**: Nessuno

**Returns**: `void`

**Throws**: Nessuno

**Side Effects**:
- Salva stato precedente in variabile locale
- Aggiorna `this.stato` a `'CHIUSA'`
- Log INFO se cambio effettivo (da APERTA a CHIUSA): `"[timestamp] Cassetta chiusa: APERTA → CHIUSA"`
- Log DEBUG se idempotente (già CHIUSA): `"[timestamp] Evento chiusura idempotente (già CHIUSA)"`
- Chiama `emit('cambioStato', { timestamp, statoPrec, statoNuovo: 'CHIUSA' })`

**Idempotenza**: Chiamare quando già CHIUSA è valido, emette evento comunque (FR-009).

**Esempio**:
```javascript
sensore.notificaChiusura();
// Console: "[2025-10-24T14:32:20.456Z] Cassetta chiusa: APERTA → CHIUSA"
// Listener 'cambioStato' invocati con { timestamp: "...", statoPrec: "APERTA", statoNuovo: "CHIUSA" }
```

---

### Method: getStato

```javascript
getStato(): string
```

**Descrizione**: Restituisce lo stato corrente della cassetta.

**Parametri**: Nessuno

**Returns**: `string` - `'APERTA'` oppure `'CHIUSA'`

**Throws**: Nessuno

**Side Effects**: Nessuno (metodo read-only)

**Esempio**:
```javascript
const stato = sensore.getStato();
console.log(stato); // 'CHIUSA' (default) o 'APERTA' dopo notificaApertura()
```

---

### Method: emit (Privato)

```javascript
emit(evento: string, dati: object): void
```

**Descrizione**: Metodo interno che notifica tutti i listener registrati per un evento.

**Parametri**:
- `evento` (string, required): Nome evento da emettere
- `dati` (object, required): Payload da passare ai listener

**Returns**: `void`

**Throws**: Nessuno (catch errori in singoli listener per evitare propagazione)

**Side Effects**:
- Itera array listener per `evento` nella Map
- Chiama ogni `callback(dati)`
- Se callback throw errore, log ERROR ma continua iterazione altri listener

**Note**: Non esposto pubblicamente, solo uso interno.

---

## Eventi

### Evento: 'cambioStato'

**Descrizione**: Emesso quando `notificaApertura()` o `notificaChiusura()` viene chiamato.

**Payload**:
```javascript
{
  timestamp: string,     // ISO 8601 format (es. "2025-10-24T14:32:15.123Z")
  statoPrec: string,     // 'APERTA' | 'CHIUSA'
  statoNuovo: string     // 'APERTA' | 'CHIUSA'
}
```

**Quando Emesso**:
- Dopo chiamata `notificaApertura()` (anche se idempotente)
- Dopo chiamata `notificaChiusura()` (anche se idempotente)

**Esempio Listener**:
```javascript
sensore.on('cambioStato', (dati) => {
  console.log(`[${dati.timestamp}] ${dati.statoPrec} → ${dati.statoNuovo}`);
  if (dati.statoPrec === dati.statoNuovo) {
    console.log('Evento idempotente');
  }
});
```

---

## Stati Validi

| Valore | Descrizione |
|--------|-------------|
| `'CHIUSA'` | Cassetta chiusa (default iniziale) |
| `'APERTA'` | Cassetta aperta |

**Nota**: Stato è sempre uno dei due valori sopra. Nessuno stato intermedio (no 'APRENDO', 'CHIUDENDO').

---

## Scenari d'Uso

### Scenario 1: Inizializzazione e Registrazione Listener

```javascript
// app.js
const sensore = new SensoreCassetta();

sensore.on('cambioStato', (dati) => {
  console.log(`Stato cassetta: ${dati.statoNuovo}`);
  aggiornaUI(dati.statoNuovo);
});

console.log(sensore.getStato()); // 'CHIUSA'
```

### Scenario 2: Simulazione Apertura Cassetta

```javascript
// Click pulsante "Apri Cassetta"
document.querySelector('#btn-apri-cassetta').addEventListener('click', () => {
  log.info('Operatore ha cliccato "Apri Cassetta"');
  sensore.notificaApertura();
  // Listener 'cambioStato' invocato automaticamente
});
```

### Scenario 3: Eventi Idempotenti

```javascript
sensore.notificaApertura();  // CHIUSA → APERTA (log INFO)
sensore.notificaApertura();  // APERTA → APERTA (log DEBUG, idempotente)

// Listener 'cambioStato' chiamato 2 volte:
// 1. { statoPrec: 'CHIUSA', statoNuovo: 'APERTA' }
// 2. { statoPrec: 'APERTA', statoNuovo: 'APERTA' }
```

### Scenario 4: Sequenza Rapida Eventi

```javascript
// Test eventi rapidi (5 click in 1 secondo)
for (let i = 0; i < 5; i++) {
  setTimeout(() => {
    sensore.notificaApertura();
  }, i * 200); // 200ms intervallo = 5 eventi/sec
}

// Tutti eventi processati senza perdita
// Listener chiamato 5 volte
```

---

## Error Handling

### Callback Non Funzione

```javascript
try {
  sensore.on('cambioStato', 'not a function');
} catch (e) {
  console.error(e); // TypeError: Callback deve essere una funzione
}
```

### Listener Throw Errore

```javascript
sensore.on('cambioStato', (dati) => {
  throw new Error('Listener rotto');
});

sensore.on('cambioStato', (dati) => {
  console.log('Questo listener funziona');
});

sensore.notificaApertura();
// Console ERROR: "Errore in listener 'cambioStato': Listener rotto"
// Console: "Questo listener funziona" (altri listener continuano)
```

---

## Performance Considerations

- **Complessità Temporale**:
  - `on()`: O(1) - aggiunta elemento array
  - `emit()`: O(n) dove n = numero listener per evento (tipicamente 1-2)
  - `notificaX()`: O(n) per emit + O(1) per update stato

- **Complessità Spaziale**: O(m * n) dove m = numero eventi, n = listener per evento

- **Eventi Rapidi**: Gestisce 5+ eventi/sec senza degrado (verificato da test E2E SC-005)

---

## Testing

### Unit Test (Concettuale)

```javascript
// Test stato iniziale
assert.equal(sensore.getStato(), 'CHIUSA');

// Test notificaApertura
let chiamato = false;
sensore.on('cambioStato', (dati) => {
  chiamato = true;
  assert.equal(dati.statoNuovo, 'APERTA');
});
sensore.notificaApertura();
assert.equal(chiamato, true);
assert.equal(sensore.getStato(), 'APERTA');

// Test idempotenza
sensore.notificaApertura(); // Già aperta
assert.equal(sensore.getStato(), 'APERTA'); // Stato invariato
```

### E2E Test (Playwright)

Vedere `tests/e2e/feature-004.spec.js` per test integrazione completa con DOM.

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-24 | Initial API definition |

---

## See Also

- [GestoreManutenzione API Contract](./gestore-manutenzione-api.md)
- [Data Model](../data-model.md)
- [Feature Specification](../spec.md)
