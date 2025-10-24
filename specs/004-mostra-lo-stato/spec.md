# Feature Specification: Visualizzazione Stato Cassetta e Controlli Manutenzione

**Feature Branch**: `004-mostra-lo-stato`
**Created**: 2025-10-24
**Status**: Draft
**Input**: User description: "mostra lo stato aperto/chiuso della cassetta, e abilita i tasti apri/chiudi di conseguenza. Non abilitarli in altri casi, ricordati che queste operazioni sono degli eventi esterni alla logica dell'applicazione. Scrivi i test e2e"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualizzazione Stato Cassetta (Priority: P1)

Come operatore di manutenzione, voglio vedere lo stato corrente della cassetta (aperta o chiusa) in modo chiaro, così da sapere sempre qual è la condizione fisica del dispositivo senza doverlo ispezionare manualmente.

**Why this priority**: Questa è la funzionalità base essenziale - senza visibilità dello stato, l'operatore non può prendere decisioni informate. Fornisce il valore minimo indispensabile.

**Independent Test**: Può essere testata completamente simulando cambiamenti di stato della cassetta (via eventi del sensore) e verificando che il display mostri correttamente "APERTA" o "CHIUSA" in ogni condizione.

**Acceptance Scenarios**:

1. **Given** la cassetta è fisicamente chiusa, **When** l'operatore visualizza il pannello manutenzione, **Then** il sistema mostra chiaramente "Cassetta: CHIUSA"
2. **Given** la cassetta è fisicamente aperta, **When** l'operatore visualizza il pannello manutenzione, **Then** il sistema mostra chiaramente "Cassetta: APERTA"
3. **Given** il sistema sta visualizzando lo stato, **When** lo stato della cassetta cambia da chiusa ad aperta, **Then** la visualizzazione si aggiorna automaticamente senza ricarica pagina
4. **Given** il sistema sta visualizzando lo stato, **When** lo stato della cassetta cambia da aperta a chiusa, **Then** la visualizzazione si aggiorna automaticamente senza ricarica pagina

---

### User Story 2 - Simulazione Evento Apertura Cassetta (Priority: P2)

Come sviluppatore/tester del sistema, voglio poter simulare l'evento di apertura fisica della cassetta tramite un pulsante sempre disponibile, così da verificare che il sistema rilevi correttamente l'evento e aggiorni lo stato visualizzato.

**Why this priority**: Permette di testare la reattività del sistema agli eventi esterni. È essenziale per testing e simulazione, ma dipende da US1 per mostrare il risultato.

**Independent Test**: Può essere testata verificando che il pulsante "Apri Cassetta" sia sempre abilitato e disponibile, e che cliccarlo simuli l'evento di apertura fisica aggiornando lo stato a "APERTA" indipendentemente dallo stato precedente.

**Acceptance Scenarios**:

1. **Given** il pannello manutenzione è visibile, **When** l'operatore visualizza i controlli, **Then** il pulsante "Apri Cassetta" è sempre visibile e abilitato
2. **Given** la cassetta è attualmente nello stato CHIUSA, **When** l'operatore clicca "Apri Cassetta", **Then** il sistema riceve notifica evento apertura e aggiorna lo stato visualizzato a "APERTA"
3. **Given** la cassetta è già nello stato APERTA, **When** l'operatore clicca "Apri Cassetta", **Then** il pulsante rimane cliccabile (l'evento può essere notificato nuovamente)
4. **Given** l'operatore ha cliccato "Apri Cassetta", **When** il sistema elabora l'evento, **Then** lo stato visualizzato passa a "APERTA" entro 500ms

---

### User Story 3 - Simulazione Evento Chiusura Cassetta (Priority: P3)

Come sviluppatore/tester del sistema, voglio poter simulare l'evento di chiusura fisica della cassetta tramite un pulsante sempre disponibile, così da verificare che il sistema rilevi correttamente l'evento e aggiorni lo stato visualizzato.

**Why this priority**: Completa il set di simulazione eventi esterni. Meno critico perché il testing può concentrarsi principalmente sul ciclo apertura, ma necessario per coverage completa.

**Independent Test**: Può essere testata verificando che il pulsante "Chiudi Cassetta" sia sempre abilitato e disponibile, e che cliccarlo simuli l'evento di chiusura fisica aggiornando lo stato a "CHIUSA" indipendentemente dallo stato precedente.

**Acceptance Scenarios**:

1. **Given** il pannello manutenzione è visibile, **When** l'operatore visualizza i controlli, **Then** il pulsante "Chiudi Cassetta" è sempre visibile e abilitato
2. **Given** la cassetta è attualmente nello stato APERTA, **When** l'operatore clicca "Chiudi Cassetta", **Then** il sistema riceve notifica evento chiusura e aggiorna lo stato visualizzato a "CHIUSA"
3. **Given** la cassetta è già nello stato CHIUSA, **When** l'operatore clicca "Chiudi Cassetta", **Then** il pulsante rimane cliccabile (l'evento può essere notificato nuovamente)
4. **Given** l'operatore ha cliccato "Chiudi Cassetta", **When** il sistema elabora l'evento, **Then** lo stato visualizzato passa a "CHIUSA" entro 500ms

---

### User Story 4 - Test End-to-End Automatizzati (Priority: P1)

Come sviluppatore, voglio una suite di test E2E che verifichi automaticamente tutte le interazioni con la cassetta, così da garantire che la funzionalità rimanga corretta anche dopo modifiche future.

