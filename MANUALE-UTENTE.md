# Manuale d'Uso - Simulatore Chiosco Ingresso

**Versione**: 1.0
**Data**: 20 Ottobre 2025
**Applicazione**: Simulatore web-based chiosco ingresso ferroviario

---

## Indice

1. [Introduzione](#introduzione)
2. [Requisiti di Sistema](#requisiti-di-sistema)
3. [Avvio dell'Applicazione](#avvio-dellapplicazione)
4. [Interfaccia Utente](#interfaccia-utente)
5. [Modalità di Accesso](#modalità-di-accesso)
6. [Funzionalità Manutenzione](#funzionalità-manutenzione)
7. [Scenari d'Uso](#scenari-duso)
8. [Risoluzione Problemi](#risoluzione-problemi)
9. [Logging e Debug](#logging-e-debug)

---

## Introduzione

Il **Simulatore Chiosco Ingresso** è un'applicazione web che simula un sistema automatizzato di controllo accessi per ingressi ferroviari. Gli utenti possono accedere pagando **1,20€** tramite monete o carta di credito, oppure utilizzando codici autorizzati (QR o carta contactless).

### Caratteristiche Principali

- ✅ Pagamento con monete (7 tagli disponibili)
- ✅ Pagamento con carta di credito VISA
- ✅ Accesso con codice QR autorizzato
- ✅ Accesso con carta contactless autorizzata
- ✅ Apertura automatica porta dopo pagamento/autorizzazione
- ✅ Chiusura manuale porta dopo passaggio persona
- ✅ Pannello manutenzione cassetta monete
- ✅ Logging completo eventi su console browser

---

## Requisiti di Sistema

### Browser Supportati
- Chrome/Chromium (ultime 2 versioni) ✅ **Consigliato**
- Firefox (ultime 2 versioni)
- Safari (ultime 2 versioni)
- Edge (ultime 2 versioni)

### Risoluzione Schermo
- **Minima**: 1024x768
- **Ottimale**: 1920x1080 (Full HD)

### Connessione
- **Non richiesta** - l'applicazione funziona completamente offline

---

## Avvio dell'Applicazione

### Metodo 1: Apertura Diretta (più semplice)

1. Navigare nella cartella del progetto
2. Fare doppio click su `index.html`
3. Il browser aprirà l'applicazione (protocollo `file://`)

### Metodo 2: Server Locale (consigliato per sviluppo)

```bash
# Da terminale, nella cartella del progetto
python3 -m http.server 8000
```

Poi aprire nel browser: `http://localhost:8000`

### Verifica Avvio Corretto

Dopo l'apertura dovresti vedere:
- ✅ Header "🚪 Chiosco Ingresso"
- ✅ Display blu con messaggio "Benvenuto - Scegli modalità di accesso"
- ✅ Pannello manutenzione (sfondo giallo) in alto a sinistra
- ✅ 7 monete circolari (gettoniera)
- ✅ Pulsante "Paga con Carta (1,20€)"
- ✅ Input per carta autorizzata e QR
- ✅ Porta grigia chiusa a destra

---

## Interfaccia Utente

### Layout Principale

```
┌─────────────────────────────────────────────────────────┐
│              🚪 Chiosco Ingresso                        │
│        Simulatore di pagamento e controllo accessi      │
├─────────────────────────────────────────────────────────┤
│                    📺 DISPLAY                           │
│         (messaggi, importo, countdown)                  │
├──────────────────────────┬──────────────────────────────┤
│                          │                              │
│  🔧 PANNELLO MANUTENZIONE│                              │
│                          │                              │
│  💰 GETTONIERA           │         🚪 PORTA             │
│  (7 monete)              │      (chiusa/aperta)         │
│                          │                              │
│  💳 CARTA DI CREDITO     │                              │
│                          │                              │
│  🔐 CARTA AUTORIZZATA    │   🚶 Persona passata         │
│                          │   (quando porta aperta)      │
│  📱 LETTORE QR           │                              │
│                          │                              │
└──────────────────────────┴──────────────────────────────┘
```

### Elementi Chiave

| Elemento | Descrizione | Stato |
|----------|-------------|-------|
| **Display** | Mostra messaggi, importo rimanente, countdown | Sempre visibile |
| **Porta** | Animazione apertura/chiusura | Grigia = chiusa, sale = aperta |
| **Monete** | Pulsanti circolari gialli | Disabilitati quando non in pagamento |
| **Pulsante Persona Passata** | Appare quando porta aperta | Verde, chiude porta manualmente |
| **Pannello Manutenzione** | Sfondo giallo, sempre visibile | Solo per operatori autorizzati |

---

## Modalità di Accesso

### 1. 💰 Pagamento con Monete

**Costo**: 1,20€

**Monete Disponibili**:
- 1,00€
- 0,50€
- 0,20€
- 0,10€
- 0,05€
- 0,02€
- 0,01€

**Procedura**:

1. Cliccare su una o più monete fino a raggiungere almeno 1,20€
2. Il **display** mostra l'importo rimanente in tempo reale
3. Un **countdown di 20 secondi** parte dal primo inserimento
   - Ogni moneta inserita resetta il countdown
   - Se scade il timeout → ritorno automatico a IDLE
4. Quando importo ≥ 1,20€:
   - Display mostra "Pagamento completato"
   - Porta si apre automaticamente
5. **Nessun resto erogato** - sovrapagamenti accettati

**Esempio**:
```
Click 1,00€ → Rimanente: 0,20€ (countdown inizia)
Click 0,20€ → Porta aperta! ✅
```

**Note**:
- ⏱️ Timeout 20s inattività
- 💡 Display mostra countdown giallo
- ❌ Timeout → messaggio rosso "Timeout - Riprova"

---

### 2. 💳 Pagamento con Carta di Credito

**Costo**: 1,20€
**Carte Accettate**: Solo VISA (numero inizia con "4")

**Procedura**:

1. Cliccare pulsante **"Paga con Carta (1,20€)"**
2. Appare area tratteggiata "Avvicina la carta al lettore..."
3. **Cliccare sull'area tratteggiata** (simula avvicinamento carta)
4. Display mostra "Elaborazione..." con spinner
5. Dopo 1,5 secondi:
   - ✅ **80% probabilità** → "Pagamento accettato" → Porta aperta
   - ❌ **20% probabilità** → "Pagamento rifiutato - Riprova" → Ritorno IDLE

**Note**:
- 🎲 Successo randomizzato (80%)
- ⏱️ Elaborazione 1,5s
- 🔄 Se rifiutato, puoi riprovare

---

### 3. 📱 Accesso con Codice QR Autorizzato

**Codici Validi**: Da 1 a 99 (qualsiasi numero intero in questo range)

**Procedura**:

1. Digitare un codice nel campo **"Inserisci codice QR (es. 42)"**
2. Cliccare **"Scansiona QR"** (o premere **Enter**)
3. Verifica codice:
   - ✅ Se 1-99 → Display verde "Accesso autorizzato" → Porta aperta
   - ❌ Se fuori range → Display rosso "Accesso negato" → Ritorno IDLE

**Esempi**:
```
Codice "42"  → ✅ Autorizzato
Codice "99"  → ✅ Autorizzato
Codice "1"   → ✅ Autorizzato
Codice "100" → ❌ Negato
Codice "0"   → ❌ Negato
```

**Note**:
- 💡 Verifica istantanea (nessun timeout)
- 🔒 Regole hardcoded in `js/validatore.js`

---

### 4. 🔐 Accesso con Carta Contactless Autorizzata

**Codici Validi**: Da 1 a 99 (stesso range QR)

**Procedura**:

1. Digitare un codice nel campo **"Codice carta (es. 42)"**
2. Cliccare **"Verifica Carta"** (o premere **Enter**)
3. Verifica identica al QR:
   - ✅ 1-99 → Accesso autorizzato
   - ❌ Altro → Accesso negato

**Differenza con QR**:
- Funzionalmente identico
- Interfaccia separata per simulare lettore fisico diverso

---

### 🚪 Comportamento Porta

**Apertura Automatica**:
- Durata: **1,5 secondi** (animazione salita)
- Messaggio: "PORTA APERTA"
- Status: Verde "🔓 Aperta"

**Chiusura Automatica**:
- Timer: **15 secondi** dopo apertura
- Display countdown: "Porta si chiuderà tra Xs"

**Chiusura Manuale** (Feature 002):
- Pulsante **"🚶 Persona passata"** appare quando porta aperta
- Click → Chiusura immediata
- Cancella timer 15s
- Logging evento: `[Porta] Chiusura manuale da utente`

**Dopo Chiusura**:
- Ritorno automatico a stato **IDLE**
- Reset completo sistema
- Pronto per nuovo accesso

---

## Funzionalità Manutenzione

### 🔧 Pannello Manutenzione (Feature 003)

**Visibilità**: Sempre visibile (sfondo giallo), solo operatori autorizzati

**Elementi**:
- 💰 **Saldo Cassetta**: Visualizza importo totale monete (aggiornato in tempo reale)
- 🔓 **Apri Cassetta**: Avvia operazione svuotamento
- 🔒 **Chiudi Cassetta**: Completa operazione svuotamento
- ⏱️ **Countdown Timer**: 10 secondi per autenticazione
- ✅/❌ **Pulsanti Azzeramento**: Sì/No per conferma azzeramento saldo

---

### Operazione Svuotamento Cassetta

**Procedura Completa**:

#### 1️⃣ Apertura Cassetta

1. Cliccare **"Apri Cassetta"**
2. Sistema transisce a **MANUTENZIONE_CASSETTA_APERTA**
3. Input utente disabilitati (chiosco bloccato)
4. Display mostra: "MANUTENZIONE - Cassetta aperta"

#### 2️⃣ Autenticazione Operatore (10s)

5. **Countdown di 10 secondi** parte automaticamente
6. Display timer: "10 secondi rimasti" (diventa rosso ≤ 3s)
7. Inserire **codice operatore autorizzato** (42, 50, o 99) nel campo carta
8. Cliccare **"Verifica Carta"**

**Risultati Autenticazione**:

✅ **Codice Valido (42, 50, 99)**:
- Display verde: "Operatore autenticato"
- Countdown si ferma
- Appaiono pulsanti azzeramento saldo
- Log: `[Manutenzione] AUTH_SUCCESS - Operatore autenticato: XX`

❌ **Codice Non Valido**:
- Display rosso: "Accesso negato"
- Countdown continua
- Puoi riprovare fino a timeout
- Log: `[Manutenzione] AUTH_FAIL - Accesso negato: XX`

⏱️ **Timeout 10s (nessuna autenticazione)**:
- Sistema va in **FUORI SERVIZIO**
- Display rosso fisso: "FUORI SERVIZIO - Attendere operatore"
- 🔔 Suoneria attivata (log simulato)
- Chiosco completamente bloccato
- Log: `[Manutenzione] TIMEOUT - Timeout autenticazione`

#### 3️⃣ Azzeramento Saldo (opzionale)

9. Display mostra: "Azzerare saldo monete (X,XX€)?"
10. Due pulsanti:
    - ✅ **"Sì"**: Azzera saldo cassetta a 0,00€
    - ❌ **"No"**: Mantiene saldo corrente

**Se click "Sì"**:
- Saldo cassetta → 0,00€
- Display: "Saldo azzerato: X,XX€ → 0,00€"
- Log: `[Manutenzione] AZZERAMENTO - Saldo azzerato: X,XX€ → 0,00€`

**Se click "No"**:
- Saldo cassetta invariato
- Display: "Saldo mantenuto: X,XX€ → X,XX€"
- Log: `[Manutenzione] AZZERAMENTO - Saldo mantenuto: X,XX€ → X,XX€`

#### 4️⃣ Chiusura Cassetta

11. Cliccare **"Chiudi Cassetta"**
12. Display: "Cassetta chiusa"
13. Sistema ritorna a **IDLE**
14. Chiosco riabilitato per utenti
15. Log: `[Manutenzione] CHIUSURA - Cassetta chiusa`

---

### Scenario FUORI SERVIZIO

**Quando Accade**:
- Timeout 10s autenticazione manutenzione

**Cosa Succede**:
1. Display rosso fisso: "FUORI SERVIZIO - Attendere operatore"
2. Tutti input disabilitati
3. Suoneria attivata (simulata in log)
4. Log: `[Manutenzione] FUORI_SERVIZIO - Sistema in FUORI SERVIZIO - Suoneria attivata`

**Come Uscire**:

Solo operatore autorizzato può resettare il sistema:

1. Inserire codice operatore valido (42, 50, 99)
2. Cliccare "Verifica Carta"
3. Sistema si resetta automaticamente
4. Display: "Sistema resettato da operatore"
5. Ritorno a **IDLE**
6. Log: `[Manutenzione] RESET - Reset sistema da operatore: XX`

**Note**:
- ⚠️ Modalità di sicurezza - richiede intervento manuale
- 🔔 Suoneria allerta personale (simulata)
- 🔒 Nessun altro modo per uscire da questo stato

---

## Scenari d'Uso

### 📘 Scenario 1: Accesso Rapido con Monete

**Utente**: Passeggero con monete

1. Inserisce 1,00€ + 0,20€
2. Porta si apre
3. Attraversa
4. Clicca "Persona passata"
5. Porta si chiude
6. Sistema pronto per prossimo utente

**Tempo**: ~5 secondi

---

### 📘 Scenario 2: Accesso Abbonato QR

**Utente**: Abbonato con QR code "42"

1. Digita "42" nel campo QR
2. Clicca "Scansiona QR" (o Enter)
3. Porta si apre immediatamente
4. Attraversa
5. Porta si chiude automaticamente dopo 15s

**Tempo**: ~2 secondi (+ 15s chiusura auto)

---

### 📘 Scenario 3: Pagamento Carta Rifiutato

**Utente**: Passeggero con carta problematica

1. Clicca "Paga con Carta (1,20€)"
2. Clicca area tratteggiata
3. Display: "Elaborazione..." (1,5s)
4. Display rosso: "Pagamento rifiutato - Riprova"
5. Ritenta: clicca nuovamente "Paga con Carta"
6. Secondo tentativo riuscito → Porta aperta

**Tempo**: ~10 secondi (2 tentativi)

---

### 📘 Scenario 4: Timeout Monete

**Utente**: Passeggero indeciso

1. Inserisce 0,50€ (rimanente: 0,70€)
2. Countdown 20s inizia
3. Attende oltre 20s senza inserire altre monete
4. Display rosso: "Timeout - Riprova"
5. Sistema ritorna a IDLE (monete perse)
6. Deve ricominciare da capo

**Tempo**: 20 secondi + reset

---

### 📘 Scenario 5: Svuotamento Cassetta Regolare

**Utente**: Operatore manutenzione (codice 50)

1. Clicca "Apri Cassetta"
2. Cassetta aperta, countdown 10s inizia
3. Saldo cassetta: 45,60€
4. Inserisce codice "50" → Autenticato
5. Countdown si ferma
6. Clicca "Sì" per azzerare saldo
7. Saldo → 0,00€
8. Clicca "Chiudi Cassetta"
9. Sistema ritorna a IDLE

**Tempo**: ~30 secondi
**Log**: Operazione completa tracciata con timestamp

---

### 📘 Scenario 6: Timeout Autenticazione → FUORI SERVIZIO

**Utente**: Operatore dimentica di autenticarsi

1. Clicca "Apri Cassetta"
2. Countdown 10s inizia
3. Non inserisce codice (distratto)
4. Countdown scade (0s)
5. Sistema → **FUORI SERVIZIO**
6. Display rosso fisso, suoneria attiva
7. Chiosco completamente bloccato
8. Inserisce codice "99" → Sistema resettato
9. Ritorno a IDLE

**Tempo**: 10s timeout + reset
**Impatto**: Chiosco inutilizzabile fino a reset

---

## Risoluzione Problemi

### ❓ Display non si aggiorna

**Causa**: Elementi DOM non trovati

**Soluzione**:
1. Aprire DevTools (F12)
2. Tab Console
3. Cercare errori rossi
4. Verificare che tutti i file JS siano caricati

---

### ❓ Monete non cliccabili

**Causa**: Sistema non in stato IDLE o PAGAMENTO_MONETE

**Soluzione**:
- Verificare stato corrente in console: `window.app.chiosco.stato`
- Se bloccato, resettare: `window.app.chiosco.reset()`
- Ricaricare pagina (F5)

---

### ❓ Porta non si apre dopo pagamento

**Causa**: Transizione FSM fallita

**Soluzione**:
1. Console: verificare log transizioni
2. `window.app.chiosco.stato` → dovrebbe essere 'PORTA_APERTA'
3. Manualmente: `window.app.porta.apri()`
4. Se persistente, ricaricare pagina

---

### ❓ Countdown non visibile

**Causa**: Display non aggiornato o countdown nascosto

**Soluzione**:
- Console: `window.app.display.aggiornaCountdown(10)` per testare
- Verificare classe `.hidden` su `#display-countdown`
- Ispezionare elemento (F12 → Elements)

---

### ❓ Sistema in FUORI SERVIZIO permanente

**Causa**: Timeout autenticazione manutenzione

**Soluzione**:
1. Inserire codice operatore valido: 42, 50, o 99
2. Cliccare "Verifica Carta"
3. Sistema si resetta automaticamente
4. Se non funziona: ricaricare pagina (F5)

---

### ❓ Saldo cassetta non si azzera

**Causa**: Pulsanti azzeramento disabilitati o non visibili

**Soluzione**:
1. Console: `window.app.chiosco.gettoniera.getSaldo()` → verifica saldo
2. Manualmente: `window.app.chiosco.gettoniera.azzeraSaldo()`
3. Verificare in console che pulsanti siano abilitati

---

## Logging e Debug

### 📊 Livelli di Log

Il sistema usa `loglevel.js` con 4 livelli:

| Livello | Uso | Comando |
|---------|-----|---------|
| **DEBUG** | Tutti i dettagli (verbose) | `log.setLevel('debug')` |
| **INFO** | Eventi principali | `log.setLevel('info')` |
| **WARN** | Avvisi (timeout, codici errati) | `log.setLevel('warn')` |
| **ERROR** | Errori critici | `log.setLevel('error')` |

**Default**: INFO

### 🔍 Comandi Utili Console

```javascript
// Cambia livello log (mostra tutto)
log.setLevel('debug')

// Verifica stato corrente FSM
window.app.chiosco.stato

// Verifica saldo cassetta
window.app.chiosco.gettoniera.getSaldo()

// Reset manuale sistema
window.app.chiosco.reset()

// Apri porta manualmente (per test)
window.app.porta.apri()

// Chiudi porta manualmente
window.app.porta.chiudi()

// Simula moneta (per test rapido)
window.app.chiosco.gettoniera.inserisciMoneta(1.20)

// Verifica importo rimanente
window.app.chiosco.gettoniera.getImportoRimanente()

// Test display
window.app.display.mostraMessaggio('Test messaggio', 'info')
window.app.display.mostraMessaggio('Successo!', 'successo')
window.app.display.mostraMessaggio('Errore!', 'errore')
```

### 📝 Esempi Log Tipici

**Pagamento Monete**:
```
[INFO] 💰 Inserita moneta: 1,00€ - Rimanente: 0,20€
[DEBUG] ⏱️ Countdown: 19s rimanenti
[INFO] 💰 Inserita moneta: 0,20€ - Rimanente: 0,00€
[INFO] ✅ Pagamento completato! Importo: 1,20€
[INFO] 🚪 Porta aperta
```

**Autenticazione Manutenzione**:
```
[INFO] [Manutenzione] APERTURA - Cassetta aperta
[DEBUG] GestoreManutenzione: countdown avviato (10s)
[DEBUG] GestoreManutenzione: countdown 7s rimasti
[WARN] GestoreManutenzione: countdown urgente - 3s rimasti
[INFO] [Manutenzione] AUTH_SUCCESS - Operatore autenticato: 50
[INFO] [Manutenzione] AZZERAMENTO - Saldo azzerato: 15,40€ → 0,00€
[INFO] [Manutenzione] CHIUSURA - Cassetta chiusa
```

**Timeout FUORI SERVIZIO**:
```
[ERROR] GestoreManutenzione: timeout countdown (0s) - chiamata callback
[ERROR] [Manutenzione] TIMEOUT - Timeout autenticazione
[ERROR] [Manutenzione] FUORI_SERVIZIO - Sistema in FUORI SERVIZIO - Suoneria attivata
[INFO] [Manutenzione] RESET - Reset sistema da operatore: 99
```

---

## Codici Speciali

### 🔑 Codici Operatore Autorizzati

| Codice | Uso |
|--------|-----|
| **42** | Operatore standard |
| **50** | Operatore manutenzione |
| **99** | Supervisore/reset emergenza |

**Tutti i codici 1-99** sono validi per accesso QR/carta utente normale.

**Solo 42, 50, 99** sono validi per autenticazione manutenzione.

---

## Informazioni Tecniche

### 🏗️ Architettura

- **Frontend**: HTML5 + CSS3 + JavaScript ES6+ vanilla
- **Pattern**: Finite State Machine (FSM)
- **Dipendenze**: Solo `loglevel.min.js` (logging)
- **Build**: Nessuno - file statici linkati direttamente
- **Persistenza**: Nessuna - stato perso al reload

### 📁 File Principali

```
rfi-poc/
├── index.html              # Entry point
├── css/
│   ├── styles.css          # Layout globale
│   ├── components.css      # Componenti hardware
│   └── animations.css      # Animazioni porta, feedback
├── js/
│   ├── app.js              # Inizializzazione + event handlers
│   ├── chiosco.js          # FSM principale (7 stati)
│   ├── display.js          # Gestione display messaggi
│   ├── porta.js            # Simulazione porta
│   ├── gettoniera.js       # Monete + calcolo importo
│   ├── lettore-carte.js    # Carta VISA + autorizzata
│   ├── lettore-qr.js       # Scanner QR
│   ├── validatore.js       # Regole hardcoded (1-99, VISA)
│   ├── sensore-cassetta.js # Observer cassetta aperta/chiusa
│   ├── suoneria.js         # Suoneria fuori servizio (simulata)
│   ├── gestore-manutenzione.js # Countdown + tracking operazione
│   └── utils.js            # Helper riutilizzabili
└── assets/lib/
    └── loglevel.min.js     # Libreria logging (1.9.1)
```

---

## Note Finali

### ⚡ Performance

- Applicazione ottimizzata per **1920x1080** (Full HD)
- Tutto il layout visibile senza scroll
- Animazioni fluide CSS

### 🔒 Sicurezza

- Codici hardcoded in `validatore.js` (solo demo)
- Nessun backend - tutto client-side
- Suoneria fuori servizio solo simulata (log)

### 📞 Supporto

Per problemi tecnici o domande:
- Consultare log console (DevTools → F12)
- Verificare `CLAUDE.md` per architettura
- Controllare test E2E in `tests/e2e/` per scenari funzionali

---

**© 2025 - Simulatore Chiosco Ingresso - Versione 1.0**
