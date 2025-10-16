# Modello Dati: Simulatore Chiosco Ingresso

**Funzionalità**: Simulatore Chiosco Ingresso
**Data**: 2025-10-15
**Fase**: 1 - Design e Modello Dati

## Panoramica

Il simulatore chiosco è implementato come applicazione client-side con stato gestito interamente in memoria JavaScript. Non c'è persistenza dello stato operativo (transazioni, pagamenti) - solo i codici autorizzati sono persistiti in LocalStorage. Il modello dati si concentra su entità runtime e loro relazioni.

---

## Entità Principali

### 1. Chiosco (Entità Radice)

**Responsabilità**: Coordinare tutti i componenti, gestire macchina a stati globale, orchestrare flussi utente.

**Attributi**:

| Attributo | Tipo | Descrizione | Valore Iniziale |
|-----------|------|-------------|-----------------|
| `stato` | `StatoChiosco` (enum) | Stato corrente macchina a stati | `'IDLE'` |
| `display` | `Display` | Riferimento componente display | `new Display()` |
| `gettoniera` | `Gettoniera` | Riferimento componente gettoniera | `new Gettoniera()` |
| `lettoreCarte` | `LettoreCarte` | Riferimento lettore carte contactless | `new LettoreCarte()` |
| `lettoreQR` | `LettoreQR` | Riferimento lettore QR code | `new LettoreQR()` |
| `porta` | `Porta` | Riferimento componente porta | `new Porta()` |
| `gestoreTimeout` | `GestoreTimeout` | Gestione timeout inattività | `new GestoreTimeout(20)` |

**Enum StatoChiosco**:
```javascript
const StatoChiosco = {
  IDLE: 'IDLE',                         // Stato iniziale, attesa input utente
  PAGAMENTO_MONETE: 'PAGAMENTO_MONETE', // Inserimento monete in corso
  PAGAMENTO_CARTA: 'PAGAMENTO_CARTA',   // Transazione carta credito in corso
  VERIFICA_QR: 'VERIFICA_QR',           // Scansione QR code in corso
  VERIFICA_CARTA: 'VERIFICA_CARTA',     // Verifica carta autorizzata in corso
  PORTA_APERTA: 'PORTA_APERTA',         // Porta aperta, attesa chiusura automatica
  TIMEOUT: 'TIMEOUT'                    // Timeout inattività raggiunto
};
```

**Transizioni Stati Permesse**:
```javascript
const transizioniPermesse = {
  'IDLE': ['PAGAMENTO_MONETE', 'PAGAMENTO_CARTA', 'VERIFICA_QR', 'VERIFICA_CARTA'],
  'PAGAMENTO_MONETE': ['PORTA_APERTA', 'TIMEOUT', 'IDLE', 'PAGAMENTO_CARTA'],
  'PAGAMENTO_CARTA': ['PORTA_APERTA', 'IDLE'],
  'VERIFICA_QR': ['PORTA_APERTA', 'IDLE'],
  'VERIFICA_CARTA': ['PORTA_APERTA', 'IDLE'],
  'PORTA_APERTA': ['IDLE'],
  'TIMEOUT': ['IDLE']
};
```

**Metodi Principali**:
- `transizione(nuovoStato: StatoChiosco): void` - Esegue transizione stato con validazione
- `reset(): void` - Riporta chiosco a stato IDLE, resetta tutti i componenti
- `abilitaInput(): void` - Abilita tutti i metodi di input
- `disabilitaInput(eccezione?: string): void` - Disabilita input, opzionalmente eccetto uno specificato

**Regole di Validazione**:
- Transizioni devono essere presenti in `transizioniPermesse[statoCorrente]`
- Durante stati VERIFICA_QR, VERIFICA_CARTA, PAGAMENTO_CARTA tutti gli altri input sono disabilitati
- Durante PAGAMENTO_MONETE, altri input attivi ma se usati causano reset monete

---

### 2. Display

**Responsabilità**: Mostrare messaggi, importi, stati transazione, countdown timeout.

**Attributi**:

