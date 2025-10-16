# Modello Dati: Chiusura Porta su Passaggio Persona

**Feature**: 002-la-porta-deve
**Data**: 2025-10-16
**Riferimento**: [plan.md](./plan.md), [research.md](./research.md)

## Panoramica

Questo documento descrive le modifiche al modello dati per supportare la funzionalità "Chiusura Porta su Passaggio Persona". Le modifiche sono **additive** e **backward-compatible** con la feature 001-un-mockup-che.

## Entità Modificate

### Porta (porta.js)

**Modifiche**: Aggiunti attributi per tracking tempo apertura e motivo

```javascript
class Porta {
  // ATTRIBUTI ESISTENTI (NON MODIFICATI)
  stato: 'APERTA' | 'CHIUSA'
  elementoPorta: HTMLElement        // Riferimento DOM porta
  elementoStatus: HTMLElement       // Riferimento DOM status porta

  // NUOVI ATTRIBUTI
  timestampApertura: number | null  // Timestamp Unix (ms) apertura porta, null se chiusa
  motivoApertura: string | null     // Motivo apertura: 'monete' | 'carta' | 'qr' | 'carta-autorizzata'
  timerChiusuraAutomatica: number | null  // ID del timer setTimeout per chiusura 15s, null se cancellato

  // METODI ESISTENTI (NON MODIFICATI)
  apri(motivo?: string): void       // Apre porta con animazione
  chiudi(): void                    // Chiude porta con animazione

  // NUOVI METODI
  chiudiManuale(): void             // Chiusura manuale su passaggio persona (cancella timer, logga, chiama chiudi())
  getTempoAperturaSeconds(): number // Calcola secondi dall'apertura (Date.now() - timestampApertura) / 1000
}
```

**Relazioni**:
- Chiamato da: `Chiosco` (metodo `onEntraPortaAperta()`, `onPassaggioPersona()`)
- Chiama: `Display.aggiornaStatus()` per aggiornare testo status porta

**Validazione**:
- `timestampApertura` deve essere `null` quando `stato === 'CHIUSA'`
- `motivoApertura` deve essere uno dei valori permessi o `null`
- `timerChiusuraAutomatica` deve essere ID valido o `null`

**Stato Iniziale**:
```javascript
{
  stato: 'CHIUSA',
  timestampApertura: null,
  motivoApertura: null,
  timerChiusuraAutomatica: null
}
```

**Transizioni Stato**:
1. **CHIUSA → APERTA**: Chiamata `apri(motivo)`
   - Imposta `stato = 'APERTA'`
   - Imposta `timestampApertura = Date.now()`
   - Imposta `motivoApertura = motivo`
   - Avvia `timerChiusuraAutomatica` (15s)

2. **APERTA → CHIUSA (automatica)**: Timer 15s scade
   - Chiama `chiudi()`
   - Resetta `timestampApertura = null`
   - Resetta `motivoApertura = null`
   - Resetta `timerChiusuraAutomatica = null`

3. **APERTA → CHIUSA (manuale)**: Chiamata `chiudiManuale()`
   - Cancella `timerChiusuraAutomatica` con `clearTimeout()`
   - Logga evento passaggio persona con tempo e motivo
   - Chiama `chiudi()` (segue transizione punto 2)

---

### Chiosco FSM (chiosco.js)

**Modifiche**: Aggiunta gestione evento passaggio persona

```javascript
class Chiosco {
  // ATTRIBUTI ESISTENTI (NON MODIFICATI)
  stato: 'IDLE' | 'PAGAMENTO_MONETE' | 'PAGAMENTO_CARTA' | 'VERIFICA_QR' | 'VERIFICA_CARTA' | 'PORTA_APERTA' | 'TIMEOUT'
  transizioniPermesse: Map<string, string[]>
  display: Display
  porta: Porta
  gettoniera: Gettoniera
  lettoreCarte: LettoreCarte
  lettoreQR: LettoreQR
  gestoreTimeout: GestoreTimeout

  // NUOVI ATTRIBUTI
  // Nessuno (gestione evento tramite metodo)

  // METODI ESISTENTI (NON MODIFICATI)
  transizione(nuovoStato, dati): boolean
  onCambioStato(nuovoStato, vecchioStato, dati): void
  onEntraIDLE(): void
  onEntraPagamentoMonete(): void
  onEntraPagamentoCarta(): void
  onEntraVerificaQR(codice): void
  onEntraVerificaCarta(): void
  onEntraPortaAperta(motivo): void  // MODIFICATO INTERNAMENTE: mostra pulsante passaggio
  onEntraTimeout(): void
  abilitaInput(abilitato, eccezioni): void
  verificaPagamento(): void
  reset(): void

  // NUOVI METODI
  onPassaggioPersona(): void        // Gestisce click pulsante "Persona passata"
}
```

