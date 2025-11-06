# Quickstart - ChioscoApp iOS

Guida rapida per configurare e eseguire l'app iOS del chiosco.

## 🚀 Opzione 1: Crea Progetto Xcode Manualmente

### Passo 1: Crea nuovo progetto Xcode

1. Apri **Xcode**
2. File → New → Project
3. Seleziona:
   - **iOS** → **App**
   - Product Name: `ChioscoApp`
   - Interface: **SwiftUI**
   - Language: **Swift**
   - Organization Identifier: `it.rfi` (o tuo)
4. Salva in una cartella temporanea

### Passo 2: Copia i file sorgente

1. **Elimina** il file `ContentView.swift` creato automaticamente da Xcode
2. **Copia** tutti i file dalla directory `ChioscoApp/` di questo repository nel progetto Xcode:

```bash
# Dalla directory ios-app/
cp -r ChioscoApp/Core/*.swift [TuoProgettoXcode]/ChioscoApp/
cp -r ChioscoApp/Models/*.swift [TuoProgettoXcode]/ChioscoApp/
cp -r ChioscoApp/Views/*.swift [TuoProgettoXcode]/ChioscoApp/
cp ChioscoApp/ChioscoApp.swift [TuoProgettoXcode]/ChioscoApp/
```

3. In Xcode, aggiungi i file al progetto:
   - Tasto destro sul gruppo `ChioscoApp` → Add Files to "ChioscoApp"
   - Seleziona tutti i file `.swift` copiati
   - Assicurati che "Copy items if needed" sia **deselezionato** (file già copiati)

### Passo 3: Organizza i file in gruppi

Nel navigator di Xcode, crea questa struttura:

```
ChioscoApp/
├── ChioscoApp.swift
├── Core/
│   ├── ChioscoStato.swift
│   ├── Chiosco.swift
│   ├── GestoreTimeout.swift
│   ├── Logger.swift
│   └── Validatore.swift
├── Models/
│   ├── Display.swift
│   ├── Porta.swift
│   └── Gettoniera.swift
└── Views/
    ├── ContentView.swift
    ├── DisplayView.swift
    ├── PortaView.swift
    ├── GettonierapView.swift
    ├── PagamentoCartaView.swift
    ├── LettoreCarteView.swift
    └── LettoreQRView.swift
```

### Passo 4: Configura target iOS

1. Seleziona il **target ChioscoApp**
2. General → Deployment Info:
   - **iOS Deployment Target**: 17.0 (o superiore)
   - **Supported Destinations**: iPhone, iPad
   - **Orientation**: Portrait, Landscape

### Passo 5: Esegui l'app

1. Seleziona un simulatore (es. iPhone 15 Pro)
2. Premi **⌘ + R** (o Product → Run)
3. L'app dovrebbe compilare e avviarsi nel simulatore

---

## 🚀 Opzione 2: Usa Swift Package (Avanzato)

### Crea Package.swift

Se preferisci usare Swift Package Manager invece di Xcode:

```bash
cd ios-app/ChioscoApp
swift package init --type executable
```

Modifica `Package.swift`:

```swift
// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "ChioscoApp",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(name: "ChioscoApp", targets: ["ChioscoApp"])
    ],
    targets: [
        .target(
            name: "ChioscoApp",
            path: "."
        )
    ]
)
```

**Nota**: Swift Package non supporta nativamente app iOS con UI - questa opzione è solo per compilare la logica di business.

---

## 🧪 Test Rapido

Dopo aver eseguito l'app, prova questi scenari:

### Test 1: Pagamento Monete
1. Tap "1,00€" (Display mostra "Rimanente: 0,20 €")
2. Tap "0,20€" (Porta si apre)
3. Tap "Persona passata" (Porta si chiude)

### Test 2: Carta VISA
1. Tap "Paga con Carta"
2. Inserisci "4111111111111111"
3. Tap "Conferma Pagamento"
4. Porta si apre ✅

### Test 3: Carta Non VISA
1. Tap "Paga con Carta"
2. Inserisci "5500000000000004"
3. Tap "Conferma Pagamento"
4. Display mostra "Pagamento rifiutato" ❌

### Test 4: QR Autorizzato
1. Inserisci "42" in "Lettore QR"
2. Tap "Scansiona"
3. Porta si apre ✅

### Test 5: QR Non Autorizzato
1. Inserisci "100" in "Lettore QR"
2. Tap "Scansiona"
3. Display mostra "Accesso negato" ❌

---

## 🐛 Risoluzione Problemi

### Errore: "Cannot find type 'ChioscoStato' in scope"

**Causa**: File non aggiunti correttamente al target

**Soluzione**:
1. Seleziona ogni file `.swift` nel navigator
2. Nel pannello di destra, sotto "Target Membership", assicurati che `ChioscoApp` sia **spuntato**

### Errore: "Multiple commands produce..."

**Causa**: File duplicati nel target

**Soluzione**:
1. Vai su Build Phases → Compile Sources
2. Rimuovi duplicati (ogni file deve apparire una sola volta)

### App compila ma schermo bianco

**Causa**: ContentView non caricata correttamente

**Soluzione**:
1. Verifica che `ChioscoApp.swift` contenga:
   ```swift
   @main
   struct ChioscoApp: App {
       @StateObject private var chiosco = Chiosco()

       var body: some Scene {
           WindowGroup {
               ContentView()
                   .environmentObject(chiosco)
           }
       }
   }
   ```

### Timer non funzionano

**Causa**: SwiftUI richiede aggiornamenti su main thread

**Soluzione**: Già gestito nel codice con `DispatchQueue.main.asyncAfter`

---

## 📚 Risorse

- **Apple Documentation**: [SwiftUI Tutorials](https://developer.apple.com/tutorials/swiftui)
- **Xcode Help**: Help → Xcode Help
- **README.md**: Documentazione completa dell'architettura

---

## ✅ Checklist Pre-Lancio

Prima di eseguire l'app, assicurati che:

- [x] Tutti i file `.swift` siano nel progetto Xcode
- [x] Target membership corretto per ogni file
- [x] iOS Deployment Target = 17.0+
- [x] Simulatore selezionato (iPhone o iPad)
- [x] Nessun errore di compilazione (⌘ + B)

---

## 🎯 Next Steps

Dopo aver eseguito l'app con successo:

1. Esplora il codice in `Core/Chiosco.swift` (FSM principale)
2. Modifica i colori in `Views/*.swift` per personalizzare l'UI
3. Aggiungi logging con `Logger.debug("...")` per debugging
4. Testa tutti gli scenari di pagamento

Buon sviluppo! 🚀
