# Ricerca Tecnica: Chiusura Porta su Passaggio Persona

**Feature**: 002-la-porta-deve
**Data**: 2025-10-16
**Riferimento**: [plan.md](./plan.md)

## Panoramica

Questo documento contiene le decisioni tecniche per l'implementazione della funzionalità "Chiusura Porta su Passaggio Persona". Tutte le decisioni sono orientate a mantenere compatibilità con la feature esistente 001-un-mockup-che e rispettare i principi costituzionali del progetto.

## Decisioni Tecniche

### Decisione 1: Integrazione con FSM Esistente

**Problema**: Come integrare la chiusura manuale nel sistema FSM esistente?

**Opzioni Valutate**:

| Opzione | Pro | Contro |
|---------|-----|--------|
| A. Nuovo stato CHIUSURA_MANUALE | Separazione chiara tra chiusura automatica e manuale | Complica FSM, richiede nuove transizioni da/verso questo stato |
| B. Nuova transizione da PORTA_APERTA | Semplice, riutilizza logica chiusura esistente | Meno tracciabilità motivo chiusura |
| C. Flag interno in PORTA_APERTA | Minime modifiche FSM | Logica nascosta, difficile da debuggare |

**Decisione**: **Opzione B - Nuova transizione da PORTA_APERTA a IDLE**

**Rationale**:
- Mantiene FSM semplice (nessun nuovo stato)
- Riutilizza completamente la logica di chiusura porta esistente (metodo `porta.chiudi()`)
- Tracciabile tramite log: transizione esplicita `PORTA_APERTA → IDLE` con evento `passaggio_persona`
- Compatibile con chiusura automatica esistente (entrambi portano a `IDLE` dopo chiusura)
- Facile da testare: verificare che transizione avvenga correttamente

**Implementazione**:
```javascript
// In chiosco.js, aggiungere a transizioniPermesse
'PORTA_APERTA': ['IDLE']  // già presente per chiusura automatica

// Nuovo metodo event handler
onPassaggioPersona() {
  log.info('🚶 Passaggio persona rilevato...');
  this.porta.chiudiManuale();
  // La porta chiamerà transizione('IDLE') dopo chiusura
}
```

---

### Decisione 2: Gestione Timer Chiusura Automatica

**Problema**: Come gestire il timer di chiusura automatica (15s) quando l'utente clicca "Persona passata"?

**Opzioni Valutate**:

| Opzione | Pro | Contro |
|---------|-----|--------|
| A. Cancellare timer con clearTimeout | Pulito, previene esecuzione duplicata | Richiede accesso a timerID |
| B. Override timer lasciandolo scadere | Nessuna modifica timer | Timer inutile continua a girare, spreco risorse |
| C. Flag "chiusuraManuale" per ignorare timer | Semplice da implementare | Logica condizionale aggiuntiva, poco chiaro |

**Decisione**: **Opzione A - Cancellare timer con clearTimeout**

**Rationale**:
- Pulito e deterministico: timer non esiste più dopo click manuale
- Previene race condition se timer scade mentre chiusura manuale in corso
- Coerente con pattern esistente `GestoreTimeout` (usa già clearTimeout/clearInterval)
- Logging chiaro: `[DEBUG] Timer chiusura automatica cancellato - motivo: passaggio manuale`
- Performance: libera risorse immediatamente

**Implementazione**:
```javascript
// In porta.js, aggiungere attributo
this.timerChiusuraAutomatica = null;

// In porta.apri()
this.timerChiusuraAutomatica = setTimeout(() => { ... }, 15000);

// Nuovo metodo porta.chiudiManuale()
chiudiManuale() {
  if (this.timerChiusuraAutomatica) {
    clearTimeout(this.timerChiusuraAutomatica);
    this.timerChiusuraAutomatica = null;
    log.debug('⏱️ Timer chiusura automatica cancellato');
  }
  this.chiudi(); // Chiama metodo chiusura esistente
}
```

---

