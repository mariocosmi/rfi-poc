<!--
Rapporto di Impatto Sincronizzazione:
- Versione: 1.0.0 → 1.1.0 (Aggiunta principio Osservabilità)
- Ultima modifica: 2025-10-15
- Principi aggiunti: V. Osservabilità (logging obbligatorio con libreria dedicata)
- Principi modificati: Nessuno
- Sezioni rimosse: Nessuna
- Template che richiedono aggiornamenti: Nessuno (principio non impatta template)
- Follow-up: Principio V dichiara esplicitamente violazione di Principio III (libreria logging permessa)
-->

# Costituzione RFI POC

## Principi Fondamentali

### I. Lingua Utilizzata

**Regola**: Tutta la documentazione, il codice (commenti, nomi di variabili leggibili, messaggi utente), e le risposte all'utente DEVONO essere redatti in lingua italiana.

**Motivazione**: Garantisce coerenza comunicativa, facilita la comprensione per il team italiano, riduce ambiguità interpretative e mantiene uniformità in tutto il progetto. Il codice diventa più accessibile e manutenibile per tutti gli stakeholder del progetto.

### II. Architettura Static-First

**Regola**: Tutti i contenuti e la struttura devono essere forniti come file HTML/CSS/JS statici che possono essere serviti da qualsiasi web server o CDN senza elaborazione server-side.

**Motivazione**: L'architettura statica garantisce massima portabilità, zero dipendenze dal server, tempi di caricamento rapidi e deployment semplice. Il comportamento dinamico è ottenuto solo lato client.

### III. Preferenza per JavaScript Vanilla

**Regola**: Utilizzare JavaScript vanilla di default. Framework/librerie (React, Vue, jQuery, ecc.) richiedono giustificazione esplicita documentata nella sezione Complexity Tracking di plan.md.

**Motivazione**: Riduce la dimensione del bundle, elimina la complessità di build, migliora le prestazioni di caricamento e diminuisce il carico di manutenzione delle dipendenze. La maggior parte delle funzionalità interattive può essere ottenuta con JavaScript vanilla moderno e Web API native.

### IV. Build-Free di Default

**Regola**: Nessuno step di build richiesto per lo sviluppo o il deployment. Se vengono introdotti strumenti di build (bundler, transpiler), documentare perché l'approccio vanilla era insufficiente.

**Motivazione**: Semplifica il workflow di sviluppo, riduce l'overhead degli strumenti, abilita la modifica diretta dei file e mantiene cicli di iterazione rapidi. I browser moderni supportano ES6+ nativamente.

### V. Osservabilità

**Regola**: Tutto ciò che fanno gli script deve essere chiaramente loggato sulla console del browser. Utilizza una libreria di logging (anche se questo viola il principio III) che permetta di configurare il livello di gravità dei messaggi ed eventualmente altre destinazioni di output dei messaggi.

**Motivazione**: Semplifica il workflow di sviluppo in quanto aiuta il debugging.

## Workflow di Sviluppo

### Organizzazione dei File

```
/
├── index.html           # Punto di ingresso
├── css/
│   └── styles.css      # Stili (possono essere più file)
├── js/
│   └── app.js          # Script (possono usare moduli ES6)
├── assets/
│   ├── images/
│   └── fonts/
└── specs/              # Specifiche delle funzionalità (gestite da SpecKit)
```

### Testing

- Il testing manuale nel browser è accettabile per interazioni semplici
- Il testing automatizzato (se aggiunto) deve essere giustificato nel complexity tracking
- Compatibilità cross-browser: Ultime 2 versioni di Chrome, Firefox, Safari, Edge

### Controllo di Versione

- Effettuare commit di incrementi funzionanti frequentemente
- Nessun commit hook o workflow complesso a meno che non sia giustificato
- Commit diretti su master accettabili per sviluppo in solitaria; usare feature branch per collaborazione

## Governance

### Processo di Modifica

1. Le modifiche proposte devono essere documentate in una spec o plan
2. Giustificazione del perché i principi attuali sono insufficienti
3. Costituzione aggiornata con commit e incremento di versione

### Giustificazione della Complessità

Qualsiasi violazione dei principi fondamentali (aggiunta di framework, strumenti di build, logica server-side) DEVE essere documentata nella sezione Complexity Tracking del relativo `plan.md` con:
- Quale principio viene violato
- Perché è necessario
- Quale alternativa più semplice è stata rifiutata e perché

### Conformità

- Auto-revisione rispetto ai principi prima di committare funzionalità
- I comandi SpecKit (`/speckit.plan`, `/speckit.analyze`) verificheranno l'allineamento con la costituzione
- Mantenere la costituzione come singola fonte di verità per le decisioni architetturali

**Versione**: 1.1.0 | **Ratificata**: 2025-10-15 | **Ultima Modifica**: 2025-10-15
