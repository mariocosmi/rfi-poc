# Guida Rapida: Simulatore Chiosco Ingresso

**Funzionalità**: Simulatore Chiosco Ingresso
**Data**: 2025-10-15
**Fase**: 1 - Design e Quickstart

## Panoramica

Questa guida ti aiuterà a utilizzare il simulatore chiosco ingresso in pochi minuti. Il simulatore è un'applicazione web statica che simula un chiosco di pagamento con display, gettoniera, lettori di carte/QR e porta controllata.

---

## Requisiti

- **Browser Moderno**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Risoluzione Schermo**: Minimo 1024x768 pixel
- **JavaScript Abilitato**: Richiesto per tutte le funzionalità interattive

---

## Avvio Rapido

### Opzione 1: Apertura Diretta (File System)

1. Naviga alla directory del progetto
2. Apri `index.html` nel browser:
   - **Windows**: Doppio click su `index.html`
   - **macOS**: Doppio click su `index.html` o `open index.html` da terminale
   - **Linux**: `xdg-open index.html` o doppio click

### Opzione 2: Server HTTP Locale (Raccomandato)

```bash
# Opzione A: Python (se installato)
python3 -m http.server 8000

# Opzione B: Node.js (se installato)
npx http-server -p 8000

# Opzione C: PHP (se installato)
php -S localhost:8000
```

Poi apri browser all'indirizzo: `http://localhost:8000`

---

## Regole di Validazione Hardcoded

Il simulatore utilizza regole hardcoded per validare accessi, nessuna configurazione necessaria:

### Codici QR/Carte Autorizzate

**Regola**: Accetta qualsiasi numero da **1 a 99**

**Esempi Validi**:
- `"1"` ✅
- `"42"` ✅
- `"99"` ✅

**Esempi Non Validi**:
- `"0"` ❌ (fuori range)
- `"100"` ❌ (fuori range)
- `"ABC"` ❌ (non numerico)

### Carte di Credito per Pagamenti

**Regola**: Accetta solo carte **VISA** (numero inizia con "4")

**Esempi Validi**:
- `"4111111111111111"` ✅ (VISA test card)
- `"4012888888881881"` ✅
- `"4222222222222"` ✅

**Esempi Non Validi**:
- `"5500000000000004"` ❌ (Mastercard - inizia con 5)
- `"340000000000009"` ❌ (Amex - inizia con 3)
- `"6011000000000004"` ❌ (Discover - inizia con 6)

---

## Utilizzo Simulatore

### Schermata Iniziale

All'avvio vedrai:
- **Display** centrale con messaggio "Benvenuto - Scegli modalità di accesso"
- **Gettoniera** con pulsanti monete (1€, 0,50€, 0,20€, 0,10€, 0,05€, 0,02€, 0,01€)
- **Lettore Carte** con pulsanti "Paga con Carta" e "Verifica Carta Autorizzata"
- **Lettore QR** con campo input e pulsante "Scansiona QR"
- **Porta** visualizzata come chiusa

---

### Scenario 1: Pagamento con Monete (MVP - P1)

**Obiettivo**: Versare 1,20€ con monete per aprire la porta.

1. **Click su pulsante moneta** (es. 0,50€)
   - Display aggiorna: `"Rimanente: 0,70 €"`
   - Timer timeout 20s si avvia (countdown visibile)

2. **Continua inserimento monete** fino a raggiungere 1,20€
   - Es. 0,50€ → 0,50€ → 0,20€
   - Display aggiorna progressivamente: `0,70 €` → `0,20 €` → `0,00 €`

