# Specifica Funzionalità: Chiusura Porta su Passaggio Persona

**Feature Branch**: `002-la-porta-deve`
**Creata**: 2025-10-16
**Stato**: Bozza
**Input**: Descrizione utente: "la porta deve richiudersi non solo dopo il timeout ma anche al passaggio di una persona (lo puoi simulare con un pulsante)"

## User Scenarios & Testing *(obbligatorio)*

### User Story 1 - Chiusura Porta Manuale dopo Passaggio (Priorità: P1)

Un utente ha appena completato un pagamento valido o ha mostrato un QR/carta autorizzata. La porta si apre e l'utente attraversa il varco. Dopo il passaggio, l'utente preme un pulsante (o un sensore rileva il passaggio) e la porta si chiude immediatamente, permettendo al prossimo utente di utilizzare il chiosco senza attendere i 15 secondi di timeout.

**Perché questa priorità**: Migliora l'efficienza del chiosco riducendo i tempi di attesa tra un utente e l'altro. Evita che la porta rimanga aperta inutilmente dopo il passaggio, aumentando la sicurezza e il throughput del sistema.

**Test Indipendente**: Può essere testato completamente aprendo la porta (con qualsiasi metodo di pagamento/autorizzazione), cliccando il pulsante "Persona passata" e verificando che la porta si chiuda immediatamente invece di attendere i 15 secondi.

**Scenari di Accettazione**:

1. **Dato** che la porta è aperta dopo un pagamento valido, **Quando** l'utente clicca il pulsante "Persona passata", **Allora** la porta si chiude immediatamente e il sistema torna allo stato IDLE
2. **Dato** che la porta è aperta da 5 secondi, **Quando** l'utente clicca il pulsante "Persona passata", **Allora** il timer di chiusura automatica (15s) viene cancellato e la porta si chiude subito
3. **Dato** che la porta è aperta, **Quando** l'utente clicca il pulsante "Persona passata", **Allora** il display mostra un messaggio di conferma (es. "Passaggio rilevato - Porta in chiusura") per 1-2 secondi
4. **Dato** che la porta si sta chiudendo dopo click su "Persona passata", **Quando** la chiusura è completata, **Allora** il sistema resetta completamente e torna alla schermata iniziale "Benvenuto"

---

### User Story 2 - Indicatore Visivo Pulsante Passaggio (Priorità: P2)

Durante l'apertura della porta, l'utente vede chiaramente un pulsante "Persona passata" o "Ho attraversato" che è visibile solo quando la porta è aperta. Il pulsante è disabilitato o nascosto in tutti gli altri stati del sistema per evitare azioni errate.

**Perché questa priorità**: Migliora l'usabilità guidando l'utente a utilizzare correttamente la funzionalità. Riduce errori e confusione evitando che il pulsante sia visibile quando non dovrebbe essere utilizzato.

**Test Indipendente**: Può essere testato verificando la visibilità del pulsante in diversi stati del sistema (IDLE, PAGAMENTO_MONETE, PORTA_APERTA) e confermando che sia cliccabile solo quando la porta è aperta.

**Scenari di Accettazione**:

1. **Dato** che il sistema è in stato IDLE, **Quando** l'utente visualizza l'interfaccia, **Allora** il pulsante "Persona passata" è nascosto o disabilitato
2. **Dato** che il sistema è in stato PAGAMENTO_MONETE o PAGAMENTO_CARTA, **Quando** l'utente visualizza l'interfaccia, **Allora** il pulsante "Persona passata" è nascosto o disabilitato
3. **Dato** che la porta si apre, **Quando** entra nello stato PORTA_APERTA, **Allora** il pulsante "Persona passata" diventa visibile e abilitato entro 500ms
4. **Dato** che il pulsante "Persona passata" è visibile, **Quando** l'utente ci passa sopra con il mouse, **Allora** appare un tooltip o un effetto hover che spiega la funzione (es. "Clicca dopo aver attraversato")

---

### User Story 3 - Logging Passaggio Persona (Priorità: P3)

Quando un utente clicca il pulsante "Persona passata", il sistema registra l'evento sul log della console con informazioni utili (timestamp, tempo trascorso dall'apertura porta, metodo di accesso utilizzato).

**Perché questa priorità**: Utile per debugging e analisi del comportamento del sistema. Non essenziale per la funzionalità base ma aggiunge valore per monitoraggio e troubleshooting.

**Test Indipendente**: Può essere testato aprendo DevTools console, facendo passare una persona simulata e verificando che venga registrato un log appropriato con le informazioni corrette.

**Scenari di Accettazione**:

1. **Dato** che la porta è aperta da 3 secondi dopo pagamento con monete, **Quando** l'utente clicca "Persona passata", **Allora** la console mostra un log `[INFO] Passaggio persona rilevato - Porta aperta da 3s - Metodo: monete`
2. **Dato** che la porta è aperta dopo accesso con QR code, **Quando** l'utente clicca "Persona passata", **Allora** il log include il metodo di accesso corretto (es. "Metodo: qr")
3. **Dato** che vengono registrati più passaggi in una sessione, **Quando** si analizzano i log, **Allora** è possibile distinguere ogni evento con timestamp univoco

