# Piano di Implementazione: Simulatore Chiosco Ingresso

**Branch**: `001-un-mockup-che` | **Data**: 2025-10-15 | **Spec**: [spec.md](./spec.md)
**Input**: Specifica funzionalità da `/specs/001-un-mockup-che/spec.md`

**Nota**: Questo file è stato compilato dal comando `/speckit.plan`. Vedere `.specify/templates/commands/plan.md` per il workflow di esecuzione.

## Riepilogo

Simulatore web-based di un chiosco ingresso con display interattivo, gettoniera virtuale, lettore di carte contactless, scanner QR e porta controllata. Gli utenti possono accedere pagando 1,20€ tramite monete o carta di credito, oppure mostrando codici autorizzati (QR o carta contactless). L'approccio tecnico utilizza HTML/CSS/JavaScript vanilla per creare un'interfaccia web statica con simulazioni visive dei componenti hardware e gestione dello stato lato client.

## Contesto Tecnico

**Linguaggio/Versione**: HTML5 + CSS3 + JavaScript ES6+ (supportato nativamente dai browser moderni)
**Dipendenze Principali**: Nessuna libreria esterna per logica principale; libreria di logging leggera per osservabilità (es. loglevel, console-log-level)
**Storage**: Nessun storage persistente richiesto - regole validazione hardcoded nel codice
**Testing**: Testing manuale nel browser con checklist di accettazione derivate dagli scenari spec.md (compatibilità: ultime 2 versioni Chrome, Firefox, Safari, Edge)
**Piattaforma Target**: Browser web moderni su desktop/tablet (risoluzione minima 1024x768)
**Tipo di Progetto**: single (applicazione web statica standalone)
**Obiettivi di Performance**: Feedback UI < 1 secondo, animazioni fluide a 60fps, caricamento iniziale < 2 secondi
**Vincoli**: Nessun server backend, nessun build step, tutti i testi in italiano, accessibile da file:// o http server statico
**Scala/Scope**: Singolo utente alla volta, ~500 righe di JavaScript, 5-7 componenti UI principali

## Constitution Check

*GATE: Deve essere superato prima della Fase 0 ricerca. Ricontrollare dopo design Fase 1.*

### Principio I: Lingua Utilizzata
✅ **CONFORME** - Tutti i testi UI, commenti codice, variabili leggibili, messaggi display in italiano

### Principio II: Architettura Static-First
✅ **CONFORME** - Applicazione completamente statica (HTML/CSS/JS), deployabile su CDN o file server semplice

### Principio III: Preferenza per JavaScript Vanilla
⚠️ **VIOLAZIONE GIUSTIFICATA** - Utilizzo di libreria logging per Osservabilità (Principio V)
- Vedi Complexity Tracking per giustificazione

### Principio IV: Build-Free di Default
✅ **CONFORME** - Nessun bundler, transpiler o step di build richiesto. File JS/CSS linkati direttamente.

### Principio V: Osservabilità
✅ **CONFORME** - Logging completo su console browser con libreria configurabile per livelli gravità

**Decisione Gate**: ✅ **PASS** - Una violazione giustificata (logging library), tutte le altre conformi

## Struttura Progetto

### Documentazione (questa funzionalità)

```
specs/001-un-mockup-che/
├── plan.md              # Questo file (output comando /speckit.plan)
├── spec.md              # Specifica funzionale
├── research.md          # Output Fase 0 (output comando /speckit.plan)
├── data-model.md        # Output Fase 1 (output comando /speckit.plan)
├── quickstart.md        # Output Fase 1 (output comando /speckit.plan)
├── contracts/           # Output Fase 1 (output comando /speckit.plan) - N/A per questa feature
│   └── (nessun contratto API necessario - solo web statico)
├── checklists/
│   └── requirements.md  # Checklist qualità specifica
└── tasks.md             # Output Fase 2 (comando /speckit.tasks - NON creato da /speckit.plan)
```

### Codice Sorgente (repository root)

