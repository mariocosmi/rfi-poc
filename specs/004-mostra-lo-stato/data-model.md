# Data Model: Visualizzazione Stato Cassetta e Controlli Manutenzione

**Feature**: 004-mostra-lo-stato
**Date**: 2025-10-24
**Purpose**: Definire entità, stati, relazioni e validazioni per sistema gestione cassetta

## Entità Principali

### 1. SensoreCassetta

**Descrizione**: Componente che mantiene lo stato corrente della cassetta e notifica i listener quando cambia.

**Attributi**:
| Nome | Tipo | Descrizione | Default | Validazione |
|------|------|-------------|---------|-------------|
| `stato` | `string` | Stato corrente cassetta | `'CHIUSA'` | Enum: `'APERTA'` \| `'CHIUSA'` |
| `listeners` | `Map<string, Function[]>` | Mappa eventi → array callback | `new Map()` | Interno, non esposto pubblicamente |

**Metodi Pubblici**:
- `on(evento: string, callback: Function): void` - Registra listener per evento
- `off(evento: string, callback: Function): void` - Rimuove listener (opzionale, non critico per SPA)
- `notificaApertura(): void` - Simula evento apertura fisica cassetta
- `notificaChiusura(): void` - Simula evento chiusura fisica cassetta
- `getStato(): string` - Restituisce stato corrente ('APERTA' | 'CHIUSA')

**Eventi Emessi**:
- `'cambioStato'` - Payload: `{ timestamp: string, statoPrec: string, statoNuovo: string }`

**Regole di Business**:
1. Stato iniziale sempre `'CHIUSA'` al caricamento pagina (nessuna persistence)
2. Eventi idempotenti permessi (apertura quando già aperta) - log DEBUG ma emit evento comunque
3. Ogni cambio stato logga con loglevel: DEBUG (idempotente) o INFO (cambio effettivo)
4. Timestamp eventi in formato ISO 8601 (`new Date().toISOString()`)

**Invarianti**:
- `stato` è sempre `'APERTA'` oppure `'CHIUSA'` (mai undefined/null/altro valore)
- `listeners` Map non contiene mai array vuoti (cleanup automatico su removeListener)

---

### 2. GestoreManutenzione

**Descrizione**: Componente UI che visualizza stato cassetta e fornisce pulsanti per simulare eventi apertura/chiusura.

**Attributi**:
| Nome | Tipo | Descrizione | Default | Validazione |
|------|------|-------------|---------|-------------|
| `sensore` | `SensoreCassetta` | Riferimento al sensore cassetta | N/A (required) | instanceof SensoreCassetta |
| `container` | `HTMLElement` | Elemento DOM pannello manutenzione | N/A (required) | instanceof HTMLElement |
| `elementoStato` | `HTMLElement` | Span che mostra stato corrente | `null` (lazy) | Trovato via `querySelector('#stato-cassetta')` |
| `btnApri` | `HTMLButtonElement` | Pulsante "Apri Cassetta" | `null` (lazy) | Trovato via `querySelector('#btn-apri-cassetta')` |
| `btnChiudi` | `HTMLButtonElement` | Pulsante "Chiudi Cassetta" | `null` (lazy) | Trovato via `querySelector('#btn-chiudi-cassetta')` |

**Metodi Pubblici**:
- `constructor(sensore: SensoreCassetta, container: HTMLElement)` - Inizializza, registra listener, setup pulsanti
- `aggiornaUI(dati: EventoCambioStato): void` - Aggiorna badge stato e log evento
- `destroy(): void` - Cleanup listener (opzionale, non critico per SPA)

**Metodi Privati**:
- `setupPulsanti(): void` - Collega event listener click → notificaApertura/Chiusura
- `applicaClasseStato(stato: string): void` - Aggiorna CSS classe badge (badge-aperta / badge-chiusa)

**Regole di Business**:
1. Pulsanti **sempre abilitati**, nessuna logica disabled (FR-003, FR-004)
2. Update UI entro 500ms da evento cambioStato (verificato da test E2E)
3. Badge stato usa classi CSS: `.badge-aperta` (verde), `.badge-chiusa` (grigio)
4. Click pulsante logga azione utente (INFO) prima di chiamare sensore.notificaX()

**Invarianti**:
- `sensore` e `container` non sono mai null dopo costruzione (error se passati invalidi)
- `elementoStato`, `btnApri`, `btnChiudi` trovati in DOM o errore in costruttore (fail-fast)
- UI sempre sincronizzata con `sensore.stato` dopo ogni evento cambioStato