**Modifica a `onEntraPortaAperta()`**:
```javascript
onEntraPortaAperta(motivo = 'pagamento') {
  // ... logica esistente (disabilita input, apri porta, mostra messaggio) ...

  // AGGIUNTA: Mostra pulsante "Persona passata"
  const btnPassaggio = document.getElementById('btn-passaggio-persona');
  if (btnPassaggio) {
    btnPassaggio.classList.remove('hidden');
    log.debug('🚶 Pulsante "Persona passata" visibile');
  }

  // ... logica esistente (programma chiusura automatica 15s) ...
}
```

**Nuovo metodo `onPassaggioPersona()`**:
```javascript
onPassaggioPersona() {
  if (this.stato !== 'PORTA_APERTA') {
    log.warn('⚠️ Tentativo passaggio persona in stato non valido:', this.stato);
    return;
  }

  log.info('🚶 Passaggio persona rilevato - Avvio chiusura manuale');

  // Nascondi/disabilita pulsante
  const btnPassaggio = document.getElementById('btn-passaggio-persona');
  if (btnPassaggio) {
    btnPassaggio.disabled = true;
    btnPassaggio.classList.add('hidden');
  }

  // Mostra messaggio feedback
  if (this.display) {
    this.display.mostraMessaggio('Passaggio rilevato - Porta in chiusura', 'info');
  }

  // Chiusura manuale porta (cancella timer, logga, chiude)
  if (this.porta) {
    this.porta.chiudiManuale();
  }

  // Nota: porta.chiudiManuale() chiamerà porta.chiudi() che programma
  // setTimeout 1.5s poi transizione('IDLE') - come chiusura automatica esistente
}
```

**Modifica a `onEntraIDLE()`**:
```javascript
onEntraIDLE() {
  // ... logica esistente (reset timeout, gettoniera, display) ...

  // AGGIUNTA: Nascondi pulsante "Persona passata"
  const btnPassaggio = document.getElementById('btn-passaggio-persona');
  if (btnPassaggio) {
    btnPassaggio.classList.add('hidden');
    btnPassaggio.disabled = false;  // Re-abilita per prossimo ciclo
    log.debug('🚶 Pulsante "Persona passata" nascosto');
  }

  // ... logica esistente (riabilita input) ...
}
```

**Diagramma Transizioni FSM (aggiornato)**:
```
IDLE
 ├─→ PAGAMENTO_MONETE
 ├─→ PAGAMENTO_CARTA
 ├─→ VERIFICA_QR
 └─→ VERIFICA_CARTA

PAGAMENTO_MONETE
 ├─→ PORTA_APERTA (se importo >= 1.20€)
 ├─→ TIMEOUT (se 20s inattività)
 ├─→ PAGAMENTO_CARTA (se click "Paga con Carta")
 └─→ IDLE (reset manuale)

PAGAMENTO_CARTA / VERIFICA_QR / VERIFICA_CARTA
 ├─→ PORTA_APERTA (se successo)
 └─→ IDLE (se fallimento o timeout)

PORTA_APERTA
 ├─→ IDLE (dopo 15s timer automatico)  [ESISTENTE]
 └─→ IDLE (su evento passaggio_persona) [NUOVO]

TIMEOUT
 └─→ IDLE (dopo 2s messaggio timeout)
```

---

### Display (display.js)

**Modifiche**: Aggiunto nuovo messaggio "Passaggio rilevato"

```javascript
class Display {
  // ATTRIBUTI ESISTENTI (NON MODIFICATI)
  elementoDisplay: HTMLElement
  elementoMessaggio: HTMLElement
  elementoImporto: HTMLElement
  elementoCountdown: HTMLElement

  // NUOVI ATTRIBUTI
  // Nessuno

  // METODI ESISTENTI (NON MODIFICATI)
  mostraMessaggioIniziale(): void
  mostraMessaggio(messaggio, tipo): void  // USATO per nuovo messaggio "Passaggio rilevato"
  mostraImporto(importo): void
  aggiornaCountdown(secondi): void
  nascondiCountdown(): void

  // NUOVI METODI
  // Nessuno (riutilizza mostraMessaggio esistente)
}
```

