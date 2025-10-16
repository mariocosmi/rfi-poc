# Piano di Implementazione: Chiusura Porta su Passaggio Persona

**Branch**: `002-la-porta-deve` | **Data**: 2025-10-16 | **Spec**: [spec.md](./spec.md)
**Input**: Specifica funzionalità da `/specs/002-la-porta-deve/spec.md`

**Nota**: Questo file è stato compilato dal comando `/speckit.plan`. Vedere `.specify/templates/commands/plan.md` per il workflow di esecuzione.

## Riepilogo

Aggiunta di un pulsante "Persona passata" che permette la chiusura immediata della porta dopo il passaggio dell'utente, riducendo i tempi di attesa tra utenti da ~15s (timeout automatico) a ~4-5s (passaggio + chiusura). Il pulsante è visibile solo quando la porta è aperta e registra eventi di passaggio nei log. L'approccio tecnico utilizza HTML/CSS/JavaScript vanilla per estendere il sistema FSM esistente con una nuova transizione PORTA_APERTA → IDLE su evento manuale.

## Contesto Tecnico

**Linguaggio/Versione**: HTML5 + CSS3 + JavaScript ES6+ (supportato nativamente dai browser moderni)
**Dipendenze Principali**: Nessuna nuova dipendenza - utilizzo di loglevel esistente
**Storage**: Nessun storage persistente richiesto
**Testing**: Testing manuale nel browser con scenari definiti in spec.md (compatibilità: ultime 2 versioni Chrome, Firefox, Safari, Edge)
**Piattaforma Target**: Browser web moderni su desktop/tablet (risoluzione minima 1024x768)
**Tipo di Progetto**: single (applicazione web statica standalone - modifica a feature esistente 001)
**Obiettivi di Performance**: Chiusura porta entro 2s dal click, animazione fluida a 60fps, feedback UI < 500ms
**Vincoli**: Integrazione con FSM esistente senza breaking changes, mantenere compatibilità con feature 001
**Scala/Scope**: Aggiunta ~100 righe JavaScript, 1 nuovo componente UI (pulsante), modifica a 2 componenti esistenti (Chiosco FSM, Porta)

## Constitution Check

*GATE: Deve essere superato prima della Fase 0 ricerca. Ricontrollare dopo design Fase 1.*

### Principio I: Lingua Utilizzata
✅ **CONFORME** - Pulsante con testo italiano "Persona passata", log in italiano, commenti codice in italiano

### Principio II: Architettura Static-First
✅ **CONFORME** - Nessuna modifica all'architettura statica, solo aggiunta HTML/CSS/JS client-side

### Principio III: Preferenza per JavaScript Vanilla
✅ **CONFORME** - Utilizzo solo JavaScript vanilla, nessuna nuova dipendenza o framework

### Principio IV: Build-Free di Default
✅ **CONFORME** - Nessun build step aggiunto, file JS/CSS linkati direttamente come feature 001

### Principio V: Osservabilità
✅ **CONFORME** - Logging completo eventi passaggio persona usando loglevel esistente

**Decisione Gate**: ✅ **PASS** - Tutti i principi rispettati, nessuna violazione

## Struttura Progetto

### Documentazione (questa funzionalità)

```
specs/002-la-porta-deve/
├── plan.md              # Questo file (output comando /speckit.plan)
├── spec.md              # Specifica funzionale
├── research.md          # Output Fase 0 (output comando /speckit.plan)
├── data-model.md        # Output Fase 1 (output comando /speckit.plan)
├── quickstart.md        # Output Fase 1 (output comando /speckit.plan)
├── contracts/           # N/A per questa feature (solo web statico)
├── checklists/
│   └── requirements.md  # Checklist qualità specifica
└── tasks.md             # Output Fase 2 (comando /speckit.tasks - NON creato da /speckit.plan)
```

### Codice Sorgente (repository root)