3. **Porta si apre automaticamente**
   - Display mostra: `"Accesso consentito - Porta aperta"`
   - Animazione apertura porta (scorrimento verso l'alto)
   - Timer chiusura automatica 15s attivo

4. **Porta si chiude dopo 15s**
   - Porta torna in posizione chiusa
   - Sistema ritorna a stato iniziale automaticamente

**Note**:
- Sovrapagamento permesso (es. inserire 1,50€ apre la porta, nessun resto)
- Se dopo 20s di inattività il pagamento non è completato, sistema resetta automaticamente
- Durante pagamento monete, è possibile passare a "Paga con Carta" (azzera monete inserite)

---

### Scenario 2: Pagamento con Carta di Credito (P2)

**Obiettivo**: Pagare 1,20€ con carta di credito contactless.

1. **Click su "Paga con Carta"**
   - Display mostra: `"Avvicina la carta al lettore"`
   - Altri metodi di input disabilitati (pulsanti grigi)

2. **Click su area lettore carte** (simula avvicinamento carta)
   - Display mostra: `"Elaborazione..."`
   - Simulazione delay 1-2 secondi

3. **Esito transazione** (randomizzato 80% successo):
   - **Successo**: Display `"Pagamento accettato"` → Porta si apre (come Scenario 1)
   - **Fallimento**: Display `"Pagamento rifiutato - Riprova"` → Torna a stato iniziale

4. Se successo, porta chiude dopo 15s e sistema resetta

**Note**:
- Transazione simulata client-side (random success/fail)
- Durante elaborazione, impossibile annullare o usare altri input
- Se si allontana carta prima di completamento (click fuori area), transazione annullata

---

### Scenario 3: Accesso con QR Code Autorizzato (P3)

**Obiettivo**: Mostrare QR code autorizzato per accesso senza pagamento.

**Prerequisito**: Nessuno - regole hardcoded nel codice

1. **Digita codice numerico nel campo QR** (es. "42")
   - Usa qualsiasi numero da 1 a 99

2. **Click "Scansiona QR"**
   - Sistema valida codice contro regola hardcoded (1-99)
   - Altri input disabilitati durante verifica

3. **Esito verifica**:
   - **Autorizzato** (1-99): Display `"Accesso autorizzato"` → Porta si apre immediatamente
   - **Non autorizzato** (fuori range): Display `"Accesso negato"` → Torna a stato iniziale
   - **Errore**: Display `"Errore lettura QR"` (se non numerico o malformato)

4. Se autorizzato, porta chiude dopo 15s e sistema resetta

**Codici da Testare**:
- `"1"` ✅ Autorizzato
- `"42"` ✅ Autorizzato
- `"99"` ✅ Autorizzato
- `"0"` ❌ Non autorizzato
- `"100"` ❌ Non autorizzato
- `"ABC"` ❌ Errore lettura

**Note**:
- Solo numeri 1-99 validi
- Parsing automatico tramite parseInt

---

### Scenario 4: Accesso con Carta Contactless Autorizzata (P3)

**Obiettivo**: Verificare carta contactless autorizzata per accesso senza pagamento.

**Prerequisito**: Stesse regole QR (numeri 1-99)

1. **Click "Verifica Carta Autorizzata"**
   - Display mostra: `"Inserisci codice carta autorizzata"`
   - Altri input disabilitati

2. **Inserisci codice numerico** (es. "42") e **Click "Verifica"**
   - Sistema valida codice contro regola hardcoded (1-99)
   - Stessa logica validazione QR code

3. **Esito verifica**:
   - **Autorizzato** (1-99): Display `"Accesso autorizzato"` → Porta apre
   - **Non autorizzato**: Display `"Accesso negato - Effettua pagamento"` → Torna a IDLE
   - **Errore lettura**: Display `"Errore lettura carta"` → Torna a IDLE

4. Se autorizzato, porta chiude dopo 15s

**Codici Carta da Testare**:
- `"1"` ✅ Autorizzato
- `"50"` ✅ Autorizzato
- `"99"` ✅ Autorizzato
- `"0"` ❌ Non autorizzato
- `"200"` ❌ Non autorizzato

---

## Testing Validazione Codici

### Testare Validazione QR/Carte Autorizzate

Console browser:
```javascript
// Test validazione codici (1-99)
Validatore.isCodiceAutorizzato("42");   // true
Validatore.isCodiceAutorizzato("1");    // true
Validatore.isCodiceAutorizzato("99");   // true
Validatore.isCodiceAutorizzato("0");    // false
Validatore.isCodiceAutorizzato("100");  // false
Validatore.isCodiceAutorizzato("ABC");  // false
```

### Testare Validazione Carte VISA

Console browser:
```javascript
// Test validazione VISA (inizia con "4")
Validatore.isCartaVISA("4111111111111111"); // true
Validatore.isCartaVISA("5500000000000004"); // false (Mastercard)
Validatore.isCartaVISA("340000000000009");  // false (Amex)

// Test validazione carta completa (VISA + lunghezza)
Validatore.isCartaValida("4111111111111111"); // true
Validatore.isCartaValida("4222");             // false (troppo corta)
```

### Modificare Regole (Solo per Testing Locale)

Per modificare temporaneamente le regole durante testing, ridefinisci metodi Validatore nella console:

```javascript
// Esempio: accetta codici 1-999 invece di 1-99
Validatore.isCodiceAutorizzato = function(codice) {
  const num = parseInt(codice, 10);
  return !isNaN(num) && num >= 1 && num <= 999;
};

// Esempio: accetta tutte le carte (non solo VISA)
Validatore.isCartaVISA = function(numeroCarta) {
  return true; // Accetta tutto
};
```

**Nota**: Modifiche console NON permanenti, reset al reload pagina.

---

## Logging e Debugging

Il simulatore utilizza `loglevel` per logging completo su console browser.

### Aprire Console

- **Chrome/Edge**: `F12` → tab **Console**
- **Firefox**: `F12` → tab **Console**
- **Safari**: `Cmd+Option+C`

### Livelli di Log Disponibili

Default: `INFO` (mostra info, warn, error)

```javascript
// Cambiare livello log
log.setLevel('debug'); // Mostra tutto (debug, info, warn, error)
log.setLevel('warn');  // Solo warning e errori
log.setLevel('error'); // Solo errori

// Il livello persiste in LocalStorage automaticamente
```

### Esempio Output Console

```
[INFO] Transizione: IDLE → PAGAMENTO_MONETE
[DEBUG] Moneta inserita: 0.50€, totale: 0.50€, rimanente: 0.70€
[INFO] Display aggiornato: "Rimanente: 0,70 €"
[DEBUG] Timer timeout avviato: 20 secondi
[DEBUG] Countdown: 19 secondi rimanenti
[INFO] Moneta inserita: 0.50€, totale: 1.00€, rimanente: 0.20€
[INFO] Moneta inserita: 0.20€, totale: 1.20€, rimanente: 0.00€
[INFO] Pagamento completato, transizione: PAGAMENTO_MONETE → PORTA_APERTA
[INFO] Apertura porta...
[DEBUG] Timer chiusura porta impostato: 15 secondi
```

---

## Troubleshooting

### Problema: Carta di credito rifiutata

**Causa**: Carta non VISA (non inizia con "4")

**Debug**:
```javascript
// Console browser
const numeroCarta = "5500000000000004";
console.log('È VISA?', Validatore.isCartaVISA(numeroCarta));
console.log('Primo carattere:', numeroCarta[0]);
```

**Soluzione**:
- Usa solo carte VISA (numero inizia con "4")
- Esempi VISA validi: "4111111111111111", "4012888888881881" ✅
- Esempi non VISA: "5500..." (Mastercard), "3400..." (Amex) ❌

---

### Problema: Porta non si apre dopo pagamento

**Debug**:
1. Apri console browser (F12)
2. Verifica log per errori
3. Controlla stato: `chiosco.stato` nella console
4. Verifica importo: `chiosco.gettoniera.getImportoRimanente()` deve essere `0`

**Soluzione**:
- Ricarica pagina (`F5`)
- Verifica JavaScript non bloccato da estensioni browser
- Controlla console per errori script

---

### Problema: QR code sempre "Accesso negato"

**Causa**: Codice fuori range 1-99 o non numerico

**Debug**:
```javascript
// Console browser
const codiceTentativo = "42";
console.log('Codice valido?', Validatore.isCodiceAutorizzato(codiceTentativo));
console.log('Parsing:', parseInt(codiceTentativo, 10));
```

**Soluzione**:
- Verifica codice sia numero tra 1 e 99
- Esempi validi: "1", "42", "99" ✅
- Esempi non validi: "0", "100", "ABC", "A42" ❌

---

### Problema: Timeout troppo veloce/lento

**Personalizzazione**:
```javascript
// Console browser - modifica durata timeout (in secondi)
// Nota: reset al prossimo reload
chiosco.gestoreTimeout.durata = 30000; // 30 secondi invece di 20
```

Per cambiare permanentemente, modifica `js/chiosco.js`:
```javascript
this.gestoreTimeout = new GestoreTimeout(this, 30); // 30 secondi
```

---

### Problema: Browser non supportato

**Verifica Compatibilità**:
- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅
- IE11 ❌ (non supportato)

**Aggiorna Browser**: Scarica ultima versione dal sito ufficiale

---

## Shortcuts e Comandi Rapidi Console

```javascript
// Reset completo simulatore
chiosco.reset();

// Apri porta manualmente (bypass pagamento - solo debug)
chiosco.porta.apri();

// Chiudi porta manualmente
chiosco.porta.chiudi();

// Cambia stato chiosco (attenzione: può causare stati inconsistenti)
chiosco.transizione('PORTA_APERTA');

// Test validazione rapida
Validatore.isCodiceAutorizzato('42');           // true
Validatore.isCartaVISA('4111111111111111');     // true

// Simula pagamento carta riuscito
chiosco.lettoreCarte.statoTransazione = 'ACCETTATA';
chiosco.transizione('PORTA_APERTA');
chiosco.porta.apri();
```

---

## Prossimi Passi

Dopo aver familiarizzato con il simulatore:

1. **Esplora Codice Sorgente**:
   - `js/chiosco.js` - Macchina a stati principale
   - `js/display.js` - Logica display
   - `js/gettoniera.js` - Gestione monete

2. **Personalizza UI**:
   - `css/components.css` - Stili componenti
   - `css/animations.css` - Animazioni porta/feedback

3. **Estendi Funzionalità**:
   - Aggiungi nuovi tagli monete
   - Personalizza messaggi display
   - Modifica durate timer

4. **Genera Task di Implementazione**:
   ```bash
   /speckit.tasks
   ```
   Genera lista task dettagliata per implementare il simulatore

---

## Supporto

Per domande o problemi:
- Consulta `data-model.md` per dettagli implementazione
- Consulta `research.md` per decisioni tecniche
- Apri issue nel repository progetto
