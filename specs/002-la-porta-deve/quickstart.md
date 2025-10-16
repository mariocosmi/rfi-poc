# Quickstart: Chiusura Porta su Passaggio Persona

**Feature**: 002-la-porta-deve
**Data**: 2025-10-16
**Riferimento**: [plan.md](./plan.md)

## Introduzione

Questa guida rapida spiega come testare e utilizzare la nuova funzionalità "Chiusura Porta su Passaggio Persona". La feature permette agli utenti di chiudere manualmente la porta cliccando un pulsante dopo aver attraversato il varco, riducendo i tempi di attesa da 15s a ~4-5s.

## Requisiti

- Browser moderno (Chrome, Firefox, Safari, Edge - ultime 2 versioni)
- Feature 001-un-mockup-che implementata e funzionante
- File modificati per feature 002 (vedi Installazione)

## Installazione

1. Checkout branch feature:
```bash
git checkout 002-la-porta-deve
```

2. Aprire `index.html` nel browser:
```bash
# Opzione 1: Aprire direttamente il file
open index.html  # macOS
xdg-open index.html  # Linux
start index.html  # Windows

# Opzione 2: Server HTTP (consigliato)
python3 -m http.server 8000
# Visita: http://localhost:8000
```

3. Aprire DevTools Console (F12) per vedere log

## Utilizzo Base

### Scenario Tipico: Pagamento + Chiusura Manuale

1. **Apri il simulatore** nel browser
   - Dovresti vedere schermata iniziale "Benvenuto - Scegli modalità di accesso"

2. **Completa un pagamento** (qualsiasi metodo):
   - **Monete**: Click moneta 1,00€, poi 0,20€
   - **Carta**: Click "Paga con Carta", poi click area lettore
   - **QR**: Inserisci "42" nel campo QR, click "Scansiona QR"
   - **Carta Autorizzata**: Click "Verifica Carta Autorizzata", inserisci "50", click "Verifica"

