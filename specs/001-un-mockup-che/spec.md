# Specifica Funzionalità: Simulatore Chiosco Ingresso

**Feature Branch**: `001-un-mockup-che`
**Creata**: 2025-10-15
**Stato**: Bozza
**Input**: Descrizione utente: "un mockup che deve simulare un chiosco composto da display, lettore di qr, lettore di carte, una gettoniera ed una porta. lo scopo è versare 1.2 euro con carta di credito o in monete per aprire la porta. Altre modalità di ingresso possono essere mostrare un QR il cui codice è in una lista in memoria, oppure una carta contactless contenente un codice appartenente alla stessa lista"

## User Scenarios & Testing *(obbligatorio)*

### User Story 1 - Pagamento con Monete (Priorità: P1)

Un utente si avvicina al chiosco e desidera accedere pagando con monete. Il display mostra inizialmente "1,20 €" (importo richiesto). L'utente inserisce monete nella gettoniera e il display aggiorna in tempo reale l'importo rimanente da versare, decrementandolo. Quando l'importo rimanente raggiunge 0,00 euro o meno (sovrapagamento), la porta si apre automaticamente.

**Perché questa priorità**: Rappresenta il caso d'uso più semplice e diretto, con meno dipendenze hardware simulate. Fornisce un MVP funzionante che dimostra il flusso base di pagamento e apertura porta.

**Test Indipendente**: Può essere testato completamente simulando l'inserimento di monete tramite interfaccia e verificando che il display mostri l'importo rimanente corretto e la porta si apra quando l'importo rimanente raggiunge 0,00 euro.

**Scenari di Accettazione**:

1. **Dato** che il chiosco è in stato iniziale con display "Rimanente: 1,20 €", **Quando** l'utente inserisce 0,50 euro, **Allora** il display mostra "Rimanente: 0,70 €" e la porta rimane chiusa
2. **Dato** che il display mostra "Rimanente: 0,70 €", **Quando** l'utente inserisce 0,50 euro, **Allora** il display mostra "Rimanente: 0,20 €" e la porta rimane chiusa
3. **Dato** che il display mostra "Rimanente: 0,20 €", **Quando** l'utente inserisce 0,20 euro, **Allora** il display mostra "Rimanente: 0,00 €" e la porta si apre
4. **Dato** che il display mostra "Rimanente: 0,20 €", **Quando** l'utente inserisce 0,50 euro, **Allora** il display mostra "Rimanente: 0,00 €" (o "Pagato!") e la porta si apre (accetta sovrapagamento)

---

### User Story 2 - Pagamento con Carta di Credito (Priorità: P2)

Un utente si avvicina al chiosco e sceglie di pagare con carta di credito. Avvicina la propria carta al lettore contactless. Il sistema processa il pagamento di 1,20 euro e, in caso di successo, la porta si apre. Il display mostra lo stato della transazione (elaborazione, successo, errore).

**Perché questa priorità**: Metodo di pagamento moderno e conveniente, ma più complesso da simulare rispetto alle monete. È il secondo caso d'uso più comune dopo le monete.

**Test Indipendente**: Può essere testato simulando l'avvicinamento di una carta (click su interfaccia) e verificando che il sistema mostri gli stati della transazione e apra la porta in caso di successo.

**Scenari di Accettazione**:

1. **Dato** che il chiosco è in stato iniziale, **Quando** l'utente avvicina una carta di credito valida al lettore, **Allora** il display mostra "Elaborazione..." seguito da "Pagamento accettato" e la porta si apre
2. **Dato** che il chiosco è in stato iniziale, **Quando** l'utente avvicina una carta di credito non valida al lettore, **Allora** il display mostra "Elaborazione..." seguito da "Pagamento rifiutato" e la porta rimane chiusa
3. **Dato** che il chiosco è in stato iniziale, **Quando** l'utente allontana la carta prima del completamento della transazione, **Allora** il display mostra "Transazione annullata" e la porta rimane chiusa

---

### User Story 3 - Accesso con QR Code Autorizzato (Priorità: P3)

Un utente autorizzato si avvicina al chiosco e mostra il proprio QR code personale al lettore. Il sistema verifica se il codice è presente nella lista dei codici autorizzati in memoria. Se il codice è valido, la porta si apre immediatamente senza richiedere pagamento. Il display mostra lo stato della verifica.

**Perché questa priorità**: Funzionalità per utenti privilegiati o con abbonamento. Non essenziale per l'MVP ma aggiunge valore per gestire accessi autorizzati.

