# Specifica Funzionalità: Svuotamento Cassetta Monete con Autenticazione

**Feature Branch**: `003-aggiungere-operazione-svuotamento`
**Creata**: 2025-10-16
**Stato**: Bozza
**Input**: Descrizione utente: "aggiungere operazione svuotamento cassetta monete: cassetta aperta con chiave collegata a sensore → schermo cambia → operatore passa carta contactless autorizzata entro 10s. Se OK: attende chiusura cassetta → chiede se azzerare o mantenere saldo. Se timeout 10s: attiva suoneria + stato fuori servizio"

## User Scenarios & Testing *(obbligatorio)*

### User Story 1 - Svuotamento Cassetta Autorizzato (Priorità: P1) 🎯 MVP

Un operatore autorizzato si avvicina al chiosco (IMPORTANTE: in stato idle) per svuotare la cassetta delle monete. Apre la cassetta con una chiave fisica che attiva un sensore. Il display del chiosco mostra immediatamente "Cassetta aperta - Autenticazione richiesta" e un countdown di 10 secondi. L'operatore avvicina la propria carta contactless autorizzata al lettore entro 10 secondi. Il sistema verifica il codice (stessa lista utilizzata per accesso clienti: numeri 1-99, ad es. 42, 50, 99). Se il codice è valido, il display mostra "Operatore autorizzato - Attesa chiusura cassetta". Dopo che l'operatore chiude la cassetta, il sistema mostra "Azzerare saldo monete? [Sì] [No]". L'operatore sceglie tramite pulsanti su schermo. Il sistema registra la scelta, azzera il saldo se richiesto, e torna allo stato iniziale normale.

**Perché questa priorità**: È il flusso principale (happy path) della funzionalità, essenziale per operazioni di manutenzione ordinaria. Rappresenta il caso d'uso più frequente e deve essere rock-solid.

**Test Indipendente**: Può essere testato simulando:
1. Apertura cassetta (click sensore o pulsante debug)
2. Autenticazione con carta valida entro 10s
3. Chiusura cassetta (click sensore o pulsante debug)
4. Scelta azzeramento saldo

Verifica: display mostra messaggi corretti, saldo azzerato se richiesto, sistema torna a IDLE operativo.

**Scenari di Accettazione**:

1. **Dato** che il chiosco è in stato IDLE con saldo 15,80€, **Quando** un operatore apre la cassetta con chiave, **Allora** il display mostra "Cassetta aperta - Autenticazione richiesta" e countdown "10 secondi rimasti"
2. **Dato** che il display mostra "Autenticazione richiesta" e countdown "7 secondi rimasti", **Quando** l'operatore avvicina carta autorizzata (codice 42), **Allora** il display mostra "Operatore autorizzato (42) - Attesa chiusura cassetta" e countdown si interrompe
3. **Dato** che il display mostra "Attesa chiusura cassetta", **Quando** l'operatore chiude la cassetta, **Allora** il display mostra "Azzerare saldo monete (15,80€)? [Sì] [No]"
4. **Dato** che il display mostra "Azzerare saldo?", **Quando** l'operatore clicca "Sì", **Allora** il sistema azzera il saldo a 0,00€, mostra "Saldo azzerato - Operazione completata" e torna a IDLE dopo 3 secondi
5. **Dato** che il display mostra "Azzerare saldo?", **Quando** l'operatore clicca "No", **Allora** il sistema mantiene il saldo 15,80€, mostra "Saldo mantenuto - Operazione completata" e torna a IDLE dopo 3 secondi

---

### User Story 2 - Timeout Autenticazione → Fuori Servizio (Priorità: P1) 🎯 MVP

Un operatore apre la cassetta con chiave, attivando il sensore. Il display mostra "Cassetta aperta - Autenticazione richiesta" e countdown 10 secondi. L'operatore non riesce ad autenticarsi entro 10 secondi (carta dimenticata, codice non valido ovvero > 100, ritardo). Il sistema attiva una suoneria sonora continua, il display mostra "FUORI SERVIZIO - Chiamare assistenza" con icona di allarme, e il chiosco entra in stato FUORI_SERVIZIO. In questo stato, il chiosco NON accetta pagamenti o accessi da clienti. Solo un operatore autorizzato può ripristinare il servizio tramite procedura di reset (User Story 3).

**Perché questa priorità**: Gestione critica di sicurezza per prevenire accessi non autorizzati alla cassetta. È un caso limite importante ma frequente (errori operativi, emergenze).