```
/
├── index.html           # Punto di ingresso - layout chiosco
├── css/
│   ├── styles.css       # Stili generali
│   ├── components.css   # Stili componenti (display, gettoniera, lettori, porta)
│   └── animations.css   # Animazioni apertura porta, feedback visivi
├── js/
│   ├── app.js           # Inizializzazione applicazione, orchestrazione
│   ├── chiosco.js       # Classe principale Chiosco, macchina a stati
│   ├── display.js       # Gestione display (messaggi, importi, countdown)
│   ├── gettoniera.js    # Simulazione gettoniera, calcolo importo rimanente
│   ├── lettore-carte.js # Simulazione lettore contactless (pagamento VISA + autorizzazione)
│   ├── lettore-qr.js    # Simulazione scanner QR
│   ├── porta.js         # Simulazione porta (apertura/chiusura, timer)
│   ├── validatore.js    # Validazione codici hardcoded (1-99) e carte VISA
│   └── logger.js        # Wrapper libreria logging, configurazione livelli
├── assets/
│   ├── images/
│   │   ├── monete/      # Icone monete euro
│   │   ├── carta.svg    # Icona carta contactless
│   │   ├── qrcode.svg   # Icona QR code
│   │   └── porta.svg    # Visualizzazione porta
│   └── lib/
│       └── loglevel.min.js  # Libreria logging (unica dipendenza esterna)
└── specs/               # Specifiche funzionalità (gestite da SpecKit)
```

**Decisione Struttura**: Utilizziamo struttura "Single project" con organizzazione file logica per componente. Non serve separazione src/ perché è un progetto statico semplice. File JS organizzati per entità del dominio (chiosco, display, gettoniera, lettori, porta). File CSS separati per manutenibilità (generale, componenti, animazioni). Asset organizzati per tipo (immagini per UI, lib per dipendenze esterne).

## Complexity Tracking

| Violazione | Perché Necessaria | Alternativa Più Semplice Rifiutata Perché |
|-----------|-------------------|-------------------------------------------|
| Libreria logging (viola Principio III) | Principio V (Osservabilità) richiede logging con livelli di gravità configurabili. Console nativa non supporta configurazione livelli (DEBUG, INFO, WARN, ERROR) centralizz ata. | `console.log/warn/error` nativo insufficiente: nessuna possibilità di disabilitare selettivamente livelli, richiede ricerca/sostituzione manuale per cambiare verbosità, non supporta prefissi/timestamp automatici. Libreria loglevel (4KB minified) fornisce API minima con configurazione livelli runtime. |

## Fase 0: Ricerca e Decisioni Tecniche

Vedi [research.md](./research.md) per decisioni dettagliate su:
- Scelta libreria logging (loglevel vs altri)
- Pattern gestione stato chiosco (State Machine vs Redux-like)
- Regole validazione codici hardcoded (numeri 1-99, solo VISA per pagamenti)
- Simulazione lettura QR (input manuale vs file upload vs camera API)
- Timer e gestione timeout (setTimeout vs requestAnimationFrame)

## Fase 1: Design e Modello Dati

### Modello Dati

Vedi [data-model.md](./data-model.md) per schema completo entità:
- ChioscoState (macchina a stati: IDLE, PAGAMENTO_MONETE, PAGAMENTO_CARTA, VERIFICA_QR, VERIFICA_CARTA, PORTA_APERTA, TIMEOUT)
- DisplayContent (messaggi, importo rimanente, countdown)
- Gettoniera (importoRimanente, moneteInserite[])
- LettoreCarte (modalità: PAGAMENTO | AUTORIZZAZIONE, statoTransazione, validazione VISA)
- LettoreQR (codiceScansionato, statoVerifica)
- Porta (stato: APERTA | CHIUSA, timerChiusura)
- ValidatoreCodici (logica hardcoded: numeri 1-99 validi)

### Contratti API

**N/A** - Non ci sono API REST/GraphQL perché l'applicazione è completamente client-side senza backend.

### Quickstart

Vedi [quickstart.md](./quickstart.md) per:
- Istruzioni apertura `index.html` in browser
- Regole validazione hardcoded (codici 1-99, solo VISA per pagamenti)
- Guida interazione con simulatore (inserimento monete, pagamento carta, scansione QR)
- Troubleshooting comune (browser non supportato, JavaScript disabilitato)

