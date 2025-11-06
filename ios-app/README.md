# ChioscoApp - Simulatore Chiosco Ingresso iOS

Applicazione iOS del simulatore di chiosco ingresso ferroviario, tradotta dalla versione web (HTML/CSS/JavaScript) in Swift + SwiftUI.

## 📱 Panoramica

L'app iOS replica completamente la funzionalità della web app originale, mantenendo la stessa architettura FSM (Finite State Machine) ma usando tecnologie native iOS.

**Funzionalità implementate:**
- ✅ Pagamento con monete (tagli da 1€ a 0,01€)
- ✅ Pagamento con carta di credito VISA
- ✅ Accesso con QR code autorizzato (codici 1-99)
- ✅ Accesso con carta contactless autorizzata (codici 1-99)
- ✅ Apertura/chiusura porta automatica (15s) e manuale
- ✅ Timeout inattività (20s) durante pagamento monete
- ✅ Feature 002: Chiusura porta su passaggio persona

## 🏗️ Architettura

### Pattern Architetturale

**MVVM (Model-View-ViewModel) + ObservableObject**
- **Model**: Logica di business (FSM, Validatore, Logger)
- **ViewModel**: `Chiosco` (ObservableObject principale)
- **View**: SwiftUI views reattive

### Struttura del Progetto

```
ios-app/ChioscoApp/
├── ChioscoApp.swift           # Entry point (@main)
├── Core/                      # Business Logic
│   ├── ChioscoStato.swift     # Enum stati FSM + transizioni permesse
│   ├── Chiosco.swift          # FSM principale (ObservableObject)
│   ├── GestoreTimeout.swift   # Timer inattività (20s)
│   ├── Logger.swift           # Logging (os.log wrapper)
│   └── Validatore.swift       # Regole validazione (codici 1-99, VISA)
├── Models/                    # Domain Models
│   ├── Display.swift          # Modello display (messaggio, importo, countdown)
│   ├── Porta.swift            # Modello porta (aperta/chiusa, timer)
│   └── Gettoniera.swift       # Modello gettoniera (monete, saldo)
└── Views/                     # SwiftUI Views
    ├── ContentView.swift      # Vista principale (layout)
    ├── DisplayView.swift      # Display messaggi
    ├── PortaView.swift        # Porta con animazione
    ├── GettonierapView.swift  # Griglia pulsanti monete
    ├── PagamentoCartaView.swift
    ├── LettoreCarteView.swift
    └── LettoreQRView.swift
```

### Finite State Machine (FSM)

**Stati** (definiti in `ChioscoStato.swift`):
- `IDLE`: Stato iniziale, attesa azione utente
- `PAGAMENTO_MONETE`: Inserimento monete in corso (con timeout 20s)
- `PAGAMENTO_CARTA`: Transazione carta di credito in corso
- `VERIFICA_QR`: Verifica codice QR autorizzato
- `VERIFICA_CARTA`: Verifica carta contactless autorizzata
- `PORTA_APERTA`: Porta aperta (chiusura automatica dopo 15s)
- `TIMEOUT`: Timeout inattività (ritorna a IDLE dopo 2s)

**Transizioni**: Gestite da `TransizioniPermesse.isPermessa(da:a:)`

**Pattern di transizione**: `chiosco.transizione(nuovoStato, dati: [...])`

## 🚀 Come Eseguire l'App

### Requisiti

- **Xcode 15+** (o versione compatibile con iOS 17+)
- **macOS Ventura 13+** (o superiore)
- **iOS 17+** (target deployment)

### Setup

1. **Apri il progetto in Xcode**:
   ```bash
   cd ios-app/ChioscoApp
   open ChioscoApp.xcodeproj  # (se hai un progetto Xcode configurato)
   ```

2. **Oppure crea un nuovo progetto Xcode**:
   - Apri Xcode
   - File → New → Project
   - Seleziona "iOS" → "App"
   - Nome: `ChioscoApp`
   - Interface: **SwiftUI**
   - Language: **Swift**
   - Copia tutti i file `.swift` nelle rispettive cartelle del progetto

3. **Esegui l'app**:
   - Seleziona un simulatore iOS (es. iPhone 15 Pro)
   - Premi `Cmd + R` per eseguire

### Debugging

L'app usa `Logger` (wrapper per `os.log`) per logging completo:

**Livelli di log**:
- `DEBUG`: Dettagli operazioni (inserimento monete, transizioni, etc.)
- `INFO`: Eventi importanti (apertura porta, pagamento completato)
- `WARNING`: Operazioni anomale (carte non VISA, codici non autorizzati)
- `ERROR`: Errori critici

**Visualizzare i log**:
- **Console Xcode**: Tutti i log appaiono nella console durante debug
- **Console.app** (macOS): Filtra per subsystem `it.rfi.chiosco`

Per cambiare livello minimo di logging:
```swift
// In ChioscoApp.swift o Chiosco.swift init()
Logger.livelloMinimo = .debug  // .debug, .info, .warning, .error
```

## 📖 Guida d'Uso

### Scenari d'Uso

#### 1️⃣ Pagamento con Monete

1. Tap su un pulsante moneta (es. "0,50€")
2. Sistema passa da `IDLE` → `PAGAMENTO_MONETE`
3. Display mostra importo rimanente (es. "Rimanente: 0,70 €")
4. Countdown timeout (20s) inizia
5. Inserisci altre monete fino a raggiungere 1,20€
6. Sistema apre porta automaticamente
7. Pulsante "Persona passata" appare → tap per chiudere immediatamente
8. Sistema ritorna a `IDLE`

