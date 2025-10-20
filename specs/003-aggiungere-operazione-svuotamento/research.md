# Research: Svuotamento Cassetta Monete con Autenticazione

**Feature**: 003-aggiungere-operazione-svuotamento
**Data**: 2025-10-17
**Contesto**: Implementazione sistema manutenzione cassetta con autenticazione operatore, timeout 10s, suoneria allarme e stato FUORI_SERVIZIO

## Decisioni Tecniche

### 1. Implementazione Suoneria Allarme

**Decisione**: Utilizzare Web Audio API per generare beep sintetizzato

**Rationale**:
- Zero dipendenze esterne (no file audio da hostare)
- Pieno controllo su frequenza, durata, volume
- Avvio istantaneo (no latenza caricamento file)
- Rispetta Constitution Principle IV (Build-Free) e III (JavaScript Vanilla)
- Supporto universale browser moderni (Chrome, Firefox, Safari, Edge)

**Alternative considerate**:
- **File audio esterno** (`assets/audio/alarm.mp3`): Richiede hosting file, latenza caricamento, gestione fallback se file mancante. Rifiutata perché aggiunge complessità deployment
- **Tag `<audio>` HTML5 con data URI**: Possibile ma meno flessibile per controllo volume/frequenza runtime. Rifiutata perché Web Audio API è più potente

**Implementazione**:
```javascript
// js/suoneria.js
class Suoneria {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.oscillator = null;
    this.gainNode = null;
    this.attiva = false;
  }

  attiva() {
    if (this.attiva) return;
    this.oscillator = this.audioContext.createOscillator();
    this.gainNode = this.audioContext.createGain();

    this.oscillator.type = 'sine';
    this.oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime); // 800 Hz beep
    this.gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime); // Volume 30%

    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);
    this.oscillator.start();
    this.attiva = true;
  }

  disattiva() {
    if (!this.attiva) return;
    this.oscillator.stop();
    this.oscillator.disconnect();
    this.gainNode.disconnect();
    this.attiva = false;
  }
}
```

**Override per test**: Aggiungere `window.suoneriaEnabled = false` per disabilitare durante test automatici

---

### 2. Gestione Countdown 10 Secondi

**Decisione**: Utilizzare `setInterval(1000)` per aggiornamento ogni secondo

**Rationale**:
- Semplicità implementazione (1 tick = 1 secondo esatto)
- Precisione sufficiente per countdown UI (±100ms accettabile per NFR-001)
- Nessuna complessità aggiuntiva rispetto a RAF (requestAnimationFrame)
- Pattern già utilizzato in `GestoreTimeout` esistente (feature 001)

**Alternative considerate**:
- **requestAnimationFrame**: Overkill per countdown 1s, genera 60 tick/secondo inutili. Rifiutata perché introduce complessità senza benefici (non serve precisione <16ms)
- **setTimeout ricorsivo**: Equivalente a `setInterval` ma più verboso. Rifiutata per semplicità

**Implementazione**:
```javascript
// js/gestore-manutenzione.js (nuovo file)
class GestoreManutenzione {
  constructor(chiosco) {
    this.chiosco = chiosco;
    this.timerCountdown = null;
    this.secondiRimanenti = 10;
  }

  avviaCountdown(callback) {
    this.secondiRimanenti = 10;
    this.aggiornaDisplay();

    this.timerCountdown = setInterval(() => {
      this.secondiRimanenti--;
      this.aggiornaDisplay();

      if (this.secondiRimanenti <= 0) {
        this.fermaCountdown();
        callback(); // Timeout → FUORI_SERVIZIO
      }
    }, 1000);
  }

  fermaCountdown() {
    if (this.timerCountdown) {
      clearInterval(this.timerCountdown);
      this.timerCountdown = null;
    }
  }

  aggiornaDisplay() {
    this.chiosco.display.aggiornaCountdown(this.secondiRimanenti);
  }
}
```

---

### 3. Pattern Transizioni FSM (Nuovi Stati Manutenzione)

**Decisione**: Aggiungere 4 nuovi stati al `Chiosco` esistente con pattern identico a feature 001/002

**Rationale**:
- Coerenza con architettura esistente (Finite State Machine in `js/chiosco.js`)
- Riuso metodo `transizione(nuovoStato, dati)` già testato
- Handler `onEntraX()` per ogni nuovo stato
- Zero breaking changes su feature 001/002

