# Setup Completo - ChioscoApp iOS

Guida completa per configurare ed eseguire l'app iOS del chiosco.

---

## 🚀 Metodo 1: Setup Automatico (RACCOMANDATO)

Il modo più veloce per iniziare.

### Requisiti

- **macOS** (Ventura 13+)
- **Xcode 15+** ([Download da App Store](https://apps.apple.com/it/app/xcode/id497799835))
- **Homebrew** ([Installa da brew.sh](https://brew.sh))

### Passaggi

1. **Apri Terminal** e naviga nella directory del progetto:

```bash
cd ios-app
```

2. **Esegui lo script di setup**:

```bash
./setup.sh
```

Lo script:
- ✅ Verifica che XcodeGen sia installato (altrimenti ti guida nell'installazione)
- ✅ Genera automaticamente il progetto Xcode completo
- ✅ Ti chiede se vuoi aprire il progetto

3. **Esegui l'app**:
   - In Xcode, seleziona un simulatore (es. iPhone 15 Pro)
   - Premi **⌘ + R** per eseguire

**Fatto!** L'app dovrebbe avviarsi nel simulatore.

---

## 🛠️ Metodo 2: Setup Manuale in Xcode

Se preferisci creare il progetto manualmente.

### Passo 1: Crea Nuovo Progetto Xcode

1. Apri **Xcode**
2. File → New → Project
3. Seleziona:
   - **iOS** → **App**
   - Product Name: `ChioscoApp`
   - Team: Seleziona il tuo team Apple (o lascia "None" per testing)
   - Organization Identifier: `it.rfi`
   - Interface: **SwiftUI**
   - Language: **Swift**
   - Storage: **None**
   - Deseleziona "Include Tests"
4. Salva in una directory temporanea

### Passo 2: Sostituisci i File

1. **Elimina** questi file creati automaticamente da Xcode:
   - `ContentView.swift`
   - `ChioscoAppApp.swift`
   - `Assets.xcassets/` (intera directory)
   - `Info.plist` (se presente)

2. **Copia** i file da questo repository nel progetto:

```bash
# Dalla directory ios-app/
cp ChioscoApp/ChioscoApp.swift [TuoProgettoXcode]/ChioscoApp/
cp ChioscoApp/Info.plist [TuoProgettoXcode]/ChioscoApp/
cp -r ChioscoApp/Assets.xcassets [TuoProgettoXcode]/ChioscoApp/
cp -r ChioscoApp/Core [TuoProgettoXcode]/ChioscoApp/
cp -r ChioscoApp/Models [TuoProgettoXcode]/ChioscoApp/
cp -r ChioscoApp/Views [TuoProgettoXcode]/ChioscoApp/
```

3. **In Xcode**, aggiungi i file al progetto:
   - Tasto destro sul gruppo `ChioscoApp` → **Add Files to "ChioscoApp"**
   - Seleziona le directory `Core`, `Models`, `Views`
   - Assicurati che:
     - ✅ "Copy items if needed" sia **selezionato**
     - ✅ "Create groups" sia selezionato
     - ✅ Target "ChioscoApp" sia **spuntato**

### Passo 3: Configura il Progetto

1. Seleziona il **target ChioscoApp** nel navigator
2. **General** tab:
   - Bundle Identifier: `it.rfi.ChioscoApp`
   - Version: `1.0`
   - Build: `1`
   - iOS Deployment Target: **17.0**
   - Supported Destinations: **iPhone, iPad**

3. **Signing & Capabilities**:
   - Team: Seleziona il tuo team Apple
   - Oppure: "Signing" → "Sign to Run Locally" per testing

4. **Build Settings**:
   - Swift Language Version: **Swift 5**
   - Enable Previews: **Yes**

### Passo 4: Verifica Info.plist

1. Seleziona `Info.plist` nel navigator
2. Verifica che contenga:
   - ✅ `CFBundleDisplayName` = "Chiosco Ingresso"
   - ✅ Supported interface orientations configurati

### Passo 5: Build & Run

1. Seleziona un simulatore (es. **iPhone 15 Pro**)
2. Premi **⌘ + B** per compilare (verifica che non ci siano errori)
3. Premi **⌘ + R** per eseguire

**Fatto!** L'app dovrebbe avviarsi nel simulatore.

---

## 📱 Esegui su Dispositivo Fisico

### Requisiti

- iPhone/iPad con **iOS 17+**
- Cavo USB-C o Lightning
- **Apple Developer Account** (gratuito o a pagamento)

### Passaggi

1. Collega il dispositivo al Mac
2. In Xcode, seleziona il tuo dispositivo dal menu dropdown (es. "Mario's iPhone")
3. **Signing & Capabilities**:
   - Seleziona il tuo Team Apple
   - Xcode genererà automaticamente un profilo di provisioning
4. Premi **⌘ + R**
5. Sul dispositivo, vai in **Impostazioni → Generali → Gestione VPN e dispositivi**
6. Autorizza il profilo di sviluppo

**L'app si avvierà sul dispositivo!**

---

## 🐛 Risoluzione Problemi

### Errore: "XcodeGen not found" (Setup Automatico)

**Soluzione**:
```bash
# Installa XcodeGen con Homebrew
brew install xcodegen

# Oppure con Mint
brew install mint
mint install yonaskolb/XcodeGen
```

### Errore: "Cannot find type 'ChioscoStato' in scope"

**Causa**: File non aggiunti correttamente al target

**Soluzione**:
1. Seleziona ogni file `.swift` nel navigator
2. Nel pannello **File Inspector** (destra), sotto "Target Membership"
3. Assicurati che `ChioscoApp` sia **spuntato**

### Errore: "Multiple commands produce..."

**Causa**: File duplicati nel target

**Soluzione**:
1. Vai su **Build Phases** → **Compile Sources**
2. Rimuovi file duplicati (ogni file deve apparire **una sola volta**)

### Errore: "Signing for 'ChioscoApp' requires a development team"

**Soluzione**:
1. Vai in **Signing & Capabilities**
2. Seleziona il tuo Team Apple dal menu dropdown
3. Oppure: Abilita "Automatically manage signing"

### App compila ma schermo bianco

**Causa**: ContentView non caricata correttamente o problemi con `@main`

**Soluzione**:
1. Verifica che `ChioscoApp.swift` abbia `@main` all'inizio
2. Verifica che `ContentView.swift` esista e sia nel target
3. Pulisci build folder: **Product → Clean Build Folder** (⇧⌘K)
4. Ricompila: **⌘ + B**

### Timer/Animazioni non funzionano

**Causa**: Problema con main thread o SwiftUI updates

**Soluzione**: Già gestito nel codice, ma verifica che:
- `Chiosco` sia `@StateObject` in `ChioscoApp`
- `Chiosco` sia `@EnvironmentObject` nelle View
- Tutti gli aggiornamenti `@Published` avvengano su main thread

---

## 🧪 Test Rapidi

Dopo aver avviato l'app, prova questi scenari:

### ✅ Test 1: Pagamento Monete
1. Tap **"1,00€"** → Display: "Rimanente: 0,20 €"
2. Tap **"0,20€"** → Porta si apre 🚪
3. Tap **"Persona passata"** → Porta si chiude

**Risultato atteso**: Porta aperta e chiusa correttamente

### ✅ Test 2: Carta VISA
1. Tap **"Paga con Carta"**
2. Inserisci: `4111111111111111`
3. Tap **"Conferma Pagamento"**
4. Display: "Pagamento accettato" → Porta si apre ✅

**Risultato atteso**: Pagamento accettato

### ✅ Test 3: Carta Non-VISA
1. Tap **"Paga con Carta"**
2. Inserisci: `5500000000000004` (Mastercard)
3. Tap **"Conferma Pagamento"**
4. Display: "Pagamento rifiutato - Solo VISA" ❌

**Risultato atteso**: Pagamento rifiutato

### ✅ Test 4: QR Autorizzato
1. Inserisci `42` in **"Lettore QR"**
2. Tap **"Scansiona"**
3. Display: "Accesso autorizzato" → Porta si apre ✅

**Risultato atteso**: Accesso autorizzato

### ✅ Test 5: QR Non Autorizzato
1. Inserisci `100` in **"Lettore QR"**
2. Tap **"Scansiona"**
3. Display: "Accesso negato" ❌

**Risultato atteso**: Accesso negato

### ✅ Test 6: Timeout Inattività
1. Tap **"0,50€"**
2. **NON fare altro** per 20 secondi
3. Display mostra countdown: "⏱️ Timeout: 19s... 18s... 1s"
4. Dopo 20s: "Timeout - Operazione annullata"

**Risultato atteso**: Sistema ritorna a IDLE

---

## 📚 Prossimi Passi

Dopo aver configurato l'app con successo:

1. **Esplora il codice**:
   - `Core/Chiosco.swift` - FSM principale
   - `Views/ContentView.swift` - Layout principale
   - `Models/` - Logica di business

2. **Personalizza l'UI**:
   - Colori in `Views/*.swift`
   - Layout in `ContentView.swift`
   - Icone in `Assets.xcassets/`

3. **Aggiungi logging**:
   ```swift
   Logger.debug("Il mio messaggio di debug")
   Logger.info("Operazione completata")
   ```

4. **Testa su dispositivo reale** (vedi sezione sopra)

5. **Leggi la documentazione**:
   - `README.md` - Architettura completa
   - `QUICKSTART.md` - Guida rapida

---

## ✅ Checklist Pre-Lancio

Prima di eseguire l'app, assicurati che:

- [x] Xcode 15+ installato
- [x] Tutti i file `.swift` nel progetto
- [x] Target membership corretto per ogni file
- [x] Info.plist presente e configurato
- [x] Assets.xcassets presente
- [x] iOS Deployment Target = 17.0+
- [x] Simulatore o dispositivo selezionato
- [x] Nessun errore di compilazione (⌘ + B)

---

## 🆘 Supporto

Se incontri problemi:

1. **Verifica i requisiti** (macOS, Xcode, iOS versioni)
2. **Pulisci e ricompila**: ⇧⌘K + ⌘B
3. **Riavvia Xcode**
4. **Controlla i log** nella Console Xcode
5. **Consulta** `README.md` per dettagli architettura

---

## 🎯 File Importanti

- `setup.sh` - Script setup automatico (Metodo 1)
- `project.yml` - Configurazione XcodeGen
- `ChioscoApp/Info.plist` - Configurazione app
- `ChioscoApp/Assets.xcassets/` - Risorse grafiche
- `README.md` - Documentazione completa
- Questo file (`SETUP.md`) - Guida setup

---

**Buon sviluppo! 🚀**

Per domande o supporto, consulta la documentazione nel repository.