**Test Indipendente**: Può essere testato simulando la scansione di QR code (input di testo o upload immagine) e verificando che i codici nella lista autorizzati aprano la porta, mentre quelli non autorizzati vengano rifiutati.

**Scenari di Accettazione**:

1. **Dato** che il chiosco ha una lista di QR code autorizzati in memoria, **Quando** l'utente mostra un QR code presente nella lista, **Allora** il display mostra "Accesso autorizzato" e la porta si apre
2. **Dato** che il chiosco ha una lista di QR code autorizzati in memoria, **Quando** l'utente mostra un QR code NON presente nella lista, **Allora** il display mostra "Accesso negato" e la porta rimane chiusa
3. **Dato** che il chiosco è in stato iniziale, **Quando** l'utente mostra un QR code non leggibile o danneggiato, **Allora** il display mostra "Errore lettura QR" e la porta rimane chiusa

---

### User Story 4 - Accesso con Carta Contactless Autorizzata (Priorità: P3)

Un utente autorizzato si avvicina al chiosco e avvicina la propria carta contactless autorizzata al lettore. Il sistema legge il codice dalla carta e verifica se è presente nella lista dei codici autorizzati in memoria. Se il codice è valido, la porta si apre immediatamente senza richiedere pagamento. Il display mostra lo stato della verifica.

**Perché questa priorità**: Alternativa alla user story 3 per utenti che preferiscono usare carte fisiche invece di QR code. Stessa priorità della user story 3 in quanto entrambe gestiscono accessi autorizzati.

**Test Indipendente**: Può essere testato simulando l'avvicinamento di una carta (click su interfaccia) e verificando che le carte con codici autorizzati aprano la porta, mentre quelle non autorizzate vengano rifiutate.

**Scenari di Accettazione**:

1. **Dato** che il chiosco ha una lista di codici autorizzati in memoria, **Quando** l'utente avvicina una carta contactless con codice presente nella lista, **Allora** il display mostra "Accesso autorizzato" e la porta si apre
2. **Dato** che il chiosco ha una lista di codici autorizzati in memoria, **Quando** l'utente avvicina una carta contactless con codice NON presente nella lista, **Allora** il display mostra "Accesso negato - Effettua pagamento" e la porta rimane chiusa
3. **Dato** che il chiosco è in stato iniziale, **Quando** l'utente avvicina una carta contactless non leggibile, **Allora** il display mostra "Errore lettura carta" e la porta rimane chiusa

---

### Casi Limite

- Cosa succede quando l'utente inserisce monete oltre l'importo richiesto? (Il sistema accetta il sovrapagamento e apre la porta, non eroga resto)
- Come gestisce il sistema l'inserimento di monete non valide? (Le rigetta o le ignora nel conteggio)
- Cosa succede se l'utente inizia a pagare con monete ma poi avvicina una carta di credito? (Azzera il conteggio monete e processa la carta)
- Quanto tempo rimane aperta la porta dopo un pagamento o accesso autorizzato valido? (La porta rimane aperta per 15 secondi, poi si chiude automaticamente)
- Cosa succede dopo che la porta si chiude? (Il sistema ritorna automaticamente allo stato iniziale)
- Come gestisce il sistema tentativi di accesso simultanei? (Durante la lettura delle carte contactless, dei QR code e durante le transazioni con carta di credito, tutti gli altri input sono disabilitati per prevenire tentativi simultanei)

## Requisiti *(obbligatorio)*

### Requisiti Funzionali