**Why this priority**: Essenziale per la qualità del codice e non-regressione. Richiesto esplicitamente dall'utente. Uguale priorità a US1 perché fornisce la garanzia di qualità.

**Independent Test**: Può essere testata eseguendo la suite di test E2E e verificando che copra tutti gli scenari di accettazione delle US1, US2 e US3.

**Acceptance Scenarios**:

1. **Given** la suite di test E2E è configurata, **When** viene eseguita, **Then** tutti i test per US1 (visualizzazione stato) passano con successo
2. **Given** la suite di test E2E è configurata, **When** viene eseguita, **Then** tutti i test per US2 (apertura cassetta) passano con successo
3. **Given** la suite di test E2E è configurata, **When** viene eseguita, **Then** tutti i test per US3 (chiusura cassetta) passano con successo
4. **Given** uno sviluppatore modifica il codice correlato, **When** esegue i test E2E, **Then** eventuali regressioni vengono rilevate immediatamente

---

### Edge Cases

- Cosa succede se arrivano eventi multipli ravvicinati (click rapido su "Apri Cassetta")?
- Come gestisce il sistema un evento di apertura quando lo stato è già APERTA?
- Come gestisce il sistema un evento di chiusura quando lo stato è già CHIUSA?
- Come viene gestito lo stato iniziale al caricamento della pagina (default CHIUSA o rilevamento necessario)?
- Cosa succede se si clicca alternativamente "Apri" e "Chiudi" molto rapidamente?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema MUST visualizzare lo stato corrente della cassetta (APERTA o CHIUSA) in modo chiaro e inequivocabile nel pannello manutenzione
- **FR-002**: Sistema MUST aggiornare automaticamente la visualizzazione dello stato quando riceve notifica di un evento di cambio stato
- **FR-003**: Sistema MUST fornire un pulsante "Apri Cassetta" che sia sempre visibile e sempre abilitato per simulare eventi di apertura fisica
- **FR-004**: Sistema MUST fornire un pulsante "Chiudi Cassetta" che sia sempre visibile e sempre abilitato per simulare eventi di chiusura fisica
- **FR-005**: Sistema MUST gestire evento "Apri Cassetta" come notifica di apertura fisica esterna, aggiornando lo stato interno a APERTA
- **FR-006**: Sistema MUST gestire evento "Chiudi Cassetta" come notifica di chiusura fisica esterna, aggiornando lo stato interno a CHIUSA
- **FR-007**: Sistema MUST aggiornare lo stato visualizzato entro 500ms dalla ricezione di un evento apertura/chiusura
- **FR-008**: Sistema MUST permettere eventi di apertura anche quando stato corrente è già APERTA (eventi idempotenti)
- **FR-009**: Sistema MUST permettere eventi di chiusura anche quando stato corrente è già CHIUSA (eventi idempotenti)
- **FR-010**: Sistema MUST registrare nel log ogni evento di cambio stato della cassetta con timestamp, stato precedente e nuovo stato
- **FR-011**: Eventi di apertura/chiusura cassetta MUST essere indipendenti dalla logica FSM principale del chiosco (non influenzati da stati IDLE/PAGAMENTO/etc.)
- **FR-012**: Sistema MUST avere test E2E automatizzati che coprano tutti gli scenari di accettazione per visualizzazione stato e gestione eventi
- **FR-013**: Test E2E MUST essere eseguibili via comando npm dedicato (es. `npm run test:feature-004`)
- **FR-014**: Test E2E MUST verificare che pulsanti "Apri Cassetta" e "Chiudi Cassetta" siano sempre abilitati
- **FR-015**: Test E2E MUST verificare aggiornamento automatico UI quando arrivano eventi apertura/chiusura
- **FR-016**: Test E2E MUST verificare gestione corretta di eventi multipli ravvicinati e idempotenza

### Key Entities

- **Cassetta**: Contenitore fisico per conservare contanti raccolti. Ha uno stato binario (APERTA/CHIUSA) che cambia per azioni fisiche esterne al sistema.
- **Evento Cassetta**: Notifica di un cambiamento di stato fisico della cassetta (apertura o chiusura) che arriva al sistema dall'esterno.
- **Stato Cassetta**: Rappresentazione interna dello stato corrente (APERTA/CHIUSA) mantenuta dal sistema e sincronizzata con eventi esterni.
- **Pannello Manutenzione**: Area UI dedicata per visualizzare stato cassetta e simulare eventi apertura/chiusura per testing.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Operatore può determinare visivamente lo stato della cassetta (aperta o chiusa) in meno di 2 secondi guardando il pannello
- **SC-002**: Aggiornamento stato visualizzato avviene entro 500ms dalla notifica dell'evento esterno
- **SC-003**: Pulsanti "Apri Cassetta" e "Chiudi Cassetta" sono sempre abilitati e cliccabili nel 100% dei casi
- **SC-004**: Sistema gestisce correttamente eventi idempotenti (apertura quando già aperta, chiusura quando già chiusa) senza errori
- **SC-005**: Sistema gestisce correttamente sequenze rapide di eventi (min 5 click/secondo) senza perdita di sincronia
- **SC-006**: Test E2E coprono 100% degli scenari di accettazione definiti e passano con successo
- **SC-007**: Zero regressioni su funzionalità esistenti (feature 001, 002, 003) verificate da test E2E
- **SC-008**: Ogni evento di apertura/chiusura è tracciato nel log con livello INFO minimo