## Fase 2: Test di Accettazione

### Approccio Testing

**Metodologia**: Testing manuale esplorativo guidato da checklist di accettazione derivate dagli scenari definiti in spec.md

**Strumenti**:
- Browser DevTools (console per verificare log, network per verificare nessuna chiamata backend)
- Checklist cartacea o digitale per tracking copertura scenari
- Timer/cronometro per verificare criteri di successo temporali

**Ambiente**:
- Browser target: ultime 2 versioni di Chrome, Firefox, Safari, Edge
- Risoluzioni: 1024x768 (minimo), 1920x1080 (desktop standard), 1366x768 (laptop comune)
- Protocolli: file:// e http://localhost:8000 (Python http.server)

**Livelli di gravità difetti**:
- **Critico**: Porta non si apre dopo pagamento corretto, crash applicazione, stato inconsistente irreversibile
- **Alto**: Messaggi display errati, animazioni mancanti, timeout non funzionante
- **Medio**: Formattazione importi errata, feedback visivo poco chiaro
- **Basso**: Typo testi, spaziatura UI non ottimale

### Test di Accettazione per User Story

#### US1: Pagamento con Monete (P1 - MVP)

**Prerequisiti**: Aprire `index.html` in browser, verificare display mostra "Benvenuto - Scegli modalità di accesso"

**Scenario 1.1**: Inserimento monete progressivo fino a 1,20€
1. **Azione**: Click pulsante moneta 0,50€
2. **Verifica**: Display mostra "Rimanente: 0,70 €" entro 1 secondo
3. **Verifica**: Console log mostra `[INFO] Moneta inserita: 0.50€, totale: 0.50€, rimanente: 0.70€`
4. **Verifica**: Porta rimane chiusa (visivamente classe CSS `chiusa`)
5. **Azione**: Click pulsante moneta 0,50€
6. **Verifica**: Display mostra "Rimanente: 0,20 €"
7. **Verifica**: Porta rimane chiusa
8. **Azione**: Click pulsante moneta 0,20€
9. **Verifica**: Display mostra "Rimanente: 0,00 €" o "Accesso consentito - Porta aperta"
10. **Verifica**: Porta si apre (animazione scorrimento verso alto, classe CSS `aperta`)
11. **Verifica**: Console log mostra `[INFO] Apertura porta...`
12. **Verifica**: Dopo 15 secondi ±1s, porta si chiude automaticamente
13. **Verifica**: Display torna a "Benvenuto - Scegli modalità di accesso"

**Scenario 1.2**: Sovrapagamento accettato
1. **Azione**: Click pulsante moneta 1,00€
2. **Verifica**: Display mostra "Rimanente: 0,20 €"
3. **Azione**: Click pulsante moneta 0,50€
4. **Verifica**: Display mostra "Rimanente: 0,00 €" (non importo negativo)
5. **Verifica**: Porta si apre immediatamente

**Scenario 1.3**: Timeout inattività 20s con countdown
1. **Azione**: Click pulsante moneta 0,50€
2. **Verifica**: Display mostra "Rimanente: 0,70 €"
3. **Verifica**: Countdown timer visibile (es. "Timeout: 20s", "19s", "18s"...)
4. **Azione**: Attendere 20 secondi senza ulteriori azioni
5. **Verifica**: Display mostra messaggio timeout (es. "Timeout - Operazione annullata")
6. **Verifica**: Sistema torna a stato IDLE (display "Benvenuto...")
7. **Verifica**: Console log mostra `[WARN] Timeout inattività raggiunto`

**Scenario 1.4**: Reset dopo chiusura porta
1. **Azione**: Completare pagamento con monete (1,20€) e aprire porta
2. **Azione**: Attendere chiusura automatica porta dopo 15s
3. **Verifica**: Display torna a "Benvenuto - Scegli modalità di accesso"
4. **Verifica**: Importo rimanente resettato a 1,20€ per prossimo utente
5. **Verifica**: Console log mostra `[INFO] Sistema resettato a stato IDLE`

#### US2: Pagamento con Carta di Credito (P2)

**Prerequisiti**: Stessi di US1