- **FR-001**: Il sistema DEVE visualizzare un display che mostra messaggi e stato del sistema all'utente
- **FR-002**: Il sistema DEVE simulare una gettoniera che accetta inserimento di monete e calcola il totale
- **FR-003**: Il sistema DEVE simulare un lettore di carte contactless per pagamenti con carta di credito
- **FR-004**: Il sistema DEVE simulare un lettore di QR code per scansionare codici a barre bidimensionali
- **FR-005**: Il sistema DEVE simulare una porta che si apre/chiude in risposta ai comandi del sistema
- **FR-006**: Il sistema DEVE aprire la porta quando l'utente versa esattamente 1,20 euro o più tramite monete
- **FR-007**: Il sistema DEVE aprire la porta quando l'utente effettua un pagamento di 1,20 euro con carta di credito VISA valida (unico circuito accettato)
- **FR-008**: Il sistema DEVE validare codici QR e carte contactless secondo regole hardcoded: accettare numeri da 1 a 99 (es. "1", "42", "99")
- **FR-009**: Il sistema DEVE aprire la porta quando l'utente mostra un QR code il cui codice è presente nella lista autorizzati
- **FR-010**: Il sistema DEVE aprire la porta quando l'utente avvicina una carta contactless il cui codice è presente nella lista autorizzati
- **FR-011**: Il sistema DEVE mostrare sul display l'importo rimanente da versare durante il pagamento con monete, decrementandolo ad ogni inserimento (partendo da 1,20 euro fino a 0,00 euro)
- **FR-012**: Il sistema DEVE mostrare sul display lo stato della transazione durante pagamento con carta (elaborazione, successo, errore)
- **FR-013**: Il sistema DEVE mostrare sul display il risultato della verifica QR/carta (autorizzato, negato, errore lettura)
- **FR-014**: Il sistema DEVE fornire pulsanti separati nell'interfaccia per permettere all'utente di scegliere tra "Paga con Carta" e "Verifica Carta Autorizzata" prima di avvicinare la carta al lettore
- **FR-015**: Il sistema DEVE reimpostare lo stato iniziale dopo ogni operazione completata (porta aperta e chiusa)
- **FR-016**: Il sistema DEVE azzerare automaticamente lo stato e tornare alla schermata iniziale dopo 20 secondi di inattività durante operazioni incomplete (es. pagamento con monete parziale)
- **FR-017**: Il sistema DEVE mostrare sul display un conto alla rovescia (in secondi) durante il timeout di inattività, informando l'utente del tempo rimanente prima del reset automatico
- **FR-018**: Il sistema DEVE disabilitare tutti gli altri metodi di input durante operazioni in corso (lettura carte contactless, scansione QR code, transazione carta di credito) per prevenire accessi simultanei o conflitti

### Entità Chiave

- **Chiosco**: Rappresenta l'intero sistema, coordina tutti i componenti (display, lettori, gettoniera, porta)
- **Display**: Mostra messaggi all'utente, stato sistema, importi, risultati operazioni
- **Gettoniera**: Accetta monete, calcola totale inserito, attributi: importo corrente accumulato
- **Lettore Carta**: Legge carte contactless, gestisce pagamenti VISA e verifica codici autorizzati (numeri 1-99)
- **Lettore QR**: Scansiona QR code e verifica codici autorizzati (numeri 1-99)
- **Porta**: Può essere aperta o chiusa, attributi: stato (aperta/chiusa)
- **Validatore Codici**: Logica hardcoded per validare numeri da 1 a 99 come codici autorizzati

## Criteri di Successo *(obbligatorio)*

### Risultati Misurabili

- **SC-001**: Gli utenti possono completare un pagamento con monete e aprire la porta in meno di 30 secondi
- **SC-002**: Gli utenti possono completare un pagamento con carta e aprire la porta in meno di 10 secondi
- **SC-003**: Gli utenti autorizzati possono accedere tramite QR o carta contactless in meno di 5 secondi
- **SC-004**: Il display fornisce feedback visivo chiaro entro 1 secondo da ogni azione dell'utente
- **SC-005**: Il sistema gestisce correttamente il 100% dei casi limite identificati senza crash o stati inconsistenti
- **SC-006**: Il 95% degli utenti test completa con successo l'operazione desiderata al primo tentativo senza assistenza
- **SC-007**: Il simulatore è utilizzabile su dispositivi con schermi di almeno 1024x768 pixel
- **SC-008**: Tutti i componenti hardware simulati sono visivamente riconoscibili e intuitivi da usare

## Assunzioni

- Il mockup è una simulazione software, non richiede integrazione con hardware reale
- Le monete accettate sono tagli standard euro (1€, 0,50€, 0,20€, 0,10€, 0,05€, 0,02€, 0,01€)
- Il sistema non eroga resto, accetta sovrapagamenti
- I pagamenti con carta di credito sono simulati (successo/fallimento randomizzato o controllato)
- I codici autorizzati sono determinati da regole hardcoded: numeri da 1 a 99 (es. "1", "42", "99")
- Le carte di credito ammesse sono solo VISA (identificate da pattern simulato)
- Il sistema gestisce un solo utente alla volta (no accessi concorrenti)
- La porta rimane aperta per 15 secondi dopo apertura, poi si chiude automaticamente
- Dopo chiusura porta, il sistema ritorna automaticamente allo stato iniziale
- Il sistema è disponibile 24/7 senza necessità di manutenzione o riavvio
- Tutti i testi e messaggi sul display sono in lingua italiana