```
/
├── index.html           # MODIFICATO: aggiunto pulsante "Persona passata" nell'area porta
├── css/
│   ├── styles.css       # NON MODIFICATO
│   ├── components.css   # MODIFICATO: stili pulsante passaggio (visibilità condizionale)
│   └── animations.css   # NON MODIFICATO (usa animazioni chiusura esistenti)
├── js/
│   ├── app.js           # MODIFICATO: event handler pulsante "Persona passata"
│   ├── chiosco.js       # MODIFICATO: nuova transizione PORTA_APERTA → IDLE su evento manuale
│   ├── display.js       # MODIFICATO: nuovo messaggio "Passaggio rilevato - Porta in chiusura"
│   ├── porta.js         # MODIFICATO: metodo chiudiManuale(), tracking tempo apertura
│   ├── gettoniera.js    # NON MODIFICATO
│   ├── lettore-carte.js # NON MODIFICATO
│   ├── lettore-qr.js    # NON MODIFICATO
│   ├── validatore.js    # NON MODIFICATO
│   └── logger.js        # NON MODIFICATO (usa loglevel esistente)
├── assets/              # NON MODIFICATO
└── specs/               # Specifiche funzionalità (gestite da SpecKit)
```

**Decisione Struttura**: Modifica a feature esistente 001-un-mockup-che. Non serve nuova struttura, solo estensione componenti esistenti. Modifica minimale e backward-compatible: aggiunta pulsante HTML, stili CSS condizionali, gestione evento JS, logging. Nessun impatto su funzionalità esistenti (pagamento monete, carta, QR, autorizzazioni).

## Complexity Tracking

Nessuna violazione - tutti i principi costituzionali rispettati.

## Fase 0: Ricerca e Decisioni Tecniche

Vedi [research.md](./research.md) per decisioni dettagliate su:
- Integrazione con FSM esistente (nuova transizione vs nuovo stato)
- Gestione timer chiusura automatica (cancellazione vs override)
- Posizionamento pulsante UI (vicino porta vs area separata)
- Visibilità condizionale pulsante (CSS classes vs JavaScript display)
- Tracking tempo apertura porta (nuovo attributo vs calcolo runtime)
- Gestione click multipli (debouncing vs flag stato)

## Fase 1: Design e Modello Dati

### Modello Dati

Vedi [data-model.md](./data-model.md) per schema completo modifiche entità:
- **Porta**: Aggiunti attributi `timestampApertura`, `motivoApertura`, metodo `chiudiManuale()`
- **Chiosco FSM**: Nuova transizione `PORTA_APERTA → IDLE` su evento `passaggio_persona`
- **Display**: Nuovo messaggio `"Passaggio rilevato - Porta in chiusura"`
- **PulsantePassaggio**: Nuovo componente UI (elemento HTML + stili CSS + event handler)

### Contratti API

**N/A** - Non ci sono API REST/GraphQL perché l'applicazione è completamente client-side senza backend.

### Quickstart

Vedi [quickstart.md](./quickstart.md) per:
- Istruzioni test funzionalità pulsante passaggio
- Guida verifica visibilità pulsante in diversi stati
- Troubleshooting comuni (pulsante non visibile, click non risponde)
- Esempio log console per eventi passaggio persona

## Fase 2: Test di Accettazione

### Approccio Testing

**Metodologia**: Testing manuale esplorativo guidato da scenari definiti in spec.md, estendendo checklist testing feature 001

**Strumenti**:
- Browser DevTools (console per verificare log passaggio persona, Elements per verificare visibilità pulsante)
- Cronometro per misurare tempo chiusura porta dopo click
- Checklist cartacea o digitale per tracking copertura scenari

**Ambiente**:
- Browser target: ultime 2 versioni di Chrome, Firefox, Safari, Edge
- Risoluzioni: 1024x768 (minimo), 1920x1080 (desktop standard)
- Protocolli: file:// e http://localhost:8000 (Python http.server)