**Nuovo messaggio utilizzato**:
```javascript
// In chiosco.onPassaggioPersona()
display.mostraMessaggio('Passaggio rilevato - Porta in chiusura', 'info');
```

**Catalogo Messaggi Display (aggiornato)**:
- `"Benvenuto - Scegli modalità di accesso"` - Stato IDLE
- `"Inserisci monete"` - Stato PAGAMENTO_MONETE
- `"Rimanente: X,XX €"` - Importo da versare
- `"Avvicina la carta al lettore"` - Stato PAGAMENTO_CARTA
- `"Elaborazione..."` - Transazione carta in corso
- `"Pagamento accettato"` - Transazione carta successo
- `"Pagamento rifiutato - Riprova"` - Transazione carta fallita
- `"Verifica in corso..."` - Verifica QR/carta autorizzata
- `"Accesso autorizzato"` - QR/carta autorizzata valida
- `"Accesso negato"` - QR/carta autorizzata non valida
- `"Accesso consentito - Porta aperta"` - Stato PORTA_APERTA
- **`"Passaggio rilevato - Porta in chiusura"`** - NUOVO: Feedback click pulsante passaggio
- `"Timeout - Operazione annullata"` - Stato TIMEOUT

---

## Nuove Entità

### PulsantePassaggio (HTML + CSS + Event Handler)

**Descrizione**: Componente UI pulsante "Persona passata"

**Struttura HTML**:
```html
<!-- In index.html, dentro .porta-area dopo .porta-status -->
<button class="btn-passaggio hidden" id="btn-passaggio-persona" title="Clicca dopo aver attraversato">
  🚶 Persona passata
</button>
```

**Attributi HTML**:
- `id="btn-passaggio-persona"`: Identificatore unico per JavaScript
- `class="btn-passaggio hidden"`: Classi CSS per stile e visibilità
- `title="..."`: Tooltip esplicativo (nativamente gestito dal browser)

**Stili CSS** (in `components.css`):
```css
.btn-passaggio {
  margin-top: 10px;
  padding: 12px 20px;
  background-color: #4CAF50;  /* Verde - azione positiva */
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-passaggio:hover:not(:disabled) {
  background-color: #45a049;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.btn-passaggio:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-passaggio.clicked {
  transform: scale(0.95);
}

/* Classe helper per nascondere (già esistente, riutilizzata) */
.hidden {
  display: none;
}
```

**Event Handler** (in `app.js`):
```javascript
// Event handler "Persona passata"
const btnPassaggio = document.getElementById('btn-passaggio-persona');
if (btnPassaggio) {
  btnPassaggio.addEventListener('click', function() {
    log.debug('🖱️ Click "Persona passata"');

    // Disabilita immediatamente (previene click multipli)
    this.disabled = true;

    // Aggiungi animazione click
    this.classList.add('clicked');
    setTimeout(() => this.classList.remove('clicked'), 200);

    // Delega gestione a Chiosco FSM
    chiosco.onPassaggioPersona();
  });
}
```

**Stati Pulsante**:
| Stato Chiosco | Visibilità Pulsante | Abilitazione | Note |
|---------------|---------------------|--------------|------|
| IDLE | Nascosto (`.hidden`) | Disabilitato | - |
| PAGAMENTO_MONETE | Nascosto | Disabilitato | - |
| PAGAMENTO_CARTA | Nascosto | Disabilitato | - |
| VERIFICA_QR | Nascosto | Disabilitato | - |
| VERIFICA_CARTA | Nascosto | Disabilitato | - |
| **PORTA_APERTA** | **Visibile** | **Abilitato** | Unico stato in cui pulsante è utilizzabile |
| TIMEOUT | Nascosto | Disabilitato | - |

**Validazione**:
- Pulsante deve essere visibile SOLO in stato PORTA_APERTA
- Click su pulsante disabilitato deve essere ignorato dal browser (comportamento nativo)
- Click su pulsante nascosto è impossibile (non cliccabile se `display: none`)

---

## Flusso Dati Completo

### Scenario: Pagamento con Monete + Chiusura Manuale