---

## Relazioni tra Entità

```
┌─────────────────────┐
│  SensoreCassetta    │
│  ─────────────────  │
│  - stato: string    │
│  - listeners: Map   │
│                     │
│  + notificaApertura()│
│  + notificaChiusura()│
│  + on(evento, cb)   │
└──────────┬──────────┘
           │
           │ emits 'cambioStato'
           │
           ▼
┌─────────────────────┐
│ GestoreManutenzione │
│  ─────────────────  │
│  - sensore: Sensor  │◄──── references
│  - container: HTML  │
│  - elementoStato    │
│  - btnApri/Chiudi   │
│                     │
│  + aggiornaUI(dati) │
└─────────────────────┘
           │
           │ updates
           ▼
┌─────────────────────┐
│    DOM Elements     │
│  ─────────────────  │
│  #stato-cassetta    │ (badge con testo stato)
│  #btn-apri-cassetta │ (sempre enabled)
│  #btn-chiudi-cassetta│(sempre enabled)
└─────────────────────┘
```

**Dipendenze**:
- `GestoreManutenzione` dipende da `SensoreCassetta` (composizione, passato in costruttore)
- `SensoreCassetta` **non** dipende da `GestoreManutenzione` (disaccoppiamento, pattern observer)
- Entrambi dipendono da `window.log` (logger loglevel globale)

**Indipendenza da Chiosco FSM**:
- `SensoreCassetta` e `GestoreManutenzione` **NON** riferiscono `Chiosco` o `chiosco.stato`
- Eventi cassetta **NON** influenzano transizioni FSM (FR-011)
- `app.js` inizializza entrambi indipendentemente:
  ```javascript
  const sensoreCassetta = new SensoreCassetta();
  const gestoreManutenzione = new GestoreManutenzione(sensoreCassetta, document.querySelector('.manutenzione-panel'));
  ```

---

## Stati e Transizioni

### Stati Cassetta (SensoreCassetta.stato)

```
     ┌─────────┐
     │ CHIUSA  │ ◄─── Stato iniziale (default)
     └────┬────┘
          │
          │ notificaApertura()
          │
          ▼
     ┌─────────┐
     │ APERTA  │
     └────┬────┘
          │
          │ notificaChiusura()
          │
          ▼
     ┌─────────┐
     │ CHIUSA  │
     └─────────┘
```

**Transizioni Permesse**:
| Da Stato | Evento | A Stato | Note |
|----------|--------|---------|------|
| `CHIUSA` | `notificaApertura()` | `APERTA` | Log INFO, emit 'cambioStato' |
| `APERTA` | `notificaChiusura()` | `CHIUSA` | Log INFO, emit 'cambioStato' |
| `APERTA` | `notificaApertura()` | `APERTA` | Log DEBUG (idempotente), emit 'cambioStato' |
| `CHIUSA` | `notificaChiusura()` | `CHIUSA` | Log DEBUG (idempotente), emit 'cambioStato' |

**Nessuna Transizione Bloccata**: Tutti gli eventi sono sempre validi (idempotenza FR-008/FR-009).

**Nessuno Stato Intermedio**: Transizioni istantanee (no "APRENDO", "CHIUDENDO"). Simulazione non richiede durata temporale.

---

## Validazioni

### SensoreCassetta

**Validazione Stato**:
```javascript
// Invariante verificato in ogni notificaX()
if (this.stato !== 'APERTA' && this.stato !== 'CHIUSA') {
  log.error(`Stato cassetta corrotto: ${this.stato}`);
  this.stato = 'CHIUSA'; // recovery
}
```

**Validazione Listener**:
```javascript
// In on()
if (typeof callback !== 'function') {
  throw new TypeError('Callback deve essere una funzione');
}
```

### GestoreManutenzione

**Validazione Costruttore**:
```javascript
constructor(sensore, container) {
  if (!(sensore instanceof SensoreCassetta)) {
    throw new TypeError('sensore deve essere SensoreCassetta');
  }
  if (!(container instanceof HTMLElement)) {
    throw new TypeError('container deve essere HTMLElement');
  }

  // Verifica elementi DOM richiesti
  this.elementoStato = container.querySelector('#stato-cassetta');
  this.btnApri = container.querySelector('#btn-apri-cassetta');
  this.btnChiudi = container.querySelector('#btn-chiudi-cassetta');

  if (!this.elementoStato || !this.btnApri || !this.btnChiudi) {
    throw new Error('Elementi DOM manutenzione mancanti');
  }
}
```

---

## Schema Dati Eventi