**Livelli di gravità difetti**:
- **Critico**: Pulsante causa crash, porta non si chiude, timer non cancellato correttamente
- **Alto**: Pulsante visibile in stato sbagliato, click multipli causano comportamento errato
- **Medio**: Messaggio display non chiaro, animazione non fluida
- **Basso**: Tooltip mancante, spaziatura pulsante non ottimale

### Test di Accettazione per User Story

#### US1: Chiusura Porta Manuale dopo Passaggio (P1 - MVP)

**Prerequisiti**: Aprire `index.html`, completare pagamento con monete (1,20€), porta aperta

**Scenario 1.1**: Click pulsante chiude immediatamente porta
1. **Azione**: Aprire porta con pagamento monete
2. **Verifica**: Pulsante "Persona passata" visibile nell'area porta
3. **Azione**: Click pulsante "Persona passata" dopo 2 secondi dall'apertura
4. **Verifica**: Display mostra "Passaggio rilevato - Porta in chiusura" per 1-2s
5. **Verifica**: Porta inizia animazione chiusura entro 500ms dal click
6. **Verifica**: Console log mostra `[INFO] Passaggio persona rilevato - Porta aperta da 2s - Metodo: monete`
7. **Verifica**: Porta completamente chiusa entro 2s dal click (includendo animazione)
8. **Verifica**: Display torna a "Benvenuto - Scegli modalità di accesso"
9. **Verifica**: Sistema in stato IDLE, tutti input riabilitati

**Scenario 1.2**: Timer automatico cancellato dopo click manuale
1. **Azione**: Aprire porta con pagamento carta
2. **Verifica**: Timer 15s inizia (verificabile con log `[DEBUG] Timer chiusura automatica avviato`)
3. **Azione**: Click "Persona passata" dopo 5s
4. **Verifica**: Timer 15s cancellato (log `[DEBUG] Timer chiusura automatica cancellato`)
5. **Verifica**: Porta si chiude immediatamente (non attende altri 10s fino a 15s)
6. **Verifica**: Console log mostra `Metodo: carta` nel messaggio passaggio persona

**Scenario 1.3**: Click immediato all'apertura (edge case)
1. **Azione**: Aprire porta con QR code autorizzato (es. "42")
2. **Azione**: Click "Persona passata" entro 200ms dall'apertura
3. **Verifica**: Sistema accetta click e chiude porta normalmente
4. **Verifica**: Log mostra `Porta aperta da 0s` o `< 1s`
5. **Verifica**: Nessun errore JavaScript in console

**Scenario 1.4**: Click a fine timer (edge case)
1. **Azione**: Aprire porta e attendere 14 secondi
2. **Azione**: Click "Persona passata" a 14.5s (prima che timer 15s scada)
3. **Verifica**: Porta si chiude immediatamente, non attende ulteriori 500ms
4. **Verifica**: Log mostra `Porta aperta da 14s` o `15s`

**Scenario 1.5**: Reset completo dopo chiusura manuale
1. **Azione**: Completare chiusura manuale porta
2. **Verifica**: Display torna a schermata iniziale
3. **Verifica**: Pulsante "Persona passata" nascosto/disabilitato
4. **Verifica**: Nuovo utente può iniziare nuovo pagamento immediatamente
5. **Verifica**: Log mostra `[INFO] Sistema resettato a stato IDLE`

#### US2: Indicatore Visivo Pulsante Passaggio (P2)

**Prerequisiti**: Aprire `index.html` in browser

**Scenario 2.1**: Pulsante nascosto in stato IDLE
1. **Verifica**: Pulsante "Persona passata" non visibile o disabilitato (grayed out)
2. **Verifica**: Ispezionando HTML, elemento ha classe `hidden` o `display: none`

**Scenario 2.2**: Pulsante nascosto durante pagamento
1. **Azione**: Inserire 0,50€ con monete (stato PAGAMENTO_MONETE)
2. **Verifica**: Pulsante "Persona passata" non visibile
3. **Azione**: Reset e click "Paga con Carta" (stato PAGAMENTO_CARTA)
4. **Verifica**: Pulsante "Persona passata" non visibile