**Test Indipendente**: Può essere testato simulando:
1. Apertura cassetta
2. NON autenticarsi o autenticarsi con carta non valida
3. Attendere scadenza countdown 10s

Verifica: suoneria attiva, display mostra FUORI SERVIZIO, tentativi pagamento rifiutati, stato IDLE non ripristinabile senza reset autorizzato.

**Scenari di Accettazione**:

1. **Dato** che il display mostra "Autenticazione richiesta" e countdown "2 secondi rimasti", **Quando** il countdown raggiunge 0 senza autenticazione valida, **Allora** il sistema attiva suoneria continua e il display mostra "⚠️ FUORI SERVIZIO - Chiamare assistenza"
2. **Dato** che il display mostra "Autenticazione richiesta" e countdown "5 secondi rimasti", **Quando** l'operatore avvicina carta NON autorizzata (codice 777), **Allora** il display mostra "Accesso negato (777)" per 2s, countdown continua a decrementare
3. **Dato** che il chiosco è in stato FUORI_SERVIZIO, **Quando** un cliente tenta di inserire monete o pagare con carta, **Allora** il sistema ignora gli input, display continua a mostrare "FUORI SERVIZIO", suoneria rimane attiva
4. **Dato** che il chiosco è in stato FUORI_SERVIZIO, **Quando** trascorrono 60 secondi, **Allora** il sistema continua a rimanere in FUORI_SERVIZIO (non auto-ripristino)

---

### User Story 3 - Reset Manuale da Fuori Servizio (Priorità: P2)

Il chiosco è in stato FUORI_SERVIZIO dopo un timeout autenticazione. Un operatore autorizzato arriva per ripristinare il servizio. Il display mostra permanentemente "FUORI SERVIZIO - Passare carta autorizzata per reset". L'operatore avvicina la propria carta contactless autorizzata. Il sistema verifica il codice. Se valido, la suoneria si interrompe, il display mostra "Sistema ripristinato da operatore (42)" e il chiosco torna allo stato IDLE operativo normale dopo 3 secondi. Se il codice NON è valido, il display mostra brevemente "Accesso negato" e rimane in FUORI_SERVIZIO.

**Perché questa priorità**: Necessaria per recovery da stato FUORI_SERVIZIO, ma meno critica di US1/US2. Può essere implementata dopo il flusso principale per gestire situazioni di emergenza risolte.

**Test Indipendente**: Può essere testato:
1. Portare manualmente il sistema in FUORI_SERVIZIO (simulazione timeout)
2. Tentare reset con carta autorizzata (codice 50)
3. Tentare reset con carta non autorizzata (codice 888)

Verifica: reset con codice valido ripristina IDLE, tentativi con codice non valido falliscono, suoneria si spegne solo su reset valido.

**Scenari di Accettazione**:

1. **Dato** che il chiosco è in FUORI_SERVIZIO con suoneria attiva, **Quando** un operatore avvicina carta autorizzata (codice 50), **Allora** la suoneria si interrompe, il display mostra "Sistema ripristinato da operatore (50)", e il chiosco torna a IDLE dopo 3 secondi
2. **Dato** che il chiosco è in FUORI_SERVIZIO, **Quando** un operatore avvicina carta NON autorizzata (codice 888), **Allora** il display mostra "Accesso negato (888)" per 2s, poi torna a "FUORI SERVIZIO", suoneria rimane attiva
3. **Dato** che il chiosco è in FUORI_SERVIZIO, **Quando** un operatore avvicina carta autorizzata ma rimuove la carta prima del completamento della lettura, **Allora** il sistema tratta come tentativo fallito, display mostra "Errore lettura carta", rimane in FUORI_SERVIZIO

---

### User Story 4 - Logging Operazioni Manutenzione (Priorità: P3)

Ogni operazione di svuotamento cassetta genera log dettagliati nella console browser. I log includono:
- Timestamp apertura cassetta
- Timestamp autenticazione (successo/fallimento)
- Codice operatore
- Timestamp chiusura cassetta
- Saldo prima svuotamento
- Scelta azzeramento (SI/NO)
- Saldo dopo svuotamento
- Eventi FUORI_SERVIZIO e reset

I log sono visibili in tempo reale nella DevTools Console per debugging e audit.

**Perché questa priorità**: Nice-to-have per debugging e audit trail, ma non blocca funzionalità core. Rispetta Principle V (Observability) della Constitution.