**Scenario 2.1**: Transazione carta VISA accettata
1. **Azione**: Click pulsante "Paga con Carta"
2. **Verifica**: Display mostra "Avvicina la carta al lettore"
3. **Verifica**: Altri input disabilitati (pulsanti monete, QR, verifica carta grigi/disabilitati)
4. **Azione**: Click area lettore carte (simula avvicinamento carta VISA "4111111111111111")
5. **Verifica**: Display mostra "Elaborazione..." per 1-2 secondi
6. **Verifica**: Display mostra "Pagamento accettato"
7. **Verifica**: Porta si apre con animazione
8. **Verifica**: Console log mostra `[INFO] Transazione carta: ACCETTATA`

**Scenario 2.2**: Transazione carta rifiutata
1. **Azione**: Click "Paga con Carta" → click area lettore (simula fallimento randomizzato)
2. **Verifica**: Display mostra "Elaborazione..." poi "Pagamento rifiutato - Riprova"
3. **Verifica**: Porta rimane chiusa
4. **Verifica**: Sistema torna a IDLE entro 3 secondi
5. **Verifica**: Console log mostra `[WARN] Transazione carta: RIFIUTATA`

**Scenario 2.3**: Carta NON-VISA rifiutata (validazione hardcoded)
1. **Azione**: Inserire numero carta Mastercard "5500000000000004" tramite console:
   ```javascript
   Validatore.isCartaVISA("5500000000000004"); // false
   ```
2. **Verifica**: Console ritorna `false`
3. **Verifica**: In simulatore, carta non VISA viene rifiutata con messaggio appropriato

**Scenario 2.4**: Annullamento transazione
1. **Azione**: Click "Paga con Carta"
2. **Azione**: Click fuori area lettore prima completamento (simula allontanamento carta)
3. **Verifica**: Display mostra "Transazione annullata"
4. **Verifica**: Porta rimane chiusa
5. **Verifica**: Input riabilitati

#### US3: Accesso con QR Code Autorizzato (P3)

**Prerequisiti**: Stessi di US1

**Scenario 3.1**: QR code autorizzato (1-99)
1. **Azione**: Digitare "42" nel campo input QR
2. **Azione**: Click pulsante "Scansiona QR"
3. **Verifica**: Display mostra "Verifica in corso..."
4. **Verifica**: Display mostra "Accesso autorizzato" entro 1 secondo
5. **Verifica**: Porta si apre immediatamente (no delay)
6. **Verifica**: Console log mostra `[INFO] QR code 42: AUTORIZZATO`

**Scenario 3.2**: QR code NON autorizzato (fuori range 1-99)
1. **Azione**: Digitare "100" nel campo input QR
2. **Azione**: Click "Scansiona QR"
3. **Verifica**: Display mostra "Accesso negato"
4. **Verifica**: Porta rimane chiusa
5. **Verifica**: Console log mostra `[WARN] QR code 100: NON AUTORIZZATO`
6. **Verifica**: Sistema torna a IDLE entro 3 secondi

**Scenario 3.3**: QR code malformato (non numerico)
1. **Azione**: Digitare "ABC" nel campo input QR
2. **Azione**: Click "Scansiona QR"
3. **Verifica**: Display mostra "Errore lettura QR"
4. **Verifica**: Porta rimane chiusa
5. **Verifica**: Console log mostra `[ERROR] QR code ABC: MALFORMATO`

**Scenario 3.4**: Codici limite range (1 e 99)
1. **Azione**: Testare codice "1" → verifica autorizzato ✅
2. **Azione**: Testare codice "99" → verifica autorizzato ✅
3. **Azione**: Testare codice "0" → verifica NON autorizzato ❌
4. **Azione**: Testare codice "100" → verifica NON autorizzato ❌

**Scenario 3.5**: Input disabilitati durante verifica QR
1. **Azione**: Click "Scansiona QR"
2. **Verifica**: Durante elaborazione (1-2s), pulsanti monete/carte disabilitati
3. **Verifica**: Non è possibile avviare altre operazioni contemporaneamente

#### US4: Accesso con Carta Contactless Autorizzata (P3)