3. **Porta si apre** → Visualizzi:
   - Porta con animazione apertura (scorre verso l'alto)
   - Status "🔓 Aperta"
   - **Pulsante "🚶 Persona passata" VISIBILE** (sotto lo status)

4. **Simula attraversamento**:
   - Attendi 2-4 secondi (simula tempo per attraversare)

5. **Click "Persona passata"**:
   - Pulsante diventa grigio (disabilitato)
   - Display mostra "Passaggio rilevato - Porta in chiusura"
   - Porta inizia animazione chiusura
   - Console log: `[INFO] Passaggio persona rilevato - Porta aperta da Xs - Metodo: [metodo]`

6. **Porta si chiude** (~1.5s):
   - Porta torna in posizione chiusa
   - Status "🔒 Chiusa"
   - Pulsante "Persona passata" NASCOSTO
   - Display torna a "Benvenuto..."

7. **Sistema pronto per nuovo utente**

**Tempo Totale**: ~9-10s (vs ~20s con timer automatico)

---

## Verifica Funzionalità

### Test 1: Pulsante Visibile Solo Quando Porta Aperta

✅ **Comportamento Atteso**: Pulsante "Persona passata" visibile SOLO quando porta aperta

**Passi**:
1. Stato IDLE → Pulsante NASCOSTO
2. Inserisci 0,50€ monete → Pulsante ANCORA NASCOSTO
3. Inserisci altri 0,70€ → Porta si apre → Pulsante VISIBILE
4. Click "Persona passata" → Porta si chiude → Pulsante NASCOSTO

**Console Verifica**:
```
[DEBUG] Pulsante "Persona passata" visibile  # All'apertura porta
[DEBUG] Pulsante "Persona passata" nascosto  # Al ritorno IDLE
```

---

### Test 2: Timer Automatico Cancellato

✅ **Comportamento Atteso**: Se clicchi "Persona passata", timer 15s viene cancellato

**Passi**:
1. Apri porta (qualsiasi metodo)
2. Attendi 5 secondi
3. Click "Persona passata"
4. Verifica porta si chiude immediatamente (non attende altri 10s)

**Console Verifica**:
```
[INFO] ✅ Porta aperta - Motivo: [metodo]
[DEBUG] ⏱️ Timer chiusura automatica avviato: 15 secondi  # (se implementato)
[INFO] 🚶 Passaggio persona rilevato - Porta aperta da 5s - Metodo: [metodo]
[DEBUG] ⏱️ Timer chiusura automatica cancellato
```

**Timing**:
- Apertura + 5s attesa + 1.5s chiusura = **6.5s totale**
- Se timer NON cancellato: attenderesti 15s invece di chiudere subito

---

### Test 3: Log Completo con Metodo Corretto

✅ **Comportamento Atteso**: Log include tempo apertura e metodo accesso

**Passi**:
1. **Test con Monete**:
   - Paga 1,20€ monete
   - Attendi 3s, click "Persona passata"
   - Console: `[INFO] Passaggio persona rilevato - Porta aperta da 3s - Metodo: monete`

2. **Test con Carta**:
   - Paga con carta VISA
   - Attendi 2s, click "Persona passata"
   - Console: `[INFO] Passaggio persona rilevato - Porta aperta da 2s - Metodo: carta`

3. **Test con QR**:
   - Inserisci QR "42"
   - Click subito "Persona passata" (< 1s)
   - Console: `[INFO] Passaggio persona rilevato - Porta aperta da 0s - Metodo: qr`

4. **Test con Carta Autorizzata**:
   - Verifica carta "50"
   - Attendi 4s, click "Persona passata"
   - Console: `[INFO] Passaggio persona rilevato - Porta aperta da 4s - Metodo: carta-autorizzata`

---

### Test 4: Click Multipli Ignorati

✅ **Comportamento Atteso**: Solo primo click processato, successivi ignorati

**Passi**:
1. Apri porta
2. Click "Persona passata" 5 volte rapidamente
3. Verifica:
   - Pulsante diventa grigio dopo primo click (disabilitato)
   - Porta si chiude una sola volta
   - Nessun errore JavaScript in console

**Console Verifica**:
```
[DEBUG] 🖱️ Click "Persona passata"
[INFO] 🚶 Passaggio persona rilevato - Porta aperta da Xs - Metodo: [metodo]
# NO log aggiuntivi per click successivi (pulsante disabilitato)
```

---

### Test 5: Tooltip/Hover Funzionante

✅ **Comportamento Atteso**: Tooltip e effetto hover visibili

**Passi**:
1. Apri porta
2. Passa mouse sopra pulsante "Persona passata" SENZA cliccare
3. Verifica:
   - Tooltip "Clicca dopo aver attraversato" appare (attributo `title`)
   - Colore pulsante cambia (hover effect)
   - Shadow o bordo evidenziato

---

## Troubleshooting

### Problema: Pulsante "Persona passata" non visibile

**Causa Possibile**: Porta non in stato APERTA o elemento HTML mancante

**Debug**:
1. Apri DevTools Console
2. Verifica stato chiosco:
```javascript
window.app.chiosco.stato
// Dovrebbe essere: "PORTA_APERTA"
```

3. Verifica elemento HTML:
```javascript
document.getElementById('btn-passaggio-persona')
// Dovrebbe restituire: <button id="btn-passaggio-persona" ...>
```

4. Verifica classi CSS:
```javascript
document.getElementById('btn-passaggio-persona').classList
// NON dovrebbe contenere "hidden"
```

**Soluzione**:
- Se stato NON è "PORTA_APERTA": apri porta con metodo valido
- Se elemento è `null`: verifica `index.html` contenga pulsante
- Se classe "hidden" presente: bug in `chiosco.onEntraPortaAperta()` - verifica codice

---

### Problema: Click pulsante non funziona

**Causa Possibile**: Event handler non registrato o pulsante disabilitato

**Debug**:
1. Verifica event listener:
```javascript
getEventListeners(document.getElementById('btn-passaggio-persona'))
// Dovrebbe mostrare listener "click"
```

2. Verifica pulsante abilitato:
```javascript
document.getElementById('btn-passaggio-persona').disabled
// Dovrebbe essere: false (quando visibile)
```

3. Verifica log in console dopo click:
```
[DEBUG] 🖱️ Click "Persona passata"
```

**Soluzione**:
- Se listener mancante: verifica `app.js` registri event handler
- Se pulsante `disabled === true`: pulsante già cliccato, aspetta ritorno IDLE
- Se nessun log dopo click: verifica JavaScript caricato correttamente

---

### Problema: Porta non si chiude dopo click

**Causa Possibile**: Metodo `porta.chiudiManuale()` non chiamato o ha errore

**Debug**:
1. Console verifica errori JavaScript
2. Verifica log:
```
[INFO] 🚶 Passaggio persona rilevato...
```

3. Verifica metodo esiste:
```javascript
typeof window.app.porta.chiudiManuale
// Dovrebbe essere: "function"
```

4. Test manuale:
```javascript
window.app.porta.chiudiManuale()
// Dovrebbe chiudere porta e loggare
```

**Soluzione**:
- Se errore JavaScript: verifica implementazione `porta.chiudiManuale()` in `porta.js`
- Se metodo non esiste: feature 002 non completamente implementata
- Se metodo funziona manualmente ma non da pulsante: problema in `chiosco.onPassaggioPersona()`

---

### Problema: Timer automatico NON cancellato

**Causa Possibile**: `clearTimeout()` non chiamato o timerID non salvato

**Debug**:
1. Apri porta, attendi 5s, click "Persona passata"
2. Verifica porta si chiude immediatamente (~1.5s)
3. Se porta si chiude dopo 15s totali: timer NON cancellato

**Test con timing preciso**:
```javascript
// Dopo apertura porta
console.time('chiusura-porta');

// Click "Persona passata" dopo 5s

// Verifica tempo al completamento chiusura
console.timeEnd('chiusura-porta');
// Dovrebbe essere: ~1500ms (solo animazione)
// NON: ~10000ms (restanti 10s del timer 15s)
```

**Soluzione**:
- Verifica `porta.timerChiusuraAutomatica` salvato in `porta.apri()`
- Verifica `clearTimeout(this.timerChiusuraAutomatica)` in `porta.chiudiManuale()`
- Verifica `this.timerChiusuraAutomatica = null` dopo cancellazione

---

### Problema: Log mostra metodo sbagliato

**Causa Possibile**: `motivoApertura` non impostato correttamente in `porta.apri()`

**Debug**:
1. Apri porta con QR "42"
2. Click "Persona passata"
3. Console dovrebbe mostrare `Metodo: qr`
4. Se mostra altro (es. `Metodo: monete` o `null`): bug

**Verifica attributo**:
```javascript
// Subito dopo apertura porta
window.app.porta.motivoApertura
// Dovrebbe corrispondere a metodo usato: 'monete' | 'carta' | 'qr' | 'carta-autorizzata'
```

**Soluzione**:
- Verifica `chiosco.onEntraPortaAperta(motivo)` passi `motivo` corretto
- Verifica `porta.apri(motivo)` salvi `this.motivoApertura = motivo`
- Verifica chiamate a `porta.apri()` passino parametro corretto

---

## Configurazione Log

### Livelli Log Disponibili

```javascript
// In console browser
log.setLevel('debug')  // Mostra tutto (DEBUG, INFO, WARN, ERROR)
log.setLevel('info')   // Mostra INFO, WARN, ERROR (default consigliato)
log.setLevel('warn')   // Solo avvisi ed errori
log.setLevel('error')  // Solo errori
```

### Log Utili per Debugging Feature 002

**Livello DEBUG** (verboso):
```
[DEBUG] 🖱️ Click "Persona passata"
[DEBUG] 🚶 Pulsante "Persona passata" visibile
[DEBUG] 🚶 Pulsante "Persona passata" nascosto
[DEBUG] ⏱️ Timer chiusura automatica cancellato
[DEBUG] Input disabilitati
```

**Livello INFO** (standard):
```
[INFO] 🚶 Passaggio persona rilevato - Avvio chiusura manuale
[INFO] 🚶 Passaggio persona rilevato - Porta aperta da 3s - Metodo: monete
[INFO] ✅ Porta aperta - Motivo: monete
[INFO] 🏠 Stato IDLE - Sistema pronto
```

**Livello WARN** (problemi):
```
[WARN] ⚠️ Tentativo passaggio persona in stato non valido: IDLE
```

---

## Test Regressione Feature 001

Prima di considerare feature 002 completa, verifica che feature 001 funzioni ancora:

### Checklist Regressione

- [ ] Pagamento monete 1,20€ apre porta (senza click "Persona passata")
- [ ] Porta si chiude automaticamente dopo 15s
- [ ] Pagamento carta VISA funziona
- [ ] QR code "42" funziona
- [ ] Carta autorizzata "50" funziona
- [ ] Timeout 20s inattività durante pagamento monete
- [ ] Display messaggi corretti
- [ ] Nessun errore JavaScript console

### Test "Chiusura Automatica Ancora Funzionante"

**Passi**:
1. Apri porta (qualsiasi metodo)
2. **NON** cliccare "Persona passata"
3. Attendi 15 secondi completi
4. Verifica porta si chiude automaticamente

**Comportamento Atteso**: Feature 001 funziona identicamente se utente ignora pulsante "Persona passata"

---

## FAQ

**Q: Posso cliccare "Persona passata" immediatamente all'apertura?**
A: Sì, il sistema accetta click anche a < 1s dall'apertura. Log mostrerà "Porta aperta da 0s".

**Q: Cosa succede se clicco dopo che timer 15s è quasi scaduto?**
A: Timer viene cancellato e porta si chiude immediatamente. Log mostrerà tempo corretto (es. "14s").

**Q: Il pulsante è visibile anche durante chiusura porta?**
A: No, pulsante viene nascosto/disabilitato subito dopo primo click.

**Q: Posso testare senza aprire porta?**
A: No, pulsante è inaccessibile (nascosto) in stati diversi da PORTA_APERTA.

**Q: Il tooltip è obbligatorio?**
A: No, è un nice-to-have (US2 P2). Feature funziona anche senza tooltip.

**Q: Quanto tempo risparmio usando chiusura manuale?**
A: Baseline (timer automatico): ~20s per ciclo completo
  Con chiusura manuale: ~9-10s per ciclo completo
  **Risparmio: ~50% (10s)**

---

## Comandi Utili Console

```javascript
// Stato corrente chiosco
window.app.chiosco.stato

// Stato porta
window.app.porta.stato
window.app.porta.timestampApertura
window.app.porta.motivoApertura

// Verifica pulsante
document.getElementById('btn-passaggio-persona').classList.contains('hidden')

// Test manuale chiusura (solo per debug)
window.app.chiosco.onPassaggioPersona()

// Reset manuale sistema (solo per debug)
window.app.chiosco.reset()

// Configura log level
log.setLevel('debug')
```

---

## Prossimi Passi

Dopo verifica funzionalità:
1. Esegui `/speckit.tasks` per generare task breakdown implementazione
2. Oppure esegui `/speckit.implement` per assistenza guidata implementazione

Per domande o problemi, consultare:
- [plan.md](./plan.md) - Piano implementazione completo
- [data-model.md](./data-model.md) - Schema entità e flusso dati
- [research.md](./research.md) - Decisioni tecniche dettagliate