**Test Indipendente**: Eseguire operazioni svuotamento e verificare che console browser mostri log formattati con tutti i campi richiesti e timestamp corretti.

**Scenari di Accettazione**:

1. **Dato** che il chiosco è IDLE, **Quando** un operatore completa un'operazione di svuotamento con azzeramento, **Allora** la console mostra: `[INFO] [timestamp] Cassetta aperta`, `[INFO] [timestamp] Operatore autenticato: 42`, `[INFO] [timestamp] Cassetta chiusa`, `[INFO] [timestamp] Saldo azzerato: 15.80€ → 0.00€`
2. **Dato** che il chiosco entra in FUORI_SERVIZIO, **Quando** si verifica un timeout autenticazione, **Allora** la console mostra: `[WARN] [timestamp] Timeout autenticazione svuotamento`, `[ERROR] [timestamp] Sistema in FUORI SERVIZIO - Suoneria attivata`
3. **Dato** che il chiosco viene resettato da FUORI_SERVIZIO, **Quando** un operatore esegue reset, **Allora** la console mostra: `[INFO] [timestamp] Reset sistema da operatore: 50`, `[INFO] [timestamp] Stato: FUORI_SERVIZIO → IDLE`

---

### User story 5 - apertura cassetta durante un transito

Se l'operatore apre la cassetta durante un transito il chiosco aspetta che questo sia terminato prima di procedere con la richiesta di autenticazione
Se l'operatore apre la cassetta durante l'inserimento di monete, l'operazione di inserimento viene annullata e si procede con la richiesta di autenticazione

---

### Casi Limite

- **Cassetta aperta più volte consecutive**: Se l'operatore riapre la cassetta subito dopo chiusura (prima di scegliere azzeramento), il sistema dovrebbe chiedere nuova autenticazione?
  - **Risposta**: NO. Se già autenticato e cassetta viene riaperta prima della scelta azzeramento, il sistema rimane in "Attesa chiusura cassetta" senza richiedere nuova autenticazione. Timeout 10s vale solo per prima autenticazione dopo apertura da IDLE.

- **Autenticazione multipla durante countdown**: L'operatore passa 2 carte diverse entro 10s (es. prima carta non valida, poi carta valida).
  - **Risposta**: Il sistema elabora ogni carta singolarmente. Prima carta non valida: mostra "Accesso negato" per 2s, countdown continua. Seconda carta valida: autenticazione successo, countdown si interrompe.

- **Chiusura cassetta prima di autenticazione**: L'operatore apre la cassetta, ma la chiude immediatamente senza autenticarsi.
  - **Risposta**: Il countdown continua anche con cassetta chiusa. Se scade senza autenticazione → FUORI_SERVIZIO. La cassetta DEVE rimanere aperta fisicamente fino a autenticazione valida (simulazione: sensore rileva chiusura solo dopo autenticazione).

- **Interruzione corrente durante svuotamento**: Simulazione: utente chiude tab browser durante operazione.
  - **Risposta**: Stato non persistito (no localStorage). Al ricaricamento, chiosco torna a IDLE. Saldo monete NON azzerato (comportamento sicuro: meglio mantenere saldo che perderlo).

- **Suoneria in browser**: Come simulare suoneria sonora?
  - **Risposta**: Utilizzare Web Audio API o tag `<audio>` con suono loop continuo. Volume regolabile. Icona 🔊 visibile su display durante FUORI_SERVIZIO.

- **Saldo negativo o corrotto**: Cosa succede se saldo gettoniera è NaN o negativo al momento dello svuotamento?
  - **Risposta**: Validazione: se saldo < 0 o NaN, trattare come 0,00€ e loggare warning. Mostrare "Saldo: 0,00€ (anomalia rilevata)" durante scelta azzeramento.

- **Doppio click su pulsanti azzeramento**: L'operatore clicca "Sì" 2 volte velocemente.
  - **Risposta**: Pulsanti disabilitati immediatamente dopo primo click per prevenire doppia elaborazione.

- **Accesso cliente durante FUORI_SERVIZIO**: Un cliente scannerizza QR autorizzato mentre chiosco è FUORI_SERVIZIO.
  - **Risposta**: Sistema ignora completamente tutti gli input (monete, carte pagamento, QR, carte autorizzate) tranne carte autorizzate per RESET. Display mostra sempre "FUORI SERVIZIO".

## Requisiti *(obbligatorio)*