**Scenario 2.3**: Pulsante visibile quando porta aperta
1. **Azione**: Aprire porta con qualsiasi metodo
2. **Verifica**: Pulsante "Persona passata" diventa visibile entro 500ms
3. **Verifica**: Pulsante cliccabile (non grayed out, cursor pointer)
4. **Verifica**: Posizionamento vicino area porta (associazione visiva)

**Scenario 2.4**: Effetto hover/tooltip
1. **Azione**: Aprire porta
2. **Azione**: Passare mouse sopra pulsante "Persona passata"
3. **Verifica**: Appare tooltip "Clicca dopo aver attraversato" o simile
4. **Verifica**: Effetto hover visivo (cambio colore, bordo, shadow)

**Scenario 2.5**: Pulsante si nasconde dopo chiusura
1. **Azione**: Click "Persona passata", attendere chiusura completa
2. **Verifica**: Durante chiusura, pulsante diventa disabilitato o nascosto
3. **Verifica**: Dopo ritorno a IDLE, pulsante completamente nascosto

#### US3: Logging Passaggio Persona (P3)

**Prerequisiti**: Aprire DevTools console, impostare `log.setLevel('info')`

**Scenario 3.1**: Log completo con metodo monete
1. **Azione**: Pagare con monete (1,20€), attendere 3s, click "Persona passata"
2. **Verifica**: Console mostra `[INFO] Passaggio persona rilevato - Porta aperta da 3s - Metodo: monete`
3. **Verifica**: Log include timestamp (formato HH:MM:SS o ISO)
4. **Verifica**: Informazioni leggibili e formattate correttamente

**Scenario 3.2**: Log con diversi metodi di accesso
1. **Test 1**: Pagamento carta → log mostra `Metodo: carta`
2. **Test 2**: QR code autorizzato → log mostra `Metodo: qr`
3. **Test 3**: Carta contactless autorizzata → log mostra `Metodo: carta-autorizzata`
4. **Verifica**: Ogni log distinguibile e con metodo corretto

**Scenario 3.3**: Log eventi multipli distinguibili
1. **Azione**: Eseguire 3 cicli apertura/chiusura manuale consecutivi
2. **Verifica**: Console mostra 3 log distinti con timestamp diversi
3. **Verifica**: Possibile identificare ordine cronologico eventi
4. **Verifica**: Tempo apertura riflette correttamente durata per ogni ciclo

### Test Casi Limite e Edge Cases

**Caso Limite 1**: Click durante chiusura in corso
- **Setup**: Click "Persona passata", immediatamente dopo click ancora
- **Verifica**: Secondo click ignorato, nessun errore console
- **Verifica**: Porta completa chiusura normalmente

**Caso Limite 2**: Click multipli rapidi
- **Setup**: Click "Persona passata" 5 volte in 500ms
- **Verifica**: Solo primo click processato
- **Verifica**: Nessun errore JavaScript, comportamento stabile

**Caso Limite 3**: Disabilitazione input durante chiusura
- **Setup**: Click "Persona passata", durante chiusura tentare inserire monete
- **Verifica**: Input disabilitati fino a ritorno IDLE
- **Verifica**: Log mostra `[DEBUG] Input disabilitati` se tentato

**Caso Limite 4**: Animazione chiusura interrotta
- **Setup**: Scenario non riproducibile manualmente (richiede modifica codice per test)
- **Nota**: Verificare in code review che callback chiusura gestisca correttamente cleanup

### Test di Performance e Criteri di Successo

**SC-001**: Riduzione tempo medio tra utenti del 40%
- **Metodo**: Misurare con cronometro 10 cicli con timer automatico (15s) vs 10 cicli con chiusura manuale
- **Baseline**: Timer automatico → ~15s per ciclo
- **Target**: Chiusura manuale → ~9s per ciclo (6s risparmiati, 40% riduzione)
- **Calcolo**: Tempo apertura (~3s) + chiusura (~2s) + reset (~1s) = ~6s vs 15s baseline