---

### Casi Limite

- Cosa succede se l'utente clicca "Persona passata" mentre la porta è già in fase di chiusura (ultimi 500ms dell'animazione)? (Il sistema ignora il click ridondante e completa normalmente la chiusura)
- Cosa succede se l'utente clicca "Persona passata" immediatamente all'apertura (entro 200ms)? (Il sistema accetta il click e chiude comunque - scenario valido per persone molto veloci)
- Cosa succede se l'utente clicca "Persona passata" quando il timer è quasi scaduto (es. a 14.8s sui 15s)? (Il sistema chiude comunque immediatamente, il timer viene cancellato)
- Come si comporta il sistema se l'animazione di chiusura porta richiede tempo (es. 1.5s) durante la quale arriva un nuovo utente? (Gli input rimangono disabilitati fino al completamento della chiusura e ritorno a IDLE)

## Requisiti *(obbligatorio)*

### Requisiti Funzionali

- **FR-001**: Il sistema DEVE fornire un pulsante visibile "Persona passata" quando la porta è nello stato APERTA
- **FR-002**: Il sistema DEVE nascondere o disabilitare il pulsante "Persona passata" in tutti gli stati diversi da PORTA_APERTA
- **FR-003**: Il sistema DEVE chiudere immediatamente la porta quando l'utente clicca il pulsante "Persona passata" mentre la porta è aperta
- **FR-004**: Il sistema DEVE cancellare il timer di chiusura automatica (15 secondi) quando viene cliccato il pulsante "Persona passata"
- **FR-005**: Il sistema DEVE mostrare un messaggio di feedback sul display dopo il click su "Persona passata" (es. "Passaggio rilevato - Porta in chiusura")
- **FR-006**: Il sistema DEVE completare l'animazione di chiusura porta prima di accettare nuovi input da altri utenti
- **FR-007**: Il sistema DEVE tornare allo stato IDLE dopo la chiusura porta attivata dal pulsante "Persona passata"
- **FR-008**: Il sistema DEVE registrare sul log console ogni evento di passaggio persona con timestamp e metodo di accesso
- **FR-009**: Il pulsante "Persona passata" DEVE avere un effetto hover o tooltip esplicativo quando la porta è aperta
- **FR-010**: Il sistema DEVE gestire click multipli sul pulsante "Persona passata" ignorando click ridondanti durante la chiusura

### Entità Chiave

- **Porta**: Aggiunge un nuovo trigger di chiusura oltre al timeout (chiusura manuale su passaggio persona)
- **Pulsante Passaggio**: Nuovo componente UI visibile solo nello stato PORTA_APERTA, trigger per chiusura immediata
- **Display**: Mostra messaggi di feedback relativi al passaggio persona
- **Chiosco FSM**: Gestisce la nuova transizione PORTA_APERTA → IDLE su evento "passaggio persona"

## Criteri di Successo *(obbligatorio)*

### Risultati Misurabili

- **SC-001**: Il tempo medio tra un utente e il successivo si riduce del 40% rispetto al sistema con solo chiusura automatica (da ~15s a ~9s assumendo 3-4s medi di attraversamento)
- **SC-002**: Il 90% degli utenti utilizza il pulsante "Persona passata" dopo aver attraversato il varco (in contesti di test con utenti informati)
- **SC-003**: La porta si chiude entro 2 secondi dal click sul pulsante "Persona passata" (includendo animazione di chiusura)
- **SC-004**: Il pulsante "Persona passata" è visivamente riconoscibile e il 95% degli utenti test lo identifica correttamente senza assistenza
- **SC-005**: Non si verificano errori o stati inconsistenti quando il pulsante viene cliccato in condizioni limite (apertura/chiusura rapida, click multipli)
- **SC-006**: Tutti gli eventi di passaggio persona sono tracciati correttamente nei log con informazioni complete (timestamp, durata apertura, metodo accesso)

## Assunzioni

- Il pulsante "Persona passata" è una simulazione del sensore di passaggio reale che verrebbe installato in un chiosco fisico
- Gli utenti sono consapevoli della possibilità di chiudere manualmente la porta (in un sistema reale, potrebbe essere completamente automatico)
- La chiusura manuale è un'ottimizzazione facoltativa - il sistema continua a funzionare correttamente anche se l'utente non utilizza il pulsante (fallback su timer 15s)
- Il tempo medio di attraversamento di una persona è stimato in 3-4 secondi
- La posizione del pulsante nell'interfaccia è vicina all'area della porta per associazione visiva
- Il pulsante è sufficientemente grande e visibile per essere cliccato facilmente da utenti in movimento
- Non è necessario confermare l'azione (no dialog "Sei sicuro?") per mantenere la fluidità dell'esperienza