**Nuovi stati**:
```javascript
// js/chiosco.js - Aggiungere a this.stati
'MANUTENZIONE_AUTH_PENDING': {
  permessi: ['MANUTENZIONE_ATTESA_CHIUSURA', 'FUORI_SERVIZIO', 'IDLE']
},
'MANUTENZIONE_ATTESA_CHIUSURA': {
  permessi: ['MANUTENZIONE_SCELTA_AZZERAMENTO', 'FUORI_SERVIZIO']
},
'MANUTENZIONE_SCELTA_AZZERAMENTO': {
  permessi: ['IDLE']
},
'FUORI_SERVIZIO': {
  permessi: ['IDLE'] // Solo tramite reset autorizzato
}
```

**Handler nuovi**:
- `onEntraManutenzioneAuthPending()`: Avvia countdown 10s, mostra messaggio autenticazione
- `onEntraManutenzioneAttesaChiusura()`: Ferma countdown, mostra "Attesa chiusura cassetta"
- `onEntraManutenzioneSceltaAzzeramento()`: Mostra pulsanti Sì/No con saldo corrente
- `onEntraFuoriServizio()`: Attiva suoneria, disabilita tutti input cliente
- `onEntraIdleDaManutenzione()`: Reset completo, disattiva suoneria se attiva

**Alternative considerate**:
- **FSM separata per manutenzione**: Complessità eccessiva, duplicazione logica transizioni. Rifiutata perché una FSM unificata è più semplice e testabile
- **Event emitter pattern**: Cambio architetturale radicale, breaking change. Rifiutato per retrocompatibilità

---

### 4. UI Controlli Admin (Simulazione Sensore Cassetta)

**Decisione**: Area admin sempre visibile in basso con pulsanti "Apri Cassetta" / "Chiudi Cassetta"

**Rationale**:
- Semplicità UX: operatori vedono sempre controlli disponibili
- Zero configurazione: no toggle F12 o modalità debug da attivare
- Coerenza con pulsante "Persona passata" (feature 002) sempre visibile
- Facilitazione testing: E2E test possono cliccare direttamente senza setup complesso

**Implementazione HTML**:
```html
<!-- index.html - Aggiungere in fondo a body -->
<div class="pannello-admin">
  <h3>Controlli Manutenzione</h3>
  <button id="btn-apri-cassetta" class="btn-admin">🔓 Apri Cassetta</button>
  <button id="btn-chiudi-cassetta" class="btn-admin" disabled>🔒 Chiudi Cassetta</button>
  <div id="stato-cassetta" class="stato-cassetta">Cassetta: <span>Chiusa</span></div>
</div>
```

**Alternative considerate**:
- **Toggle con F12 o combinazione tasti**: UX complessa, difficile da documentare. Rifiutata perché operatori possono non conoscere DevTools
- **Modale popup**: Richiede click extra per aprire. Rifiutata per frizione UX
- **Console commands solo**: Richiede conoscenza JavaScript. Rifiutata per accessibilità operatori non tecnici

---

### 5. Componente SensoreCassetta

**Decisione**: Classe JavaScript `SensoreCassetta` che simula sensore hardware con stato aperta/chiusa

**Rationale**:
- Astrazione hardware: facilita future integrazioni con sensore reale (se richiesto)
- Event-driven: emette eventi `cassettaAperta`, `cassettaChiusa` che `Chiosco` ascolta
- Testabilità: mock facile per unit test
- Single Responsibility: gestisce solo stato cassetta, non logica business

**Implementazione**:
```javascript
// js/sensore-cassetta.js (nuovo file)
class SensoreCassetta {
  constructor() {
    this.stato = 'chiusa'; // 'aperta' | 'chiusa'
    this.listeners = {
      cassettaAperta: [],
      cassettaChiusa: []
    };
  }

  apri() {
    if (this.stato === 'aperta') {
      log.warn('SensoreCassetta: tentativo apertura cassetta già aperta');
      return;
    }
    this.stato = 'aperta';
    log.info('SensoreCassetta: cassetta aperta');
    this.notifica('cassettaAperta');
  }

  chiudi() {
    if (this.stato === 'chiusa') {
      log.warn('SensoreCassetta: tentativo chiusura cassetta già chiusa');
      return;
    }
    this.stato = 'chiusa';
    log.info('SensoreCassetta: cassetta chiusa');
    this.notifica('cassettaChiusa');
  }

  on(evento, callback) {
    if (this.listeners[evento]) {
      this.listeners[evento].push(callback);
    }
  }

  notifica(evento) {
    this.listeners[evento].forEach(cb => cb());
  }

  getStato() {
    return this.stato;
  }
}
```

**Alternative considerate**:
- **Event bus globale**: Over-engineering per singolo sensore. Rifiutato per semplicità
- **Stato nel Chiosco senza classe**: Viola Single Responsibility. Rifiutato per manutenibilità