| Attributo | Tipo | Descrizione | Valore Iniziale |
|-----------|------|-------------|-----------------|
| `messaggio` | `string` | Messaggio corrente visualizzato | `'Benvenuto - Scegli modalità di accesso'` |
| `importoRimanente` | `number \| null` | Importo rimanente da pagare (€), null se non applicabile | `null` |
| `countdown` | `number \| null` | Secondi rimanenti timeout, null se non attivo | `null` |
| `statoVisivo` | `StatoDisplay` (enum) | Stato visivo per styling | `'NEUTRO'` |

**Enum StatoDisplay**:
```javascript
const StatoDisplay = {
  NEUTRO: 'NEUTRO',       // Colore neutro (bianco/grigio)
  ELABORAZIONE: 'ELABORAZIONE', // Animazione caricamento
  SUCCESSO: 'SUCCESSO',   // Verde, animazione successo
  ERRORE: 'ERRORE',       // Rosso, icona errore
  ALERT: 'ALERT'          // Arancione, icona attenzione
};
```

**Metodi Principali**:
- `mostraMessaggio(testo: string, stato: StatoDisplay): void` - Aggiorna messaggio e stato visivo
- `aggiornaImportoRimanente(importo: number): void` - Mostra importo rimanente formattato (es. "0,70 €")
- `aggiornaCountdown(secondi: number): void` - Mostra countdown (es. "Reset tra: 15s")
- `reset(): void` - Torna a messaggio iniziale, resetta importo e countdown

**Regole di Validazione**:
- `importoRimanente` deve essere >= 0 se non null
- `countdown` deve essere > 0 se non null
- Messaggi in italiano, formattazione valuta europea (virgola decimale)

---

### 3. Gettoniera

**Responsabilità**: Simulare inserimento monete, calcolare importo rimanente, validare raggiungimento soglia.

**Attributi**:

| Attributo | Tipo | Descrizione | Valore Iniziale |
|-----------|------|-------------|-----------------|
| `importoRichiesto` | `number` | Importo target in euro | `1.20` |
| `importoInserito` | `number` | Totale monete inserite (€) | `0.00` |
| `moneteInserite` | `Moneta[]` | Array monete inserite | `[]` |

**Tipo Moneta**:
```javascript
const tagliMonete = [2.00, 1.00, 0.50, 0.20, 0.10, 0.05, 0.02, 0.01];

// Moneta inserita
{
  valore: number,    // Valore in euro (es. 0.50)
  timestamp: number  // Timestamp inserimento (Date.now())
}
```

**Proprietà Calcolate**:
- `importoRimanente: number` - `max(0, importoRichiesto - importoInserito)`
- `pagamentoCompletato: boolean` - `importoInserito >= importoRichiesto`

**Metodi Principali**:
- `inserisciMoneta(valore: number): void` - Aggiunge moneta, aggiorna totale, notifica display
- `reset(): void` - Azzera importo inserito e array monete
- `getImportoRimanente(): number` - Ritorna importo ancora da versare

**Regole di Validazione**:
- `valore` moneta deve essere in `tagliMonete`
- `importoInserito` arrotondato a 2 decimali per evitare errori floating-point
- Sovrapagamento permesso (importoRimanente va a 0, non negativo visualizzato)

---

### 4. LettoreCarte

**Responsabilità**: Simulare lettura carte contactless per pagamento e verifica autorizzazione.

**Attributi**:

| Attributo | Tipo | Descrizione | Valore Iniziale |
|-----------|------|-------------|-----------------|
| `modalita` | `ModalitaCarta` (enum) | Modalità operativa corrente | `null` |
| `statoTransazione` | `StatoTransazione` (enum) | Stato transazione pagamento | `'IDLE'` |
| `cartaLetta` | `string \| null` | Codice carta letto (simulato) | `null` |

**Enum ModalitaCarta**:
```javascript
const ModalitaCarta = {
  PAGAMENTO: 'PAGAMENTO',           // Modalità pagamento 1,20€
  AUTORIZZAZIONE: 'AUTORIZZAZIONE'  // Modalità verifica codice autorizzato
};
```