#### 2️⃣ Pagamento con Carta di Credito

1. Tap su "Paga con Carta (1,20€)"
2. Sistema passa da `IDLE` → `PAGAMENTO_CARTA`
3. Inserisci numero carta (es. "4111111111111111" per VISA)
4. Tap "Conferma Pagamento"
5. Sistema verifica carta VISA:
   - ✅ **VISA valida**: Pagamento accettato → porta aperta
   - ❌ **Non VISA**: Pagamento rifiutato → ritorno a `IDLE`

#### 3️⃣ Accesso con QR Code

1. Inserisci codice QR (es. "42") in campo "Lettore QR"
2. Tap "Scansiona"
3. Sistema verifica codice:
   - ✅ **1-99**: Accesso autorizzato → porta aperta
   - ❌ **Altri**: Accesso negato → ritorno a `IDLE`

#### 4️⃣ Accesso con Carta Autorizzata

Stessa logica del QR code, usando campo "Lettore Carte Autorizzate"

## 🔧 Configurazione

### Modificare Importo Richiesto

In `Gettoniera.swift`:
```swift
init(importoRichiesto: Double = 1.20) {  // Cambia qui
    self.importoRichiesto = importoRichiesto
    ...
}
```

### Modificare Timeout Inattività

In `Chiosco.swift`:
```swift
setupGestoreTimeout() {
    gestoreTimeout = GestoreTimeout(chiosco: self, durataSecondi: 20)  // Cambia qui
}
```

### Modificare Codici Autorizzati

In `Validatore.swift`:
```swift
static func isCodiceAutorizzato(_ codice: String) -> Bool {
    guard let num = Int(codice) else { return false }
    return num >= 1 && num <= 99  // Cambia range qui
}
```

## 🆚 Differenze con la Web App

| Aspetto | Web App (JS) | iOS App (Swift) |
|---------|--------------|-----------------|
| UI Framework | HTML/CSS | SwiftUI |
| Reattività | Manipolazione DOM | `@Published` + `ObservableObject` |
| Logging | loglevel.js | os.log (Logger wrapper) |
| Timer | `setTimeout`/`setInterval` | `Timer` + `DispatchQueue` |
| Animazioni | CSS animations | SwiftUI `.animation()` |
| Persistenza | Nessuna | Nessuna (come web app) |

## 📦 Dipendenze

**Nessuna dipendenza esterna!** L'app è completamente self-contained:
- ✅ Solo framework iOS nativi (Foundation, SwiftUI, os.log)
- ✅ Nessun CocoaPods/SPM/Carthage
- ✅ Build-free (come la web app)

## 🧪 Testing

**Testing manuale** (come la web app):

1. **Test pagamento monete**:
   - Inserisci 1€ → Display mostra "0,20 €"
   - Inserisci 0,20€ → Porta apre

2. **Test timeout**:
   - Inserisci 0,50€
   - Attendi 20s senza fare nulla
   - Sistema mostra "Timeout - Operazione annullata"

3. **Test carte VISA**:
   - Carta "4111111111111111" → Accettata ✅
   - Carta "5500000000000004" → Rifiutata ❌

4. **Test QR/Carte autorizzate**:
   - Codice "42" → Autorizzato ✅
   - Codice "100" → Negato ❌

## 🐛 Troubleshooting

**Problema**: App non compila
- **Soluzione**: Verifica di aver copiato tutti i file nelle directory corrette
- Assicurati che `ChioscoApp.swift` sia settato come `@main`

**Problema**: Porta non si apre
- **Soluzione**: Controlla i log in Console Xcode
- Verifica stato FSM con breakpoint in `Chiosco.transizione()`

**Problema**: Timer non funziona
- **Soluzione**: SwiftUI usa main thread - assicurati che `Timer.scheduledTimer` sia su main queue

## 📝 Note Tecniche

### ObservableObject e @Published

Tutti i modelli usano `@Published` per notificare SwiftUI dei cambiamenti:
```swift
class Chiosco: ObservableObject {
    @Published var stato: ChioscoStato = .idle
    @Published var display: DisplayModello
    ...
}
```

### EnvironmentObject

`Chiosco` è iniettato come `@EnvironmentObject` in tutte le viste:
```swift
// In ChioscoApp.swift
ContentView()
    .environmentObject(chiosco)

// Nelle viste
@EnvironmentObject var chiosco: Chiosco
```

### Memory Management

- `weak self` in closure per evitare retain cycles
- Timer invalidati in `deinit`
- No memory leaks grazie ad ARC (Automatic Reference Counting)

## 🎯 Prossimi Passi (Opzionali)

Feature non ancora implementate (presenti nella web app):

- [ ] Feature 003: Manutenzione cassetta (apertura/chiusura fisica)
- [ ] Feature 004: Gestione saldo monete con azzeramento
- [ ] Suoneria per stato FUORI SERVIZIO
- [ ] Persistenza locale (UserDefaults/CoreData)
- [ ] Animazioni avanzate (come CSS animations web)

## 📄 Licenza

Stesso progetto della web app originale - vedi README principale del repository.

## 🙏 Crediti

- **Web app originale**: HTML/CSS/JavaScript vanilla
- **iOS port**: Swift + SwiftUI
- **Architettura**: FSM mantenuta identica
