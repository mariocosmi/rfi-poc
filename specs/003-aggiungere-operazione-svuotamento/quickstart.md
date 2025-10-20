# Quickstart: Svuotamento Cassetta Monete con Autenticazione

**Feature**: 003-aggiungere-operazione-svuotamento
**Versione**: 1.0 | **Data**: 2025-10-17

## Overview

Questa guida rapida spiega come utilizzare il simulatore di svuotamento cassetta monete del chiosco ingresso ferroviario. Include istruzioni per operatori, scenari di test e troubleshooting.

---

## Setup Iniziale

### Prerequisiti
- Browser moderno (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Risoluzione minima: 1024x768
- Audio abilitato (per suoneria allarme)

### Avvio Simulatore

**Opzione 1: File locale**
```bash
# Aprire index.html direttamente nel browser
# (Protocollo file://)
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
```

**Opzione 2: Server HTTP locale**
```bash
# Dalla directory progetto
python3 -m http.server 8000

# Visitare http://localhost:8000 nel browser
```

### DevTools Console
Aprire DevTools (F12 o Cmd+Opt+I) per visualizzare log dettagliati:
```javascript
// Set log level per debugging
log.setLevel('debug')  // DEBUG, INFO, WARN, ERROR
```

---

## Interfaccia Utente

### Layout Chiosco

```
┌─────────────────────────────────────────┐
│           DISPLAY PRINCIPALE            │
│  (messaggi + countdown + stato)         │
├─────────────────────────────────────────┤
│                                         │
│   [Monete]  [Carta]  [QR]  [Porta]     │ ← Area cliente (feature 001/002)
│                                         │
├─────────────────────────────────────────┤
│   PANNELLO MANUTENZIONE                 │ ← Area operatore (feature 003)
│   🔓 Apri Cassetta                      │
│   🔒 Chiudi Cassetta                    │
│   Cassetta: [Chiusa]                    │
└─────────────────────────────────────────┘
```

### Controlli Operatore

| Pulsante | Funzione | Quando Visibile |
|----------|----------|----------------|
| **🔓 Apri Cassetta** | Simula apertura cassetta con chiave | Sempre (solo se cassetta chiusa) |
| **🔒 Chiudi Cassetta** | Simula chiusura cassetta | Solo quando cassetta aperta |
| **Sì** / **No** | Scelta azzeramento saldo | Solo durante MANUTENZIONE_SCELTA_AZZERAMENTO |

### Indicatori Stato

- **Countdown**: Numero grande con secondi rimanenti (rosso se < 3s)
- **Stato Cassetta**: "Aperta" (rosso) o "Chiusa" (verde)
- **Icona 🔊**: Suoneria attiva durante FUORI_SERVIZIO
- **Sfondo rosso**: Display FUORI_SERVIZIO

---

## Scenari d'Uso

### 1. Svuotamento Cassetta Standard (Happy Path)

**Obiettivo**: Svuotare cassetta con autenticazione valida e azzerare saldo

**Passi**:
1. **Verifica stato**: Chiosco in IDLE, cassetta chiusa
2. **Apri cassetta**: Click pulsante "🔓 Apri Cassetta"
   - Display mostra: *"Cassetta aperta - Autenticazione richiesta"*
   - Countdown: *"10 secondi rimasti"* (si aggiorna ogni secondo)
3. **Autenticazione**: Nel campo "Carta Contactless", inserisci codice autorizzato (es. `42`, `50`, `99`)
   - Display mostra: *"Operatore autorizzato (42) - Attesa chiusura cassetta"*
   - Countdown si ferma
4. **Chiudi cassetta**: Click pulsante "🔒 Chiudi Cassetta"
   - Display mostra: *"Azzerare saldo monete (15.80€)? [Sì] [No]"*
5. **Scelta azzeramento**:
   - Click **Sì**: Saldo azzerato a 0.00€
   - Click **No**: Saldo mantenuto
6. **Completamento**: Display mostra *"Operazione completata"* per 3 secondi, poi torna a IDLE

**Console Log Attesi**:
```
[INFO] SensoreCassetta: cassetta aperta
[INFO] [2025-10-17T14:32:10.123Z] Manutenzione - APERTURA - Cassetta aperta
[INFO] [2025-10-17T14:32:15.456Z] Manutenzione - AUTH_SUCCESS - Operatore autenticato: 42
[INFO] SensoreCassetta: cassetta chiusa
[INFO] [2025-10-17T14:32:20.789Z] Manutenzione - CHIUSURA - Cassetta chiusa
[INFO] [2025-10-17T14:32:25.012Z] Manutenzione - AZZERAMENTO - Saldo azzerato: 15.80€ → 0.00€
```

**Tempo Stimato**: 20-30 secondi

---

### 2. Timeout Autenticazione → FUORI_SERVIZIO

**Obiettivo**: Simulare timeout autenticazione (operatore non autentica entro 10s)

**Passi**:
1. **Apri cassetta**: Click "🔓 Apri Cassetta"
2. **Attendi timeout**: NON inserire codice, lascia countdown arrivare a 0
3. **Risultato**:
   - **Suoneria attiva** (beep continuo 800Hz)
   - Display rosso: *"⚠️ FUORI SERVIZIO - Chiamare assistenza"*
   - Icona 🔊 visibile
   - Tutti input cliente disabilitati (monete, carte, QR)

**Console Log Attesi**:
```
[INFO] SensoreCassetta: cassetta aperta
[INFO] [timestamp] Manutenzione - APERTURA
[WARN] Countdown: 3 secondi rimasti
[WARN] Countdown: 2 secondi rimasti
[WARN] Countdown: 1 secondi rimasti
[ERROR] [timestamp] Manutenzione - TIMEOUT - Timeout autenticazione
[ERROR] [timestamp] Manutenzione - FUORI_SERVIZIO - Sistema in FUORI SERVIZIO - Suoneria attivata
```

**Tempo Stimato**: 10 secondi (timeout)

---

### 3. Reset da FUORI_SERVIZIO

**Obiettivo**: Ripristinare chiosco da stato FUORI_SERVIZIO con carta autorizzata

**Prerequisiti**: Chiosco in FUORI_SERVIZIO (seguire scenario 2)

**Passi**:
1. **Verifica stato**: Display rosso "FUORI SERVIZIO", suoneria attiva
2. **Reset**: Nel campo "Carta Contactless", inserisci codice autorizzato (es. `50`)
3. **Risultato**:
   - Suoneria si interrompe
   - Display mostra: *"Sistema ripristinato da operatore (50)"*
   - Dopo 3 secondi: ritorno a IDLE normale
   - Tutti input cliente riabilitati

**Console Log Attesi**:
```
[INFO] [timestamp] Manutenzione - RESET - Reset sistema da operatore: 50
[INFO] [timestamp] Stato: FUORI_SERVIZIO → IDLE
```

**Tempo Stimato**: 5 secondi

---

### 4. Autenticazione Fallita (Codice Non Autorizzato)

**Obiettivo**: Testare comportamento con codice non valido

**Passi**:
1. **Apri cassetta**: Click "🔓 Apri Cassetta"
2. **Codice non valido**: Inserisci codice > 99 (es. `777`, `888`)
3. **Risultato**:
   - Display mostra: *"Accesso negato (777)"* per 2 secondi
   - Countdown **continua** a decrementare
   - Operatore può tentare nuovamente con codice valido
4. **Risoluzione**:
   - Inserisci codice valido (1-99) prima di timeout
   - Oppure attendi timeout → FUORI_SERVIZIO

**Console Log Attesi**:
```
[WARN] [timestamp] Manutenzione - AUTH_FAIL - Accesso negato: 777
[INFO] Countdown: 7 secondi rimasti (countdown continua)
```

---

### 5. Mantenimento Saldo (No Azzeramento)

**Obiettivo**: Completare svuotamento senza azzerare saldo

**Passi**:
1-4. Come scenario 1 (apri, autentica, chiudi)
5. **Scelta**: Click pulsante **No**
6. **Risultato**:
   - Saldo **mantenuto** (es. rimane 15.80€)
   - Display mostra: *"Saldo mantenuto - Operazione completata"*
   - Torna a IDLE dopo 3 secondi

**Console Log Attesi**:
```
[INFO] [timestamp] Manutenzione - AZZERAMENTO - Saldo mantenuto: 15.80€ → 15.80€
```

---

## Codici Autorizzati

### Lista Codici Validi
Codici numerici da **1 a 99** (inclusi):
- `1`, `2`, ..., `99` ✅ Autorizzati
- `100`, `777`, `888`, ecc. ❌ Non autorizzati

**Nota**: Stessa lista utilizzata per accesso clienti (feature 001). Non esiste distinzione tra "carta operatore" e "carta cliente autorizzata".

### Codici di Test Consigliati
- **42**: Operatore standard
- **50**: Operatore manutenzione
- **99**: Operatore admin
- **777**: Test accesso negato (non autorizzato)

---

## Stati FSM

### Diagramma Stati Manutenzione

```
IDLE
  └─> MANUTENZIONE_AUTH_PENDING (cassettaAperta)
        ├─> MANUTENZIONE_ATTESA_CHIUSURA (auth valida entro 10s)
        │     └─> MANUTENZIONE_SCELTA_AZZERAMENTO (cassettaChiusa)
        │           └─> IDLE (click Sì o No + 3s)
        └─> FUORI_SERVIZIO (timeout 10s)
              └─> IDLE (reset con carta autorizzata)
```

### Descrizione Stati

| Stato | Input Disabilitati | Display | Durata |
|-------|-------------------|---------|--------|
| **IDLE** | Nessuno | "Benvenuto" | Indefinita |
| **MANUTENZIONE_AUTH_PENDING** | Tutti cliente | "Autenticazione richiesta" + countdown | Max 10s |
| **MANUTENZIONE_ATTESA_CHIUSURA** | Tutti cliente | "Attesa chiusura cassetta" | Fino chiusura |
| **MANUTENZIONE_SCELTA_AZZERAMENTO** | Tutti cliente | Pulsanti Sì/No | Fino scelta |
| **FUORI_SERVIZIO** | Tutti (tranne reset) | "⚠️ FUORI SERVIZIO" | Fino reset |

---

## Troubleshooting

### Problema: Suoneria non si sente

**Causa**: Browser blocca AudioContext prima di user interaction (autoplay policy)

**Soluzione**:
1. Click qualsiasi elemento nella pagina prima di test
2. Oppure: Aprire DevTools console e eseguire:
   ```javascript
   window.app.chiosco.suoneria.audioContext.resume()
   ```

---

### Problema: Countdown non aggiorna

**Causa**: Tab browser in background (browser throttle setInterval)

**Soluzione**:
- Mantenere tab in foreground durante test
- Precisione countdown: ±200ms accettabile (NFR-001)

---

### Problema: Pulsanti Sì/No non cliccabili

**Causa**: Pulsanti disabilitati dopo primo click (previene doppia elaborazione)

**Soluzione**:
- Comportamento intenzionale (FR-021)
- Attendere completamento operazione e ritorno a IDLE

---

### Problema: Cassetta non si chiude

**Causa**: Pulsante "Chiudi Cassetta" disabilitato

**Verifica**:
- Cassetta deve essere aperta per abilitare pulsante
- Display console:
  ```javascript
  window.app.chiosco.sensoreCassetta.getStato() // Deve essere 'aperta'
  ```

---

### Problema: Input cliente non funzionano dopo reset

**Causa**: Chiosco ancora in stato manutenzione

**Verifica**:
```javascript
window.app.chiosco.stato // Deve essere 'IDLE'
window.app.chiosco.inputAbilitato // Deve essere true
```

**Soluzione**: Reset manuale via console:
```javascript
window.app.chiosco.reset()
```

---

## Testing & Debugging

### Console Commands

```javascript
// Verifica stato corrente
window.app.chiosco.stato

// Verifica stato cassetta
window.app.chiosco.sensoreCassetta.getStato()

// Verifica saldo gettoniera
window.app.gettoniera.validaSaldo()

// Forza FUORI_SERVIZIO (test)
window.app.chiosco.transizione('FUORI_SERVIZIO')

// Reset manuale
window.app.chiosco.reset()

// Disabilita suoneria (test silenziosi)
window.suoneriaEnabled = false

// Set log level
log.setLevel('debug') // DEBUG, INFO, WARN, ERROR
```

### Test Checklist Manuale

- [ ] **US1**: Svuotamento standard con azzeramento (Sì)
- [ ] **US1**: Svuotamento standard senza azzeramento (No)
- [ ] **US2**: Timeout 10s → FUORI_SERVIZIO + suoneria
- [ ] **US3**: Reset da FUORI_SERVIZIO con carta autorizzata
- [ ] **US3**: Reset fallito con carta non autorizzata (777)
- [ ] **US4**: Verifica log completi su console
- [ ] **US5**: Apertura cassetta durante transito (porta aperta)
- [ ] **US5**: Apertura cassetta durante pagamento monete
- [ ] **Edge**: Codice non autorizzato (777) → accesso negato
- [ ] **Edge**: Multipli tentativi autenticazione entro 10s
- [ ] **Zero breaking changes**: Feature 001/002 funzionano identicamente

---

## Log Reference

### Livelli Log

| Livello | Uso | Esempio |
|---------|-----|---------|
| **DEBUG** | Dettagli interni | `GestoreManutenzione: avvio countdown` |
| **INFO** | Eventi normali | `Operatore autenticato: 42` |
| **WARN** | Situazioni anomale | `Saldo anomalo rilevato` |
| **ERROR** | Errori critici | `Sistema in FUORI SERVIZIO` |

### Eventi Loggati

Tutti eventi manutenzione loggati con timestamp ISO 8601:

- **APERTURA**: Cassetta aperta
- **AUTH_SUCCESS**: Autenticazione valida (con codice operatore)
- **AUTH_FAIL**: Autenticazione fallita (con codice tentato)
- **TIMEOUT**: Countdown raggiunge 0 senza auth
- **CHIUSURA**: Cassetta chiusa
- **AZZERAMENTO**: Scelta azzeramento + saldo prima/dopo
- **FUORI_SERVIZIO**: Entrata in stato FUORI_SERVIZIO
- **RESET**: Reset da FUORI_SERVIZIO (con codice operatore)

---

## Performance Tips

### Ottimizzazioni
- Countdown: 1 tick/secondo (overhead trascurabile)
- Suoneria: ~1% CPU (Web Audio API efficiente)
- Log: Console log asincroni (no impact UI)

### Browser Supportati
- **Chrome 90+**: Consigliato (migliore Web Audio API support)
- **Firefox 88+**: Supportato
- **Safari 14+**: Supportato (attenzione autoplay policy)
- **Edge 90+**: Supportato

---

## FAQ

### Q: Posso cambiare il timeout da 10 secondi?
**A**: No. Il timeout è hardcoded a 10s per semplicità MVP. Per modificare, editare `TIMEOUT_AUTENTICAZIONE_SEC` in `js/gestore-manutenzione.js`.

### Q: I log sono salvati da qualche parte?
**A**: No. Log sono solo in console browser (non persistiti). Al reload pagina, log spariscono. Feature futura: export log su file.

### Q: Posso aggiungere nuovi codici autorizzati?
**A**: Sì, ma richiede modifica codice. Editare `Validatore.isCodiceAutorizzato()` in `js/validatore.js`. Attualmente hardcoded 1-99.

### Q: Cosa succede se ricarico la pagina durante manutenzione?
**A**: Stato perso. Chiosco torna a IDLE. Saldo gettoniera **non azzerato** (comportamento sicuro: meglio mantenere saldo che perderlo).

### Q: Posso aprire cassetta durante transito cliente?
**A**: Sì (US5). Sistema attende fine transito (chiusura porta) prima di avviare manutenzione. Log warning: *"Cassetta aperta durante transito - attesa fine operazione"*.

---

## Riferimenti

- **spec.md**: Requisiti completi feature 003
- **plan.md**: Piano implementazione tecnico
- **data-model.md**: Schema entità e FSM
- **research.md**: Decisioni tecniche dettagliate
- **contracts/interfaces.js**: Interfacce componenti

---

**Versione**: 1.0 | **Ultimo Aggiornamento**: 2025-10-17
**Feedback**: Segnalare bug o suggerimenti nel repository progetto