**SC-002**: 90% utilizzo pulsante
- **Metodo**: Test utente con 10 persone informate della funzionalità
- **Target**: Almeno 9/10 utilizzano pulsante spontaneamente
- **Nota**: Criterio non applicabile senza utenti reali - verificare solo chiarezza UI

**SC-003**: Chiusura entro 2s dal click
- **Metodo**: Cronometrare tempo tra click e porta completamente chiusa
- **Target**: < 2000ms
- **Verifica**: Ripetere test 10 volte, media < 2s

**SC-004**: 95% riconoscibilità pulsante
- **Metodo**: Test utente con 20 persone
- **Target**: Almeno 19/20 identificano correttamente pulsante senza assistenza
- **Nota**: Criterio non applicabile senza utenti reali - verificare solo chiarezza visiva

**SC-005**: Nessun errore in condizioni limite
- **Metodo**: Eseguire tutti i casi limite definiti sopra
- **Target**: Zero errori JavaScript console, comportamento stabile

**SC-006**: Tutti eventi tracciati correttamente
- **Metodo**: Verificare log per ogni scenario US3
- **Target**: 100% log presenti con informazioni complete

### Compatibilità Browser

**Test da eseguire su ogni browser**:
- Chrome ultime 2 versioni
- Firefox ultime 2 versioni
- Safari ultime 2 versioni (solo su macOS)
- Edge ultime 2 versioni

**Checklist compatibilità per browser**:
- [ ] Pulsante "Persona passata" visibile quando porta aperta
- [ ] Click pulsante chiude porta correttamente
- [ ] Animazione chiusura fluida (60fps)
- [ ] Log console funzionanti e leggibili
- [ ] Tooltip/hover funzionante
- [ ] Nessun errore JavaScript console

### Procedura Test Completo

**Durata stimata**: 30-45 minuti per esecuzione completa

1. **Setup** (5 min): Aprire `index.html`, aprire DevTools console, impostare `log.setLevel('debug')`
2. **Test US1** (15 min): Eseguire 5 scenari chiusura manuale (inclusi edge cases)
3. **Test US2** (10 min): Verificare visibilità pulsante in tutti gli stati
4. **Test US3** (5 min): Verificare log per ogni metodo di accesso
5. **Test Casi Limite** (5 min): Click multipli, durante chiusura, disabilitazione input
6. **Test Performance** (5 min): Cronometrare SC-001 e SC-003
7. **Test Compatibilità** (5 min per browser): Ripetere test critici su 4 browser
8. **Report** (5 min): Documentare difetti trovati con priorità

### Criteri di Rilascio

**Criteri MUST (bloccanti)**:
- ✅ Tutti gli scenari US1 (P1) superati senza difetti critici
- ✅ Pulsante visibile solo quando porta aperta (US2)
- ✅ Timer 15s cancellato correttamente dopo click manuale
- ✅ Porta si chiude entro 2s dal click (SC-003)
- ✅ Nessun errore JavaScript console in condizioni normali e limite
- ✅ Compatibilità Chrome e Firefox (minimo 2 browser)
- ✅ Nessun breaking change a feature 001 (pagamento monete/carta/QR/autorizzazioni funzionano)

**Criteri SHOULD (non bloccanti ma desiderabili)**:
- ✅ Tutti gli scenari US2 e US3 superati
- ✅ Tooltip/hover funzionante
- ✅ Compatibilità Safari e Edge
- ✅ Log completi e leggibili per tutti gli eventi

**Difetti Non Bloccanti**:
- Typo nel testo pulsante o tooltip (correggibili post-release)
- Log troppo verbosi (configurabili runtime)
- Spaziatura pulsante non ottimale