---

### 6. Gestione Input Durante Manutenzione

**Decisione**: Disabilitare input cliente (monete, carte, QR) durante tutti stati manutenzione tranne IDLE

**Rationale**:
- Sicurezza: previene accessi simultanei operatore/cliente
- Conformità US5: cassetta aperta durante transito cliente → attende fine transito
- Pattern esistente: `chiosco.abilitaInput(false)` già implementato (feature 001)

**Implementazione**:
```javascript
// js/chiosco.js - Modificare metodo esistente
abilitaInput(abilita) {
  const statiManutenzione = [
    'MANUTENZIONE_AUTH_PENDING',
    'MANUTENZIONE_ATTESA_CHIUSURA',
    'MANUTENZIONE_SCELTA_AZZERAMENTO',
    'FUORI_SERVIZIO'
  ];

  const inManutenzione = statiManutenzione.includes(this.stato);

  // Durante manutenzione: disabilita sempre input cliente
  if (inManutenzione) {
    this.inputAbilitato = false;
    return;
  }

  // Altrimenti: usa parametro passato
  this.inputAbilitato = abilita;
}
```

**Gestione US5 (apertura durante transito)**:
```javascript
// js/sensore-cassetta.js - Handler evento apertura
onCassettaAperta() {
  const statiTransito = ['PORTA_APERTA', 'PAGAMENTO_MONETE', 'PAGAMENTO_CARTA'];

  if (statiTransito.includes(this.chiosco.stato)) {
    log.info('Cassetta aperta durante transito - attesa fine operazione');
    // Set flag per transizione a MANUTENZIONE dopo ritorno a IDLE
    this.pendenteAperturaCassetta = true;
  } else {
    // Transizione immediata a MANUTENZIONE
    this.chiosco.transizione('MANUTENZIONE_AUTH_PENDING');
  }
}
```

---

### 7. Validazione Saldo Gettoniera

**Decisione**: Validare saldo prima di mostrare scelta azzeramento, trattare NaN/negativo come 0,00€

**Rationale**:
- Robustezza: previene bug visualizzazione saldo corrotto
- Conformità FR-022: validazione obbligatoria
- Logging: warning su console per anomalie (debugging)

**Implementazione**:
```javascript
// js/gettoniera.js - Aggiungere metodo
validaSaldo() {
  let saldo = this.importoTotale - this.importoInserito;

  if (isNaN(saldo) || saldo < 0) {
    log.warn(`Gettoniera: saldo anomalo rilevato (${saldo}), resettato a 0.00€`);
    saldo = 0.00;
  }

  return saldo;
}

azzeraSaldo() {
  const saldoPrecedente = this.validaSaldo();
  this.importoInserito = 0;
  this.importoTotale = 1.20; // Reset a costo accesso standard
  log.info(`Gettoniera: saldo azzerato (da ${saldoPrecedente.toFixed(2)}€ a 0.00€)`);
  return saldoPrecedente;
}
```

---

### 8. Logging Operazioni Manutenzione

**Decisione**: Creare `OperazioneSvuotamento` come oggetto di tracciamento, loggare tutti eventi con timestamp

**Rationale**:
- Conformità US4: logging completo obbligatorio
- Audit trail: tracciabilità operazioni per sicurezza
- Constitution Principle V: osservabilità massima
- Debug: facilita troubleshooting problemi manutenzione

**Implementazione**:
```javascript
// js/gestore-manutenzione.js
class OperazioneSvuotamento {
  constructor() {
    this.timestampApertura = null;
    this.timestampAutenticazione = null;
    this.codiceOperatore = null;
    this.timestampChiusura = null;
    this.saldoPrima = null;
    this.saldoDopo = null;
    this.azzerato = null;
  }

  logEvento(tipo, dettagli = {}) {
    const timestamp = new Date().toISOString();
    const messaggio = `[Manutenzione] ${tipo}`;

    switch(tipo) {
      case 'APERTURA':
        log.info(`${messaggio} - Cassetta aperta`, { timestamp });
        this.timestampApertura = timestamp;
        break;
      case 'AUTH_SUCCESS':
        log.info(`${messaggio} - Operatore autenticato: ${dettagli.codice}`, { timestamp });
        this.timestampAutenticazione = timestamp;
        this.codiceOperatore = dettagli.codice;
        break;
      case 'AUTH_FAIL':
        log.warn(`${messaggio} - Accesso negato: ${dettagli.codice}`, { timestamp });
        break;
      case 'TIMEOUT':
        log.error(`${messaggio} - Timeout autenticazione`, { timestamp });
        break;
      case 'CHIUSURA':
        log.info(`${messaggio} - Cassetta chiusa`, { timestamp });
        this.timestampChiusura = timestamp;
        break;
      case 'AZZERAMENTO':
        log.info(`${messaggio} - Saldo ${dettagli.azzerato ? 'azzerato' : 'mantenuto'}: ${dettagli.saldoPrima}€ → ${dettagli.saldoDopo}€`, { timestamp });
        this.saldoPrima = dettagli.saldoPrima;
        this.saldoDopo = dettagli.saldoDopo;
        this.azzerato = dettagli.azzerato;
        break;
      case 'FUORI_SERVIZIO':
        log.error(`${messaggio} - Sistema in FUORI SERVIZIO - Suoneria attivata`, { timestamp });
        break;
      case 'RESET':
        log.info(`${messaggio} - Reset sistema da operatore: ${dettagli.codice}`, { timestamp });
        break;
    }
  }
}
```