### Decisione 3: Posizionamento Pulsante UI

**Problema**: Dove posizionare il pulsante "Persona passata" nell'interfaccia?

**Opzioni Valutate**:

| Opzione | Pro | Contro |
|---------|-----|--------|
| A. Vicino/sotto la porta | Associazione visiva immediata | Potrebbe interferire con visualizzazione porta |
| B. Area separata (es. sotto display) | Non interferisce con layout esistente | Meno associazione visiva con porta |
| C. Overlay sulla porta quando aperta | Massima associazione, non occupa spazio permanente | Complessità CSS maggiore |

**Decisione**: **Opzione A - Vicino/sotto la porta**

**Rationale**:
- Associazione visiva chiara: utente capisce immediatamente che pulsante controlla la porta
- Layout semplice: aggiunta sotto elemento `.porta-status` esistente
- Nessuna complessità CSS overlay
- Spazio disponibile: area porta ha già layout verticale (porta, status, pulsante)
- Responsive: scala naturalmente con risoluzione schermo

**Implementazione HTML**:
```html
<!-- In index.html, dentro .porta-area dopo .porta-status -->
<button class="btn-passaggio hidden" id="btn-passaggio-persona">
  🚶 Persona passata
</button>
```

---

### Decisione 4: Visibilità Condizionale Pulsante

**Problema**: Come mostrare/nascondere il pulsante in base allo stato FSM?

**Opzioni Valutate**:

| Opzione | Pro | Contro |
|---------|-----|--------|
| A. Classe CSS `.hidden` gestita da JavaScript | Separazione logica/presentazione, transizioni CSS | Richiede aggiunta/rimozione classe |
| B. `display: none` via JavaScript inline | Controllo diretto, nessuna classe | Mescola logica e stile, no transizioni CSS |
| C. CSS puro con data-attribute su parent | Nessun JavaScript per visibilità | Logica CSS complessa, meno esplicito |

**Decisione**: **Opzione A - Classe CSS `.hidden` gestita da JavaScript**

**Rationale**:
- Coerente con pattern esistente (usato per aree carta, input QR, ecc.)
- Separazione concerns: CSS definisce comportamento `.hidden`, JS controlla stato
- Transizioni CSS possibili (fade in/out) se desiderato
- Debugging facile: ispezionare elemento in DevTools mostra classe
- Riutilizzabile: classe `.hidden` già definita in `components.css`

**Implementazione**:
```javascript
// In chiosco.js, onEntraPortaAperta()
const btnPassaggio = document.getElementById('btn-passaggio-persona');
if (btnPassaggio) btnPassaggio.classList.remove('hidden');

// In chiosco.js, onEntraIDLE()
if (btnPassaggio) btnPassaggio.classList.add('hidden');
```

**CSS**:
```css
/* In components.css, già esistente */
.hidden {
  display: none;
}

/* Opzionale: transizione fade */
.btn-passaggio {
  opacity: 1;
  transition: opacity 0.3s ease;
}
.btn-passaggio.hidden {
  opacity: 0;
  display: none;
}
```

---

### Decisione 5: Tracking Tempo Apertura Porta

**Problema**: Come tracciare tempo trascorso dall'apertura porta per logging?

**Opzioni Valutate**:

| Opzione | Pro | Contro |
|---------|-----|--------|
| A. Nuovo attributo `timestampApertura` | Semplice, preciso | Stato aggiuntivo da mantenere |
| B. Calcolo runtime da log | Nessuno stato aggiuntivo | Impreciso, dipende da logging |
| C. Performance.now() all'apertura | Alta precisione (microsec) | Overkill per scopo, complessità |

**Decisione**: **Opzione A - Attributo `timestampApertura` (Date.now())**

**Rationale**:
- Semplice e leggibile: `Date.now()` restituisce milliseconds Unix timestamp
- Precisione sufficiente: secondi sono abbastanza per logging passaggio persona
- Facile da calcolare: `Math.floor((Date.now() - this.timestampApertura) / 1000)` per secondi
- Resettabile: `this.timestampApertura = null` in `porta.chiudi()`
- Compatibile con logging: timestamp standard per correlazione eventi