**Enum StatoTransazione**:
```javascript
const StatoTransazione = {
  IDLE: 'IDLE',                     // Nessuna transazione in corso
  ELABORAZIONE: 'ELABORAZIONE',     // Transazione in elaborazione (simulazione delay)
  ACCETTATA: 'ACCETTATA',           // Pagamento accettato
  RIFIUTATA: 'RIFIUTATA',           // Pagamento rifiutato
  ANNULLATA: 'ANNULLATA'            // Transazione annullata (carta rimossa)
};
```

**Metodi Principali**:
- `impostaModalita(modalita: ModalitaCarta): void` - Imposta modalità pagamento/autorizzazione
- `leggiCarta(codiceCarta: string): void` - Simula lettura carta (simulazione asincrona 1-2s)
- `processaPagamento(): void` - Simula elaborazione pagamento (80% successo, 20% fallimento)
- `verificaAutorizzazione(codiceCarta: string): boolean` - Verifica se carta è in lista autorizzati
- `reset(): void` - Resetta modalità e stato transazione

**Regole di Validazione**:
- `modalita` deve essere impostata prima di `leggiCarta`
- `processaPagamento()` solo se `modalita === PAGAMENTO`
- `verificaAutorizzazione()` solo se `modalita === AUTORIZZAZIONE`
- Durante `ELABORAZIONE`, input disabilitati

---

### 5. LettoreQR

**Responsabilità**: Simulare scansione QR code e verifica autorizzazione.

**Attributi**:

| Attributo | Tipo | Descrizione | Valore Iniziale |
|-----------|------|-------------|-----------------|
| `codiceScansionato` | `string \| null` | Codice QR letto | `null` |
| `statoVerifica` | `StatoVerificaQR` (enum) | Risultato verifica | `'IDLE'` |

**Enum StatoVerificaQR**:
```javascript
const StatoVerificaQR = {
  IDLE: 'IDLE',                         // Nessuna scansione in corso
  SCANSIONE: 'SCANSIONE',               // Scansione in corso
  AUTORIZZATO: 'AUTORIZZATO',           // Codice QR autorizzato
  NON_AUTORIZZATO: 'NON_AUTORIZZATO',   // Codice QR non in lista
  ERRORE_LETTURA: 'ERRORE_LETTURA'      // Codice non leggibile/malformato
};
```

**Metodi Principali**:
- `scansionaCodice(codice: string): void` - Simula scansione QR (validazione formato, verifica lista)
- `verificaCodice(codice: string): boolean` - Controlla se codice è in CodiciAutorizzati
- `reset(): void` - Resetta codice scansionato e stato verifica

**Regole di Validazione**:
- `codice` deve essere stringa non vuota, trim whitespace
- Codice malformato (< 3 caratteri) → `ERRORE_LETTURA`
- Durante `SCANSIONE`, input disabilitati

---

### 6. Porta

**Responsabilità**: Simulare apertura/chiusura porta, gestire timer chiusura automatica.

**Attributi**:

| Attributo | Tipo | Descrizione | Valore Iniziale |
|-----------|------|-------------|-----------------|
| `stato` | `StatoPorta` (enum) | Stato corrente porta | `'CHIUSA'` |
| `timerChiusura` | `number \| null` | ID setTimeout chiusura automatica | `null` |
| `durataApertura` | `number` | Secondi porta rimane aperta | `15` |

**Enum StatoPorta**:
```javascript
const StatoPorta = {
  CHIUSA: 'CHIUSA',   // Porta chiusa
  APERTA: 'APERTA'    // Porta aperta
};
```

**Metodi Principali**:
- `apri(): void` - Apre porta, avvia timer chiusura automatica (15s), transizione CSS
- `chiudi(): void` - Chiude porta, cancella timer, notifica chiosco per reset
- `cancellaTimer(): void` - Cancella timer chiusura (se porta chiusa manualmente)

**Regole di Validazione**:
- `apri()` può essere chiamato solo se `stato === 'CHIUSA'`
- `timerChiusura` deve essere cancellato prima di impostarne uno nuovo
- Chiusura porta deve notificare Chiosco per transizione `PORTA_APERTA → IDLE`

---

### 7. Validatore (Utility Statica)

**Responsabilità**: Validare codici QR/carte autorizzate e carte di credito VISA tramite regole hardcoded.