### Requisiti Funzionali

- **FR-001**: Il sistema DEVE simulare un sensore di apertura cassetta monete tramite pulsante/controllo UI "Apri Cassetta"
- **FR-002**: Il sistema DEVE rilevare l'apertura della cassetta e transizionare immediatamente a stato MANUTENZIONE_CASSETTA_APERTA
- **FR-003**: Il sistema DEVE mostrare sul display "Cassetta aperta - Autenticazione richiesta" quando la cassetta viene aperta
- **FR-004**: Il sistema DEVE avviare un countdown di 10 secondi visibile sul display quando la cassetta viene aperta
- **FR-005**: Il sistema DEVE accettare solo carte contactless autorizzate (numeri 1-99 dalla lista esistente, es. 42, 50, 99) per autenticare l'operatore
- **FR-006**: Il sistema DEVE interrompere il countdown e mostrare "Operatore autorizzato (XX) - Attesa chiusura cassetta" quando l'autenticazione è valida
- **FR-007**: Il sistema DEVE mostrare "Accesso negato (XX)" per 2 secondi quando l'autenticazione fallisce, mantenendo il countdown attivo
- **FR-008**: Il sistema DEVE entrare in stato FUORI_SERVIZIO quando il countdown raggiunge 0 senza autenticazione valida
- **FR-009**: Il sistema DEVE attivare una suoneria sonora continua quando entra in stato FUORI_SERVIZIO
- **FR-010**: Il sistema DEVE mostrare "⚠️ FUORI SERVIZIO - Chiamare assistenza" su display quando in stato FUORI_SERVIZIO
- **FR-011**: Il sistema DEVE rifiutare TUTTI gli input cliente (monete, pagamenti, QR, accessi) quando in stato FUORI_SERVIZIO
- **FR-012**: Il sistema DEVE simulare un sensore di chiusura cassetta tramite pulsante/controllo UI "Chiudi Cassetta"
- **FR-013**: Il sistema DEVE rilevare chiusura cassetta e mostrare "Azzerare saldo monete (XX.XX€)? [Sì] [No]" dopo autenticazione valida
- **FR-014**: Il sistema DEVE fornire due pulsanti su display: "Sì" e "No" per scelta azzeramento saldo
- **FR-015**: Il sistema DEVE azzerare il saldo gettoniera a 0,00€ se l'operatore clicca "Sì"
- **FR-016**: Il sistema DEVE mantenere il saldo gettoniera invariato se l'operatore clicca "No"
- **FR-017**: Il sistema DEVE loggare su console browser: timestamp apertura, autenticazione (codice operatore), chiusura, saldo prima/dopo, scelta azzeramento
- **FR-018**: Il sistema DEVE tornare a stato IDLE operativo dopo scelta azzeramento, mostrando "Operazione completata" per 3 secondi
- **FR-019**: Il sistema DEVE permettere reset manuale da FUORI_SERVIZIO tramite carta autorizzata
- **FR-020**: Il sistema DEVE interrompere suoneria e tornare a IDLE quando reset manuale è valido, mostrando "Sistema ripristinato da operatore (XX)" per 3 secondi
- **FR-021**: Il sistema DEVE disabilitare pulsanti "Sì"/"No" immediatamente dopo primo click per prevenire doppia elaborazione
- **FR-022**: Il sistema DEVE validare saldo gettoniera (se < 0 o NaN → trattare come 0,00€) durante operazione svuotamento
- **FR-008**: Il campo di input per le carte contactless deve essere lo stesso, sia per la richiesta di autenticazione che per l'apertura della porta 

### Requisiti Non Funzionali

- **NFR-001**: Il countdown DEVE essere visibile e aggiornato ogni secondo (precisione ±100ms)
- **NFR-002**: La suoneria DEVE essere udibile ma non assordante (volume max 50%, regolabile da DevTools)
- **NFR-003**: La transizione IDLE → MANUTENZIONE_CASSETTA_APERTA DEVE avvenire entro 200ms dall'apertura cassetta
- **NFR-004**: L'autenticazione carta DEVE completare entro 1 secondo dalla lettura codice
- **NFR-005**: I pulsanti UI "Sì"/"No" DEVONO essere sufficientemente grandi (min 80x40px) per click/touch facili
- **NFR-006**: Il display DEVE mostrare chiaramente lo stato FUORI_SERVIZIO con colore rosso/arancione e icona ⚠️
- **NFR-007**: I log DEVONO includere timestamp in formato ISO 8601 o `HH:MM:SS` per facilità lettura
### Entità Chiave