**Implementazione**:
```javascript
// In porta.js
class Porta {
  constructor() {
    this.stato = 'CHIUSA';
    this.timestampApertura = null;  // NUOVO
    this.motivoApertura = null;     // NUOVO: 'monete' | 'carta' | 'qr' | 'carta-autorizzata'
  }

  apri(motivo = 'pagamento') {
    this.stato = 'APERTA';
    this.timestampApertura = Date.now();  // NUOVO
    this.motivoApertura = motivo;         // NUOVO
    // ... resto logica apertura
  }

  chiudiManuale() {
    const tempoAperturaSeconds = Math.floor((Date.now() - this.timestampApertura) / 1000);
    log.info(`🚶 Passaggio persona rilevato - Porta aperta da ${tempoAperturaSeconds}s - Metodo: ${this.motivoApertura}`);

    // Cancella timer e chiudi
    if (this.timerChiusuraAutomatica) {
      clearTimeout(this.timerChiusuraAutomatica);
      this.timerChiusuraAutomatica = null;
    }
    this.chiudi();
  }

  chiudi() {
    this.stato = 'CHIUSA';
    this.timestampApertura = null;  // RESET
    this.motivoApertura = null;     // RESET
    // ... resto logica chiusura
  }
}
```

---

### Decisione 6: Gestione Click Multipli

**Problema**: Come prevenire comportamenti errati se utente clicca "Persona passata" più volte rapidamente?

**Opzioni Valutate**:

| Opzione | Pro | Contro |
|---------|-----|--------|
| A. Debouncing (lodash debounce o custom) | Pattern consolidato | Aggiunge dipendenza (lodash) o codice custom |
| B. Flag `chiusuraInCorso` | Semplice, nessuna dipendenza | Stato aggiuntivo, logica condizionale |
| C. Disabilitare pulsante dopo primo click | UX chiaro, nessuna complessità | Richiede re-abilitazione corretta |

**Decisione**: **Opzione C - Disabilitare pulsante dopo primo click**

**Rationale**:
- UX ottimale: pulsante visivamente disabilitato comunica "azione in corso"
- Semplice da implementare: `btn.disabled = true` in event handler
- Nessuna dipendenza esterna
- Auto-pulizia: pulsante già nascosto al ritorno a IDLE (no need re-abilitazione esplicita)
- Accessibilità: browser gestisce nativamente pulsanti disabilitati
- Coerente con pattern esistente: altri pulsanti disabilitati durante operazioni

**Implementazione**:
```javascript
// In app.js, event handler pulsante passaggio
const btnPassaggio = document.getElementById('btn-passaggio-persona');
if (btnPassaggio) {
  btnPassaggio.addEventListener('click', function() {
    log.debug('🖱️ Click "Persona passata"');

    // Disabilita immediatamente
    this.disabled = true;

    // Aggiungi animazione click
    this.classList.add('clicked');
    setTimeout(() => this.classList.remove('clicked'), 200);

    // Transizione chiusura manuale
    chiosco.onPassaggioPersona();

    // Nota: non serve re-abilitare - pulsante nascosto quando torna IDLE
  });
}
```

