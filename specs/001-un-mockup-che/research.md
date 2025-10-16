# Ricerca Tecnica: Simulatore Chiosco Ingresso

**Funzionalità**: Simulatore Chiosco Ingresso
**Data**: 2025-10-15
**Fase**: 0 - Ricerca e Decisioni Tecniche

## Riepilogo Decisioni

Questo documento raccoglie le decisioni tecniche per implementare il simulatore chiosco come applicazione web statica conforme alla costituzione del progetto.

---

## 1. Libreria di Logging

### Decisione
**loglevel** (https://github.com/pimterry/loglevel, 4KB minified)

### Motivazione
- **Leggera**: 4KB minificata, impatto minimo su caricamento
- **API Semplice**: `log.setLevel('debug'|'info'|'warn'|'error')` + metodi standard
- **Zero Configurazione**: Funziona out-of-the-box, configurazione opzionale
- **Supporto Browser**: Compatibile con tutti i browser moderni
- **Persistenza**: Salva livello log in LocalStorage automaticamente
- **Conforme Principio V**: Livelli di gravità configurabili, output console browser

### Alternative Considerate

| Libreria | Dimensione | Pro | Contro | Perché Rifiutata |
|----------|-----------|-----|--------|------------------|
| console nativo | 0KB | Già disponibile, zero overhead | Nessuna configurazione livelli centralizzata | Non permette disabilitazione selettiva DEBUG in produzione |
| winston | ~200KB | Molto potente, trasport multipli | Troppo pesante per browser | Overkill per caso d'uso semplice, pensato per Node.js |
| debug | ~7KB | Pattern namespace utile | Richiede configurazione environment | Complessità non necessaria per singola app |
| log4javascript | ~50KB | Feature-rich (appenders, layout) | Dimensione eccessiva | Troppo pesante, feature non richieste |

**Conclusione**: loglevel fornisce esattamente ciò che serve (livelli configurabili) con overhead minimo.

---

## 2. Pattern Gestione Stato Chiosco

### Decisione
**Finite State Machine (FSM) esplicita** con classe JavaScript

### Motivazione
- **Chiarezza**: Stati del chiosco ben definiti (IDLE, PAGAMENTO_MONETE, PAGAMENTO_CARTA, ecc.)
- **Sicurezza**: Transizioni valide esplicite, previene stati inconsistenti
- **Debugging**: Facile tracciare stato corrente e transizioni nel log
- **Semplicità**: Implementabile con semplice oggetto stati + metodi transizione
- **Testabilità**: Logica transizioni isolata e testabile indipendentemente

### Implementazione Proposta

```javascript
// chiosco.js
class Chiosco {
  constructor() {
    this.stato = 'IDLE';
    this.transizioniPermesse = {
      'IDLE': ['PAGAMENTO_MONETE', 'PAGAMENTO_CARTA', 'VERIFICA_QR', 'VERIFICA_CARTA'],
      'PAGAMENTO_MONETE': ['PORTA_APERTA', 'TIMEOUT', 'IDLE', 'PAGAMENTO_CARTA'],
      'PAGAMENTO_CARTA': ['PORTA_APERTA', 'IDLE'],
      'VERIFICA_QR': ['PORTA_APERTA', 'IDLE'],
      'VERIFICA_CARTA': ['PORTA_APERTA', 'IDLE'],
      'PORTA_APERTA': ['IDLE'],
      'TIMEOUT': ['IDLE']
    };
  }

  transizione(nuovoStato) {
    if (this.transizioniPermesse[this.stato].includes(nuovoStato)) {
      log.info(`Transizione: ${this.stato} → ${nuovoStato}`);
      this.stato = nuovoStato;
      this.onCambioStato(nuovoStato);
    } else {
      log.error(`Transizione non permessa: ${this.stato} → ${nuovoStato}`);
    }
  }
}
```

### Alternative Considerate

| Pattern | Pro | Contro | Perché Rifiutato |
|---------|-----|--------|------------------|
| Redux/Flux | Unidirezionalità, time-travel debug | Richiede libreria, boilerplate eccessivo | Viola Principio III, complessità non necessaria |
| Event Emitter | Disaccoppiamento componenti | Stati impliciti, difficile tracciare flusso | Maggiore rischio di stati inconsistenti |
| Semplice oggetto stato | Minima complessità | Nessuna validazione transizioni | Non previene errori (es. da PORTA_APERTA a VERIFICA_QR) |

**Conclusione**: FSM esplicita bilancia semplicità, sicurezza e manutenibilità.

---

## 3. Validazione Codici Autorizzati e Carte

### Decisione
**Regole Hardcoded** nel codice JavaScript - nessun storage persistente

### Motivazione
- **Semplicità Massima**: Zero gestione storage, zero configurazione
- **Performance**: Validazione istantanea tramite logica condizionale semplice
- **Zero Dipendenze**: Nessuna API browser necessaria
- **Deterministico**: Comportamento identico tra reload, browser, dispositivi
- **Adeguato per Mockup**: Simulatore dimostrativo non richiede gestione dinamica

### Regole Implementate

```javascript
// validatore.js
class Validatore {
  // Codici QR e carte contactless autorizzate: numeri da 1 a 99
  static isCodiceAutorizzato(codice) {
    const num = parseInt(codice, 10);
    return !isNaN(num) && num >= 1 && num <= 99;
  }

  // Carte credito: solo VISA accettate per pagamenti
  static isCartaVISA(numeroCarta) {
    // Simulazione: carte che iniziano con "4" (pattern VISA reale)
    return numeroCarta.startsWith('4');
  }
}
```

**Esempi Codici Validi**:
- QR/Carta autorizzata: `"1"`, `"42"`, `"99"` ✅
- QR/Carta NON autorizzata: `"0"`, `"100"`, `"ABC"` ❌
- Carta VISA: `"4111111111111111"` ✅
- Carta NON-VISA: `"5500000000000004"` (Mastercard) ❌

### Alternative Considerate

| Approccio | Pro | Contro | Perché Rifiutato |
|-----------|-----|--------|------------------|
| LocalStorage con lista codici | Modificabile senza ricompilare | Richiede gestione UI admin, complessità storage | Non necessario per mockup, eccessiva flessibilità |
| File JSON esterno caricato | Centralizzato, modificabile | Richiede fetch API, gestione errori caricamento | Aggiunge asincronia non necessaria |
| Backend API | Realistico per produzione | Richiede server, viola Principio II (Static-First) | Fuori scope per simulatore statico |
| Regex complessi per VISA | Validazione numero carta completa (Luhn) | Complessità eccessiva per mockup | Simulazione semplice sufficiente |

**Conclusione**: Regole hardcoded perfettamente adeguate per mockup statico, massima semplicità.

---

## 4. Simulazione Lettura QR Code

### Decisione
**Input manuale tramite campo di testo** + pulsante "Scansiona QR"

### Motivazione
- **Semplicità Implementativa**: `<input type="text">` standard HTML
- **Testing Facile**: Basta digitare codice, no necessità file/camera
- **Universalità**: Funziona ovunque (desktop, mobile, file://)
- **Nessuna Dipendenza**: No libreria QR code necessaria
- **Esperienza Utente**: Chiaro e diretto per simulatore/mockup

### Implementazione UI

```html
<div id="lettore-qr" class="componente-hardware">
  <label for="input-qr">Inserisci Codice QR:</label>
  <input type="text" id="input-qr" placeholder="Es: ABC123" />
  <button id="btn-scansiona-qr">Scansiona QR</button>
</div>
```

### Alternative Considerate

| Approccio | Pro | Contro | Perché Rifiutato |
|-----------|-----|--------|------------------|
| File upload immagine QR | Più realistico visivamente | Richiede libreria QR parser (jsQR ~50KB), UX complessa | Overhead non necessario per mockup |
| Camera API + scan reale | Massimo realismo | Richiede permessi camera, non funziona file://, libreria necessaria | Troppo complesso, violazione privacy, Build required |
| QR code generato cliccabile | Visualmente attraente | Deve pre-generare QR autorizzati (libreria qrcode.js) | Aggiunge dipendenza non essenziale |

**Conclusione**: Input manuale perfettamente adeguato per simulatore/mockup, zero complessità.

---

## 5. Timer e Gestione Timeout

### Decisione
**setTimeout** per timeout inattività (20s), **setInterval** per countdown display (1s)

### Motivazione
- **Nativo**: API JavaScript standard, zero dipendenze
- **Precisione Adeguata**: ±100ms accettabile per timeout UI (non critico)
- **Semplicità**: API diretta `setTimeout(fn, ms)`, facile cancellazione con `clearTimeout`
- **Supporto Universale**: Disponibile in tutti i browser da sempre

### Implementazione

```javascript
// Timeout inattività 20s
class GestoreTimeout {
  constructor(chiosco, durataSecondi) {
    this.chiosco = chiosco;
    this.durata = durataSecondi * 1000;
    this.timer = null;
    this.intervalloConto = null;
    this.secondiRimanenti = durataSecondi;
  }

  avvia() {
    this.reset();
    this.secondiRimanenti = this.durata / 1000;

    // Timer principale per timeout
    this.timer = setTimeout(() => {
      log.warn('Timeout inattività raggiunto');
      this.chiosco.transizione('TIMEOUT');
    }, this.durata);

    // Intervallo per aggiornare countdown display
    this.intervalloConto = setInterval(() => {
      this.secondiRimanenti--;
      this.chiosco.display.aggiornaCountdown(this.secondiRimanenti);
      if (this.secondiRimanenti <= 0) {
        clearInterval(this.intervalloConto);
      }
    }, 1000);
  }

  reset() {
    if (this.timer) clearTimeout(this.timer);
    if (this.intervalloConto) clearInterval(this.intervalloConto);
  }
}
```

### Alternative Considerate

| Approccio | Pro | Contro | Perché Rifiutato |
|-----------|-----|--------|------------------|
| requestAnimationFrame | Precisione sub-millisecondo, 60fps | Overkill per countdown secondi, maggiore complessità | Precisione non necessaria per timer UI |
| Web Workers + timer | Precisione migliore (non bloccato da JS main thread) | Complessità, overhead comunicazione, overkill | Eccessivo per semplice timeout UI |
| Libreria (moment.js, date-fns) | Gestione date/durate strutturata | Dimensione (moment 67KB), feature non necessarie | Violazione Principio III, overhead eccessivo |

**Conclusione**: setTimeout/setInterval sono sufficienti e idiomatici per questo caso d'uso.

---

## 6. Animazioni Apertura Porta e Feedback Visivi

### Decisione
**CSS Transitions + CSS Animations** per feedback visivi, JavaScript per trigger

### Motivazione
- **Performance**: Animazioni CSS hardware-accelerate (GPU)
- **Smoothness**: 60fps garantiti con `transform` e `opacity`
- **Separazione Responsabilità**: CSS per presentazione, JS per logica
- **Nessuna Dipendenza**: Nativo browser, zero librerie
- **Facilità Manutenzione**: Animazioni dichiarative in CSS

### Implementazione Proposta

```css
/* animations.css */
.porta {
  transform: translateY(0);
  transition: transform 1.5s ease-in-out;
}

.porta.aperta {
  transform: translateY(-100%); /* Scorre verso l'alto */
}

@keyframes pulse-success {
  0%, 100% { background-color: #28a745; }
  50% { background-color: #5cb85c; }
}

.display.successo {
  animation: pulse-success 0.5s ease 3; /* Pulsa 3 volte */
}

.btn-moneta:active {
  transform: scale(0.95);
  transition: transform 0.1s;
}
```

```javascript
// porta.js
class Porta {
  apri() {
    log.info('Apertura porta...');
    this.elemento.classList.add('aperta');
    setTimeout(() => this.chiudi(), 15000); // Chiude dopo 15s
  }

  chiudi() {
    log.info('Chiusura porta');
    this.elemento.classList.remove('aperta');
  }
}
```

### Alternative Considerate

| Approccio | Pro | Contro | Perché Rifiutato |
|-----------|-----|--------|------------------|
| Canvas/WebGL | Effetti complessi possibili | Overkill, complessità elevata, no accessibilità | Eccessivo per semplici animazioni UI |
| Libreria (GSAP, anime.js) | Timeline complesse, easing avanzati | Dimensione (GSAP ~40KB), viola Principio III | Feature non necessarie, overhead |
| JavaScript setInterval + style | Controllo granulare | Performance peggiore, jank, 60fps non garantiti | CSS nativo più performante |

**Conclusione**: CSS Transitions/Animations forniscono tutto il necessario con performance ottimali.

---

## Riepilogo Tecnologie Scelte

| Componente | Tecnologia | Dimensione | Motivazione Principale |
|------------|-----------|------------|------------------------|
| Logging | loglevel | 4KB | Livelli configurabili, minimo overhead |
| Stato Chiosco | FSM vanilla JS | 0KB | Sicurezza transizioni, chiarezza |
| Validazione Codici | Logica hardcoded (1-99, VISA) | 0KB | Semplicità massima, nessuno storage |
| Input QR | Campo testo HTML | 0KB | Adeguato per mockup, zero dipendenze |
| Timer | setTimeout/setInterval | 0KB | Nativo, sufficiente per UI |
| Animazioni | CSS Transitions/Animations | 0KB | Hardware-accelerate, performanti |

**Totale Dipendenze Esterne**: 4KB (solo loglevel)

**Conformità Costituzione**:
- ✅ Principio II (Static-First): Nessun backend, nessuno storage esterno
- ⚠️ Principio III (Vanilla JS): 1 libreria (loglevel per Principio V)
- ✅ Principio IV (Build-Free): Nessun build step
- ✅ Principio V (Osservabilità): Logging configurabile

**Semplificazioni Mockup**:
- Nessun LocalStorage/IndexedDB necessario
- Validazione codici tramite semplice logica condizionale
- Pattern VISA simulato (inizio con "4")