### Evento 'cambioStato'

**Payload**:
```typescript
interface EventoCambioStato {
  timestamp: string;     // ISO 8601 format (es. "2025-10-24T14:32:15.123Z")
  statoPrec: 'APERTA' | 'CHIUSA';
  statoNuovo: 'APERTA' | 'CHIUSA';
}
```

**Esempio**:
```javascript
{
  timestamp: "2025-10-24T14:32:15.123Z",
  statoPrec: "CHIUSA",
  statoNuovo: "APERTA"
}
```

**Utilizzo**:
```javascript
sensore.on('cambioStato', (dati) => {
  log.info(`[${dati.timestamp}] Cassetta: ${dati.statoPrec} → ${dati.statoNuovo}`);
  // Aggiorna UI...
});
```

---

## Mappatura Requisiti → Modello

| Requisito | Entità/Metodo | Note |
|-----------|---------------|------|
| FR-001 (visualizza stato) | `GestoreManutenzione.aggiornaUI()` | Update `#stato-cassetta` textContent |
| FR-002 (aggiorna automatico) | `sensore.on('cambioStato', ...)` | Listener registrato in costruttore |
| FR-003 (pulsante Apri sempre abilitato) | `GestoreManutenzione.btnApri` | No logica disabled, sempre cliccabile |
| FR-004 (pulsante Chiudi sempre abilitato) | `GestoreManutenzione.btnChiudi` | No logica disabled, sempre cliccabile |
| FR-005 (gestisci apertura) | `SensoreCassetta.notificaApertura()` | Chiamato da click btnApri |
| FR-006 (gestisci chiusura) | `SensoreCassetta.notificaChiusura()` | Chiamato da click btnChiudi |
| FR-007 (update <500ms) | Event-driven architecture | Sincrono, test E2E verifica timeout |
| FR-008/FR-009 (idempotenza) | Logica in `notificaX()` | Log DEBUG, emit comunque |
| FR-010 (logging eventi) | `log.info/debug` in `notificaX()` | Timestamp, stato prec/nuovo |
| FR-011 (indipendente FSM) | Nessuna dipendenza da `Chiosco` | Classi separate, no import chiosco.js |

---

## Considerazioni Implementazione

### Performance

- **Update DOM minimale**: Solo `textContent` e `className` di badge, no innerHTML reconstruction
- **Listener Map**: O(1) lookup per evento, array iteration per notify (max 1-2 listener attesi)
- **No debounce**: Eventi rapidi (5/sec) gestiti senza throttling, update DOM è leggero

### Memory Management

- **No cleanup necessario**: SPA single-page, componenti mai distrutti
- **Se necessario**: `gestore.destroy()` rimuove listener con `sensore.off('cambioStato', callback)`

### Estensibilità Futura

- **Aggiungere stato 'BLOCCATA'**: Estendere enum, aggiungere CSS classe `.badge-bloccata`
- **Persistenza stato**: Salvare `sensore.stato` in `localStorage` al cambio, restore in costruttore
- **Logging remoto**: Estendere `emit('cambioStato')` per inviare eventi a backend API

---

## Test Coverage Data Model

### Unit Test (Concettuale - Non implementati, solo E2E)

Se servissero unit test isolati:
- `SensoreCassetta.notificaApertura()` → verifica `stato === 'APERTA'` e listener chiamato
- `SensoreCassetta.notificaChiusura()` → verifica `stato === 'CHIUSA'` e listener chiamato
- Eventi idempotenti → verifica log.debug chiamato
- `GestoreManutenzione.aggiornaUI()` → mock DOM, verifica textContent aggiornato

### E2E Test (Implementati con Playwright)

Vedere `tests/e2e/feature-004.spec.js`:
- US1: Verifica stato iniziale CHIUSA visualizzato
- US2: Click Apri → badge mostra APERTA
- US3: Click Chiudi → badge mostra CHIUSA
- Edge: Doppio click Apri → stato rimane APERTA
- Edge: Sequenza rapida Apri-Chiudi-Apri → stato finale APERTA

---

## Conclusione

**Data Model Completo**: Entità `SensoreCassetta` e `GestoreManutenzione` definite con attributi, metodi, validazioni e transizioni stati.

**Mapping Requisiti**: Tutti i 16 FR mappati a entità/metodi specifici.

**Pattern Event-Driven**: Observer pattern vanilla JS con Map per listener, disaccoppiamento completo.

**Ready for Implementation**: Schema pronto per coding fase, contracts API (prossimo step) definiscono interfacce pubbliche.