**CSS**:
```css
/* In components.css */
.btn-passaggio:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## Dipendenze Identificate

### Dipendenze da Feature 001

- **Chiosco FSM** (`chiosco.js`): Sistema FSM esistente con transizioni definite
- **Porta** (`porta.js`): Componente porta con metodi `apri()` e `chiudi()`
- **Display** (`display.js`): Componente display con `mostraMessaggio()`
- **Logger** (`logger.js`): Wrapper loglevel per logging eventi
- **CSS Components** (`components.css`): Stili componenti hardware, classe `.hidden`

### Integrazione Backward-Compatible

Tutte le modifiche sono **additive** (nessuna breaking change):

1. **Chiosco FSM**: Aggiunta nuova transizione permessa (già supportata da architettura)
2. **Porta**: Aggiunti nuovi metodi/attributi, metodi esistenti NON modificati
3. **Display**: Aggiunto nuovo messaggio, messaggi esistenti NON modificati
4. **HTML**: Aggiunto nuovo pulsante, layout esistente NON modificato
5. **CSS**: Aggiunta nuova classe `.btn-passaggio`, stili esistenti NON modificati
6. **Event Handlers**: Aggiunto nuovo handler, handlers esistenti NON modificati

**Test Regressione**: Verificare che feature 001 funzioni identicamente (pagamento monete, carta, QR, autorizzazioni, timeout 20s inattività).

---

## Alternative Respinte

### Alternative Respinte: Sensore Automatico Simulato

**Cosa**: Simulare sensore di passaggio automatico (es. dopo 3-4s dall'apertura, chiusura automatica anticipata)

**Perché Respinta**:
- Utente ha richiesto esplicitamente "pulsante" per simulazione
- Sensore automatico rimuoverebbe controllo utente
- Testing più difficile (timing non deterministico)
- UX meno chiara: utente non capisce perché porta si chiude "da sola" prima di 15s

### Alternative Respinte: Animazione Countdown Visivo

**Cosa**: Mostrare countdown visivo (progress bar, cerchio) che indica tempo rimanente 15s

**Perché Respinta**:
- Out-of-scope per questa feature (focus su chiusura manuale)
- Complessità UI aggiuntiva
- Può essere feature separata futura se richiesta

### Alternative Respinte: Conferma Chiusura

**Cosa**: Dialog "Sei sicuro di aver attraversato?" prima di chiudere porta

**Perché Respinta**:
- Rallenta esperienza utente (richiede click aggiuntivo)
- Poco realistico: sensore reale non chiede conferma
- Viola SC-003 (chiusura entro 2s)

---

## Rischi e Mitigazioni

### Rischio 1: Race Condition Timer

**Rischio**: Timer 15s scade esattamente mentre utente clicca "Persona passata"

**Probabilità**: Bassa (window di 50-100ms)

**Impatto**: Medio (doppia chiusura, possibile errore)

**Mitigazione**:
- Metodo `porta.chiudi()` deve essere idempotente (controllare `if (this.stato === 'CHIUSA') return;`)
- Cancellare timer PRIMA di chiamare `chiudi()` in `chiudiManuale()`
- Test specifico per questo scenario (difficile ma possibile con setTimeout mock)

### Rischio 2: Pulsante Visibile in Stato Sbagliato

**Rischio**: Bug nel codice lascia pulsante visibile durante IDLE o PAGAMENTO

**Probabilità**: Media (errore umano)

**Impatto**: Alto (confusione utente, comportamento inatteso)

**Mitigazione**:
- Test US2 completo per verificare visibilità in tutti gli stati
- Code review: verificare tutti i punti dove pulsante dovrebbe essere nascosto
- Logging: `log.debug('Pulsante passaggio nascosto/visibile')` per tracciare cambiamenti

### Rischio 3: Breaking Change a Feature 001

**Rischio**: Modifiche a `chiosco.js` o `porta.js` rompono funzionalità esistenti

**Probabilità**: Bassa (modifiche additive)

**Impatto**: Critico (feature 001 non funziona più)

**Mitigazione**:
- Test regressione completo feature 001 prima del commit
- Nessuna modifica a metodi esistenti, solo aggiunte
- Code review: verificare nessun side effect

---

## Conclusioni

Tutte le decisioni tecniche sono orientate a:
1. **Semplicità**: Modifiche minimali, riutilizzo codice esistente
2. **Compatibilità**: Nessun breaking change a feature 001
3. **Testabilità**: Scenari chiari e verificabili
4. **Conformità Costituzionale**: JavaScript vanilla, build-free, logging completo

Prossimi passi: Fase 1 (data-model.md, quickstart.md)