- **SensoreCassetta**: Simula sensore hardware, rileva apertura/chiusura cassetta, attributi: `stato` (aperta/chiusa)
- **Suoneria**: Componente audio, riproduce suono continuo in loop, attributi: `attiva` (true/false), `volume` (0-1)
- **OperazioneSvuotamento**: Entità di processo, traccia operazione in corso, attributi: `timestampApertura`, `codiceOperatore`, `timestampChiusura`, `saldoPrima`, `saldoDopo`, `azzerato` (boolean)
- **Chiosco (FSM)**: Aggiunge nuovi stati: `MANUTENZIONE_CASSETTA_APERTA`, `MANUTENZIONE_AUTH_PENDING`, `MANUTENZIONE_ATTESA_CHIUSURA`, `MANUTENZIONE_SCELTA_AZZERAMENTO`, `FUORI_SERVIZIO`
- **Gettoniera**: Modifica: aggiunge metodo `azzeraSaldo()` per reset saldo a 0,00€
- **Display**: Modifica: aggiunge metodo `mostraFuoriServizio()` con stile visivo distintivo (rosso, icona ⚠️)

## Criteri di Successo *(obbligatorio)*

### Risultati Misurabili

- **SC-001**: Un operatore autorizzato può completare un'operazione di svuotamento cassetta (apertura → autenticazione → chiusura → azzeramento) in meno di 30 secondi
- **SC-002**: Il countdown 10 secondi è visibile e aggiorna ogni secondo con precisione ±200ms
- **SC-003**: Il sistema entra in FUORI_SERVIZIO entro 500ms dal timeout countdown
- **SC-004**: La suoneria si attiva entro 300ms dall'entrata in FUORI_SERVIZIO
- **SC-005**: Un operatore può ripristinare il sistema da FUORI_SERVIZIO con carta autorizzata in meno di 10 secondi
- **SC-006**: Il sistema rifiuta il 100% degli input cliente (monete, pagamenti, accessi) quando in FUORI_SERVIZIO
- **SC-007**: I log console includono il 100% degli eventi richiesti (apertura, auth, chiusura, saldo, azzeramento, fuori servizio, reset) con timestamp
- **SC-008**: Zero breaking changes: feature 001 e 002 continuano a funzionare identicamente quando chiosco è in stato IDLE normale
- **SC-009**: I pulsanti "Sì"/"No" rispondono al click entro 100ms e si disabilitano immediatamente
- **SC-010**: Il saldo gettoniera si azzera correttamente (0,00€) quando operatore sceglie "Sì", e rimane invariato quando sceglie "No" (verifica con console log)

## Assunzioni

- La cassetta monete è simulata via UI (pulsanti "Apri Cassetta" / "Chiudi Cassetta" in area debug o admin)
- Il sensore cassetta è un componente virtuale che emette eventi `cassettaAperta` e `cassettaChiusa`
- Le carte autorizzate per operatori sono la **stessa lista** utilizzata per accesso clienti (feature 001): numeri da 1 a 99 hardcoded (es. 42, 50, 99)
- Non esiste distinzione tra "carta operatore" e "carta cliente autorizzata": entrambe usano lo stesso meccanismo di validazione (`Validatore.isCodiceAutorizzato()`)
- La suoneria è simulata via Web Audio API o tag `<audio>` con file audio loop (es. `assets/audio/alarm.mp3` o beep generato)
- Il saldo gettoniera è mantenuto in memoria durante la sessione (no persistenza localStorage), quindi ricaricamento pagina resetta saldo
- L'operazione di svuotamento è **atomica**: una volta iniziata (cassetta aperta), deve completare (timeout o successo) prima di accettare nuove operazioni
- Durante MANUTENZIONE, il chiosco NON accetta input da clienti (monete, pagamenti, QR, carte) **tranne** per reset da FUORI_SERVIZIO
- La suoneria può essere disabilitata via DevTools per testing (variabile globale `window.suoneriaEnabled = false`)
- Il timeout 10 secondi è hardcoded (non configurabile) per semplicità MVP
- I codici autorizzati sono determinati da regole hardcoded già esistenti: numeri da 1 a 99 (es. "42", "50", "99") validati tramite `Validatore.isCodiceAutorizzato(codice)`
- Tutti i testi e messaggi sono in lingua italiana (come per feature 001)