---

## Best Practices Identificate

### Pattern FSM per Stati Complessi

Continuare a utilizzare il pattern FSM esistente per gestire stati complessi come manutenzione:
- Stati ben definiti con transizioni permesse
- Handler `onEntraX()` per side effects ingresso stato
- Validazione transizioni in `transizione(nuovoStato)`
- Logging ogni transizione per debug

**Vantaggio**: Codice prevedibile, testabile, debuggabile

### Event-Driven Architecture per Hardware Simulato

Usare pattern observer per componenti che simulano hardware (SensoreCassetta, Suoneria):
- Emissione eventi discreti (`cassettaAperta`, `cassettaChiusa`)
- Chiosco registra listener e reagisce con transizioni FSM
- Disaccoppiamento hardware/logica business

**Vantaggio**: Facilita future integrazioni hardware reale

### Defensive Programming per Dati Utente

Validare sempre dati provenienti da componenti esterni (gettoniera, carte):
- Check `isNaN()`, `< 0` per valori numerici
- Fallback a valori sicuri (0.00€)
- Warning log per anomalie

**Vantaggio**: Robustezza runtime, debugging facilitato

---

## Rischi Tecnici Identificati

### 1. Web Audio API: Browser Policy Autoplay

**Rischio**: Chrome/Safari bloccano `AudioContext` prima di user interaction (autoplay policy)

**Mitigazione**:
```javascript
// Inizializzare AudioContext solo dopo primo click utente
document.addEventListener('click', () => {
  if (this.audioContext.state === 'suspended') {
    this.audioContext.resume();
  }
}, { once: true });
```

### 2. Countdown Drift con setInterval

**Rischio**: `setInterval(1000)` può accumulare drift se thread bloccato (tab background)

**Mitigazione**:
- Accettabile per MVP (precisione ±200ms da NFR-001)
- Se necessario: usare `Date.now()` per calcolare delta reale ogni tick

### 3. Race Condition: Apertura Cassetta Durante Transizione

**Rischio**: Cassetta aperta mentre FSM transita PORTA_APERTA → IDLE

**Mitigazione**:
- Check stato corrente prima di ogni transizione
- Flag `pendenteAperturaCassetta` per retry dopo IDLE
- Log warning se stato inconsistente

---

## Performance Considerations

- **Suoneria**: Beep sintetizzato usa ~1% CPU (trascurabile)
- **Countdown**: `setInterval(1000)` genera 1 tick/secondo (overhead minimo)
- **Logging**: Console log ha impatto trascurabile su performance (disabilitabile con `log.setLevel('warn')`)

**Conclusione**: Nessun impatto performance significativo atteso

---

## Testing Strategy

### Unit Tests (se implementati in futuro)
- `SensoreCassetta`: Test apertura/chiusura, eventi emessi
- `Suoneria`: Test attivazione/disattivazione, volume
- `GestoreManutenzione`: Test countdown, timeout callback
- `Validatore`: Test validazione saldo (NaN, negativo, valido)

### Integration Tests (manuali o E2E)
- US1: Happy path svuotamento con azzeramento
- US2: Timeout 10s → FUORI_SERVIZIO
- US3: Reset da FUORI_SERVIZIO con carta autorizzata
- US4: Verifica log completi su console
- US5: Apertura cassetta durante transito

### Acceptance Tests
- Tutti scenari in spec.md verificati manualmente in browser
- Check zero breaking changes su feature 001/002

---

**Stato research**: ✅ Completo - Tutte decisioni tecniche definite
**Prossimo step**: Generare `data-model.md` con schema entità