**Prerequisiti**: Stessi di US1

**Scenario 4.1**: Carta contactless autorizzata (codice 1-99)
1. **Azione**: Click pulsante "Verifica Carta Autorizzata"
2. **Verifica**: Display mostra "Inserisci codice carta autorizzata"
3. **Azione**: Digitare "50" nel campo input carta
4. **Azione**: Click "Verifica"
5. **Verifica**: Display mostra "Accesso autorizzato"
6. **Verifica**: Porta si apre immediatamente
7. **Verifica**: Console log mostra `[INFO] Carta contactless 50: AUTORIZZATA`

**Scenario 4.2**: Carta contactless NON autorizzata
1. **Azione**: Click "Verifica Carta Autorizzata"
2. **Azione**: Digitare "200" e click "Verifica"
3. **Verifica**: Display mostra "Accesso negato - Effettua pagamento"
4. **Verifica**: Porta rimane chiusa
5. **Verifica**: Sistema torna a IDLE

**Scenario 4.3**: Differenziazione tra "Paga con Carta" e "Verifica Carta Autorizzata"
1. **Verifica**: Due pulsanti distinti visibili
2. **Azione**: Click "Paga con Carta" → verifica richiede carta VISA per pagamento 1,20€
3. **Azione**: Reset e click "Verifica Carta Autorizzata" → verifica richiede codice 1-99

### Test di Validazione Regole Hardcoded

**Test Console Browser**:

```javascript
// Test validazione codici QR/Carte (1-99)
console.assert(Validatore.isCodiceAutorizzato("1") === true, "Codice 1 deve essere autorizzato");
console.assert(Validatore.isCodiceAutorizzato("42") === true, "Codice 42 deve essere autorizzato");
console.assert(Validatore.isCodiceAutorizzato("99") === true, "Codice 99 deve essere autorizzato");
console.assert(Validatore.isCodiceAutorizzato("0") === false, "Codice 0 NON deve essere autorizzato");
console.assert(Validatore.isCodiceAutorizzato("100") === false, "Codice 100 NON deve essere autorizzato");
console.assert(Validatore.isCodiceAutorizzato("ABC") === false, "Codice ABC NON deve essere autorizzato");

// Test validazione carte VISA (inizia con "4")
console.assert(Validatore.isCartaVISA("4111111111111111") === true, "Carta VISA deve essere accettata");
console.assert(Validatore.isCartaVISA("4012888888881881") === true, "Carta VISA deve essere accettata");
console.assert(Validatore.isCartaVISA("5500000000000004") === false, "Mastercard NON deve essere accettata");
console.assert(Validatore.isCartaVISA("340000000000009") === false, "Amex NON deve essere accettata");
console.assert(Validatore.isCartaVISA("6011000000000004") === false, "Discover NON deve essere accettata");

console.log("✅ Tutti i test validazione superati");
```

### Test Casi Limite e Edge Cases

**Caso Limite 1**: Sovrapagamento monete
- **Setup**: Inserire 1,50€ invece di 1,20€
- **Verifica**: Porta si apre, display mostra 0,00€ (non importo negativo), nessun resto erogato

**Caso Limite 2**: Passaggio da monete a carta
- **Setup**: Inserire 0,50€ con monete
- **Azione**: Click "Paga con Carta"
- **Verifica**: Importo monete azzerato, transazione carta elaborata per 1,20€ (non 0,70€)

**Caso Limite 3**: Chiusura porta e reset stato
- **Setup**: Aprire porta con qualsiasi metodo
- **Verifica**: Dopo 15s chiusura, display torna a schermata iniziale "Benvenuto..."
- **Verifica**: Prossimo utente inizia da stato pulito (no memoria transazioni precedenti)

**Caso Limite 4**: Tentativi simultanei prevenuti
- **Setup**: Avviare verifica QR code
- **Azione**: Durante elaborazione, tentare click pulsanti monete/carte
- **Verifica**: Input disabilitati (pulsanti non rispondono, visivamente grigi)

**Caso Limite 5**: Timeout durante pagamento parziale
- **Setup**: Inserire 0,50€, attendere 20s
- **Verifica**: Sistema resetta, importo 0,50€ perso (no recupero)
- **Verifica**: Display mostra countdown durante timeout