## Dipendenze

- **Feature 001**: Usa stesso meccanismo validazione codici autorizzati (`Validatore.isCodiceAutorizzato()`)
- **Feature 001**: Modifica FSM `Chiosco` esistente aggiungendo nuovi stati manutenzione
- **Feature 001**: Modifica classe `Gettoniera` aggiungendo metodo `azzeraSaldo()`
- **Feature 001**: Modifica classe `Display` aggiungendo metodi `mostraFuoriServizio()` e `mostraCountdown()`
- **Constitution Principle V (Observability)**: I log console sono obbligatori per audit trail
- **Constitution Principle III (JavaScript Vanilla)**: Suoneria implementata con Web Audio API nativa o `<audio>` tag HTML5
- **Constitution Principle IV (Build-Free)**: Nessun bundler, nessun transpiling - tutto ES6+ nativo browser

## Out of Scope (Non incluso in questa feature)

- **Persistenza saldo**: Il saldo gettoniera NON è persistito in localStorage. Ricaricamento pagina → saldo resettato.
- **Storico operazioni**: Non viene mantenuto uno storico delle operazioni di svuotamento (solo log console real-time).
- **Autenticazione multi-livello**: Non esistono "ruoli" (admin, operatore, cliente). Solo "autorizzato" vs "non autorizzato" tramite codice numerico.
- **Configurazione timeout**: Il timeout 10s è hardcoded, non configurabile via UI o config file.
- **SMS/Email notifiche**: Quando chiosco va in FUORI_SERVIZIO, non invia notifiche esterne (solo suoneria locale).
- **Remote reset**: Non è possibile resettare il chiosco da remoto. Solo reset locale con carta fisica.
- **Conta monete fisica**: Non viene tracciato il numero di monete inserite, solo il saldo totale in euro.
- **Integrazione hardware reale**: Nessuna integrazione con sensori/serrature reali. Tutto simulato via UI.

## Note Implementazione

### Modifiche FSM (js/chiosco.js)

Aggiungere nuovi stati:
```javascript
'MANUTENZIONE_AUTH_PENDING': ['MANUTENZIONE_ATTESA_CHIUSURA', 'FUORI_SERVIZIO', 'IDLE'],
'MANUTENZIONE_ATTESA_CHIUSURA': ['MANUTENZIONE_SCELTA_AZZERAMENTO', 'FUORI_SERVIZIO'],
'MANUTENZIONE_SCELTA_AZZERAMENTO': ['IDLE'],
'FUORI_SERVIZIO': ['IDLE']  // Solo tramite reset autorizzato
```

### Nuovi Componenti

1. **SensoreCassetta** (`js/sensore-cassetta.js`):
   - Simula sensore apertura/chiusura
   - Emette eventi `cassettaAperta`, `cassettaChiusa`
   - Collegato a pulsanti UI in area admin/debug

2. **Suoneria** (`js/suoneria.js`):
   - Gestisce riproduzione audio loop
   - Metodi: `attiva()`, `disattiva()`, `isAttiva()`
   - Usa Web Audio API o `<audio>` tag

3. **GestoreManutenzione** (`js/gestore-manutenzione.js`):
   - Gestisce timer countdown 10s
   - Traccia operazione svuotamento in corso
   - Logger eventi manutenzione

### UI Modifiche (index.html)

Aggiungere:
- Area admin con pulsanti "Apri Cassetta" / "Chiudi Cassetta" (visibile sempre o toggle con F12)
- Display supporta countdown visivo (numero grande + barra progressiva)
- Pulsanti "Sì" / "No" per scelta azzeramento (appaiono solo quando richiesto)
- Icona 🔊 o ⚠️ quando suoneria attiva

### CSS Modifiche (css/components.css)

Aggiungere:
- `.display.fuori-servizio`: sfondo rosso/arancione, testo grande, icona ⚠️
- `.display.manutenzione`: sfondo giallo, testo "Manutenzione in corso"
- `.countdown-timer`: font size grande (3rem), colore rosso quando < 3s
- `.btn-azzeramento`: pulsanti grandi per "Sì"/"No"

### Audio File

Opzioni:
1. **Generare beep con Web Audio API** (preferito - no file esterni)
2. **File audio esterno**: `assets/audio/alarm.mp3` (loop continuo)

---

**Stato specifica**: ✅ Completa e pronta per review
**Prossimi passi**: Validazione requirements.md → Generazione plan.md → Implementazione