**Regole Hardcoded**:
```javascript
// validatore.js
class Validatore {
  // Codici QR e carte contactless autorizzate: numeri da 1 a 99
  static isCodiceAutorizzato(codice) {
    const num = parseInt(codice, 10);
    return !isNaN(num) && num >= 1 && num <= 99;
  }

  // Carte credito: solo VISA accettate per pagamenti (pattern: inizia con "4")
  static isCartaVISA(numeroCarta) {
    return typeof numeroCarta === 'string' && numeroCarta.startsWith('4');
  }

  // Simulazione validazione carta (per pagamenti)
  static isCartaValida(numeroCarta) {
    return this.isCartaVISA(numeroCarta) && numeroCarta.length >= 13;
  }
}
```

**Metodi Statici**:
- `isCodiceAutorizzato(codice: string): boolean` - Verifica se codice è 1-99
- `isCartaVISA(numeroCarta: string): boolean` - Verifica se carta inizia con "4"
- `isCartaValida(numeroCarta: string): boolean` - Verifica VISA + lunghezza minima

**Esempi Validazione**:
- `isCodiceAutorizzato("42")` → `true` ✅
- `isCodiceAutorizzato("100")` → `false` ❌
- `isCodiceAutorizzato("ABC")` → `false` ❌
- `isCartaVISA("4111111111111111")` → `true` ✅
- `isCartaVISA("5500000000000004")` → `false` (Mastercard) ❌

**Regole di Validazione**:
- Codici autorizzati: solo stringhe numeriche 1-99 (parsing parseInt)
- Carte VISA: primo carattere "4" (standard pattern VISA reale)
- Lunghezza carta: minimo 13 caratteri per considerarla valida
- Case-insensitive per codici numerici (non applicabile)

---

### 8. GestoreTimeout

**Responsabilità**: Gestire timeout inattività (20s), aggiornare countdown display.

**Attributi**:

| Attributo | Tipo | Descrizione | Valore Iniziale |
|-----------|------|-------------|-----------------|
| `durata` | `number` | Durata timeout in millisecondi | `20000` |
| `timer` | `number \| null` | ID setTimeout per timeout | `null` |
| `intervalloConto` | `number \| null` | ID setInterval per countdown | `null` |
| `secondiRimanenti` | `number` | Secondi rimanenti prima timeout | `20` |
| `chiosco` | `Chiosco` | Riferimento chiosco per callback | - |

**Metodi Principali**:
- `avvia(): void` - Avvia timer timeout + intervallo countdown display
- `reset(): void` - Ferma timer e intervallo, cancella ID
- `onTimeout(): void` - Callback timeout raggiunto, transizione chiosco a TIMEOUT

**Regole di Validazione**:
- `reset()` deve essere chiamato prima di `avvia()` per evitare timer multipli
- `secondiRimanenti` aggiornato ogni 1000ms tramite setInterval
- Timer attivo solo durante stati `PAGAMENTO_MONETE` (altre operazioni bloccano input, no timeout)

---

## Diagramma Relazioni Entità

```
Chiosco (root)
├── Display
├── Gettoniera
├── LettoreCarte
├── LettoreQR
├── Porta
└── GestoreTimeout
    └── (callback) → Chiosco

Validatore (static utility)
├── (used by) → LettoreCarte
└── (used by) → LettoreQR
```

---

## Flussi Dati Principali

### Flusso Pagamento Monete

1. Utente click pulsante moneta (es. 0,50€)
2. `Gettoniera.inserisciMoneta(0.50)`
   - Aggiorna `importoInserito`
   - Calcola `importoRimanente`
3. `Display.aggiornaImportoRimanente(importoRimanente)`
   - Mostra "Rimanente: 0,70 €"
4. `Chiosco.transizione('PAGAMENTO_MONETE')` (se primo inserimento)
5. `GestoreTimeout.avvia()` - Timeout 20s attivo
6. Quando `importoRimanente <= 0`:
   - `Chiosco.transizione('PORTA_APERTA')`
   - `Porta.apri()`
   - `GestoreTimeout.reset()`
7. Dopo 15s: `Porta.chiudi()` → `Chiosco.transizione('IDLE')`