```
1. Utente inserisce 1,20€ in monete
   ↓
2. Chiosco.verificaPagamento() → rimanente <= 0
   ↓
3. Chiosco.transizione('PORTA_APERTA', {motivo: 'monete'})
   ↓
4. Chiosco.onEntraPortaAperta('monete')
   ├─→ Porta.apri('monete')
   │   ├─→ porta.stato = 'APERTA'
   │   ├─→ porta.timestampApertura = Date.now()  // es. 1697452800000
   │   ├─→ porta.motivoApertura = 'monete'
   │   └─→ porta.timerChiusuraAutomatica = setTimeout(..., 15000)
   ├─→ Display.mostraMessaggio('Accesso consentito - Porta aperta', 'successo')
   └─→ btnPassaggio.classList.remove('hidden')  // Pulsante VISIBILE

5. [Utente attende 3 secondi]
   ↓
6. Utente clicca pulsante "Persona passata"
   ↓
7. Event handler btnPassaggio
   ├─→ btnPassaggio.disabled = true  // Previene click multipli
   └─→ Chiosco.onPassaggioPersona()
       ├─→ Display.mostraMessaggio('Passaggio rilevato - Porta in chiusura', 'info')
       └─→ Porta.chiudiManuale()
           ├─→ tempoApertura = (Date.now() - 1697452800000) / 1000 = 3s
           ├─→ log.info('Passaggio persona - Porta aperta da 3s - Metodo: monete')
           ├─→ clearTimeout(porta.timerChiusuraAutomatica)  // Cancella timer 15s
           └─→ Porta.chiudi()
               ├─→ porta.stato = 'CHIUSA'
               ├─→ porta.timestampApertura = null
               ├─→ porta.motivoApertura = null
               ├─→ porta.timerChiusuraAutomatica = null
               └─→ setTimeout(() => Chiosco.transizione('IDLE'), 1500)  // Attendi animazione

8. [Dopo 1.5s animazione chiusura]
   ↓
9. Chiosco.transizione('IDLE')
   ↓
10. Chiosco.onEntraIDLE()
    ├─→ btnPassaggio.classList.add('hidden')  // Pulsante NASCOSTO
    ├─→ btnPassaggio.disabled = false  // Re-abilita per prossimo ciclo
    ├─→ Display.mostraMessaggioIniziale()  // "Benvenuto..."
    └─→ Sistema pronto per nuovo utente
```

**Tempo Totale Ciclo**:
- Inserimento monete: ~5s (variabile)
- Tempo utente attraversa: ~3s (variabile)
- Chiusura porta: ~1.5s (animazione)
- **Totale: ~9.5s** (vs ~20s con timer automatico) → **52% riduzione**

---

## Compatibilità Backward

### Feature 001 NON Modificata

Tutte le funzionalità esistenti continuano a funzionare identicamente:

1. **Pagamento Monete**: Funziona come prima, ora con opzione chiusura manuale
2. **Pagamento Carta**: Funziona come prima, ora con opzione chiusura manuale
3. **QR Code Autorizzato**: Funziona come prima, ora con opzione chiusura manuale
4. **Carta Contactless Autorizzata**: Funziona come prima, ora con opzione chiusura manuale
5. **Timeout 20s Inattività**: Funziona come prima (su PAGAMENTO_MONETE)
6. **Chiusura Automatica 15s**: Funziona come prima SE utente non clicca "Persona passata"

### Punti di Estensione

Feature 001 è stata progettata con punti di estensione che facilitano modifiche:

- ✅ `transizioniPermesse`: Mappa estendibile - aggiunto PORTA_APERTA → IDLE (già presente)
- ✅ `Porta.apri(motivo)`: Parametro `motivo` già supportato - ora utilizzato per logging
- ✅ `Display.mostraMessaggio()`: Generico - riutilizzato per nuovo messaggio
- ✅ Classe `.hidden`: Helper CSS riutilizzato per pulsante
- ✅ Pattern event handler: Stesso pattern applicato a pulsante passaggio

### Test Regressione

Prima del commit, verificare:
- [ ] Pagamento monete 1,20€ apre porta (con/senza chiusura manuale)
- [ ] Pagamento carta VISA apre porta (con/senza chiusura manuale)
- [ ] QR code "42" apre porta (con/senza chiusura manuale)
- [ ] Timeout 20s durante pagamento monete funziona
- [ ] Chiusura automatica 15s funziona se utente NON clicca pulsante
- [ ] Tutti i log esistenti presenti e corretti

---

## Conclusioni

Modifiche al modello dati:
- **2 entità modificate**: Porta (3 attributi + 2 metodi), Chiosco (1 metodo + modifiche a 2 metodi esistenti)
- **1 entità riutilizzata**: Display (nessuna modifica)
- **1 nuova entità**: PulsantePassaggio (HTML + CSS + Event Handler)

Tutte le modifiche sono **additive** e **backward-compatible**. Nessuna breaking change.

Prossimi passi: Quickstart.md per guida uso rapido