### Test di Performance e Criteri di Successo

**SC-001**: Completamento pagamento monete < 30s
- **Metodo**: Cronometrare inserimento 3 monete (es. 0,50€, 0,50€, 0,20€) dall'inizio a porta aperta
- **Target**: < 30 secondi
- **Verifica**: Feedback immediato (<1s) ad ogni click moneta

**SC-002**: Completamento pagamento carta < 10s
- **Metodo**: Cronometrare da click "Paga con Carta" a porta aperta
- **Target**: < 10 secondi (include 1-2s simulazione elaborazione)

**SC-003**: Accesso QR/carta autorizzata < 5s
- **Metodo**: Cronometrare da inserimento codice a porta aperta
- **Target**: < 5 secondi

**SC-004**: Feedback UI < 1s
- **Metodo**: Verificare timestamp console log tra azione utente e aggiornamento display
- **Target**: < 1000ms

**SC-007**: Risoluzione minima 1024x768
- **Metodo**: Ridimensionare finestra browser a 1024x768, verificare tutti componenti visibili e usabili
- **Verifica**: No scroll orizzontale, pulsanti cliccabili, testi leggibili

**SC-008**: Componenti hardware riconoscibili
- **Metodo**: Test utente con 5 persone: identificare display, gettoniera, lettori senza assistenza
- **Target**: 100% identificazione corretta

### Compatibilità Browser

**Test da eseguire su ogni browser**:
- Chrome ultime 2 versioni (es. 118, 119)
- Firefox ultime 2 versioni (es. 119, 120)
- Safari ultime 2 versioni (es. 17.0, 17.1 - solo su macOS)
- Edge ultime 2 versioni (es. 118, 119)

**Checklist compatibilità per browser**:
- [ ] Caricamento `index.html` senza errori console
- [ ] CSS Grid/Flexbox layout corretto
- [ ] Animazioni CSS fluide (apertura porta)
- [ ] setTimeout/setInterval funzionanti (timeout 20s, countdown)
- [ ] Event listener pulsanti funzionanti
- [ ] Console logging tramite loglevel visibile

### Procedura Test Completo

**Durata stimata**: 60-90 minuti per esecuzione completa

1. **Setup** (5 min): Aprire `index.html` in browser, aprire DevTools console, impostare `log.setLevel('debug')`
2. **Test US1** (15 min): Eseguire tutti gli scenari pagamento monete
3. **Test US2** (15 min): Eseguire scenari pagamento carta VISA
4. **Test US3** (10 min): Eseguire scenari QR code (compresi limiti 1, 99, 0, 100)
5. **Test US4** (10 min): Eseguire scenari carta contactless autorizzata
6. **Test Validazione Console** (5 min): Eseguire script console assert
7. **Test Casi Limite** (15 min): Eseguire 5 casi limite definiti
8. **Test Performance** (10 min): Cronometrare scenari SC-001, SC-002, SC-003
9. **Test Compatibilità** (10 min per browser): Ripetere test critici su 4 browser
10. **Report** (10 min): Documentare difetti trovati con priorità

### Criteri di Rilascio

**Criteri MUST (bloccanti)**:
- ✅ Tutti gli scenari US1 (P1) superati senza difetti critici
- ✅ Validazione hardcoded funzionante (codici 1-99, solo VISA)
- ✅ Porta si apre/chiude correttamente in tutti i flussi
- ✅ Timeout 20s funzionante con countdown
- ✅ Nessun errore JavaScript console in condizioni normali
- ✅ Compatibilità Chrome e Firefox (minimo 2 browser)

**Criteri SHOULD (non bloccanti ma desiderabili)**:
- ✅ Tutti gli scenari US2, US3, US4 superati
- ✅ Animazioni fluide (60fps)
- ✅ Compatibilità Safari e Edge
- ✅ Feedback UI < 1s per tutte le operazioni

**Difetti Non Bloccanti**:
- Typo nei messaggi display (correggibili post-release)
- Spaziatura UI non ottimale
- Log console troppo verbosi (configurabili runtime)