### Flusso Pagamento Carta

1. Utente click "Paga con Carta"
2. `Chiosco.disabilitaInput()` - Blocca altri input
3. `LettoreCarte.impostaModalita('PAGAMENTO')`
4. `Chiosco.transizione('PAGAMENTO_CARTA')`
5. Utente click "Avvicina Carta" (simula contactless)
6. `LettoreCarte.leggiCarta(codiceCasuale)`
   - Simula delay 1-2s, stato → `ELABORAZIONE`
   - `Display.mostraMessaggio('Elaborazione...', 'ELABORAZIONE')`
7. `LettoreCarte.processaPagamento()`
   - Random 80% successo, 20% fallimento
   - Se successo: stato → `ACCETTATA`, `Chiosco.transizione('PORTA_APERTA')`
   - Se fallimento: stato → `RIFIUTATA`, `Chiosco.transizione('IDLE')`
8. Se successo: `Porta.apri()` (come sopra)

### Flusso Verifica QR

1. Utente inserisce codice in campo testo (es. "ABC123")
2. Utente click "Scansiona QR"
3. `Chiosco.disabilitaInput()` - Blocca altri input
4. `Chiosco.transizione('VERIFICA_QR')`
5. `LettoreQR.scansionaCodice('ABC123')`
6. `CodiciAutorizzati.verifica('ABC123')` → `true` o `false`
7. Se `true`:
   - `LettoreQR.statoVerifica` → `AUTORIZZATO`
   - `Display.mostraMessaggio('Accesso autorizzato', 'SUCCESSO')`
   - `Chiosco.transizione('PORTA_APERTA')`
   - `Porta.apri()`
8. Se `false`:
   - `LettoreQR.statoVerifica` → `NON_AUTORIZZATO`
   - `Display.mostraMessaggio('Accesso negato', 'ERRORE')`
   - `Chiosco.transizione('IDLE')`

---

## Persistenza e Lifecycle

### Dati Persistiti

| Chiave | Valore | Scopo |
|--------|--------|-------|
| `loglevel:webpack-dev-server` | `"info"` | Livello log (gestito automaticamente da loglevel) |

**Nota**: Nessun dato applicativo persistito - regole validazione hardcoded nel codice.

### Dati Runtime (Non Persistiti)

Tutti i dati (stato chiosco, importo monete, timer, ecc.) sono in memoria e persi al reload pagina.

### Lifecycle Applicazione

1. **Load**: `window.onload` → `new Chiosco()` → stato `IDLE`
2. **Interazione**: Utente interagisce → transizioni stati → aggiornamenti UI
3. **Reload/Close**: Nessun salvataggio stato operativo (solo codici autorizzati persistono)

---

## Validazioni Cross-Entity

| Regola | Entità Coinvolte | Validazione |
|--------|------------------|-------------|
| Input bloccati durante operazioni sincrone | Chiosco, tutti i lettori | `Chiosco.disabilitaInput()` durante VERIFICA_QR, VERIFICA_CARTA, PAGAMENTO_CARTA |
| Reset automatico post-timeout | Chiosco, GestoreTimeout, Display | Dopo 20s inattività in PAGAMENTO_MONETE → TIMEOUT → IDLE |
| Porta chiude dopo 15s | Porta, Chiosco | `Porta.timerChiusura` → `Chiosco.transizione('IDLE')` |
| Importo rimanente mai negativo | Gettoniera, Display | `Math.max(0, importoRichiesto - importoInserito)` |
| Codici autorizzati numerici 1-99 | Validatore, LettoreQR, LettoreCarte | `parseInt(codice) tra 1 e 99` |
| Solo carte VISA per pagamenti | Validatore, LettoreCarte | `numeroCarta.startsWith('4')` |

---

## Note Implementazione

- **Arrotondamento Decimali**: Usare `Math.round(valore * 100) / 100` per importi in euro
- **Logging**: Ogni transizione stato, inserimento moneta, lettura carta/QR deve loggare evento
- **Accessibilità**: Tutti i componenti UI devono avere attributi `aria-label` appropriati
- **Internazionalizzazione**: Tutti i testi hardcoded in italiano (nessun i18n richiesto al momento)
