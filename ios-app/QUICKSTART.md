# Quickstart - ChioscoApp iOS

Guida rapida per eseguire l'app iOS del chiosco in 2 minuti.

---

## ⚡ Setup Veloce

### Opzione A: Setup Automatico (30 secondi)

```bash
cd ios-app
./setup.sh
```

✅ Lo script installa tutto, genera il progetto e apre Xcode.

### Opzione B: Setup Manuale

Vedi **[SETUP.md](SETUP.md)** per istruzioni complete passo-passo.

---

## 🧪 Test Rapidi

Dopo aver avviato l'app nel simulatore, testa queste funzionalità:

### ✅ Test 1: Pagamento Monete (15 sec)
```
1. Tap "1,00€" → Display: "Rimanente: 0,20 €"
2. Tap "0,20€" → Porta si apre 🚪
3. Tap "Persona passata" → Porta si chiude
```
**Risultato atteso**: Porta aperta e chiusa ✅

### ✅ Test 2: Carta VISA (10 sec)
```
1. Tap "Paga con Carta"
2. Inserisci: 4111111111111111
3. Tap "Conferma Pagamento"
```
**Risultato atteso**: "Pagamento accettato" + Porta aperta ✅

### ✅ Test 3: Carta Non-VISA (10 sec)
```
1. Tap "Paga con Carta"
2. Inserisci: 5500000000000004
3. Tap "Conferma Pagamento"
```
**Risultato atteso**: "Pagamento rifiutato - Solo VISA" ❌

### ✅ Test 4: QR Autorizzato (5 sec)
```
1. Inserisci "42" in Lettore QR
2. Tap "Scansiona"
```
**Risultato atteso**: "Accesso autorizzato" + Porta aperta ✅

### ✅ Test 5: QR Non Autorizzato (5 sec)
```
1. Inserisci "100" in Lettore QR
2. Tap "Scansiona"
```
**Risultato atteso**: "Accesso negato" ❌

### ✅ Test 6: Timeout Inattività (20 sec)
```
1. Tap "0,50€"
2. NON fare altro per 20 secondi
3. Osserva countdown: "⏱️ Timeout: 19s... 18s..."
```
**Risultato atteso**: "Timeout - Operazione annullata" ⏱️

---

## 🐛 Problemi Comuni (Fix Rapidi)

### Errore: "Cannot find type 'ChioscoStato'"
**Fix**: File non nel target → Seleziona file, spunta "ChioscoApp" in Target Membership

### Errore: "Signing requires a development team"
**Fix**: Signing & Capabilities → Seleziona tuo Team Apple

### App compila ma schermo bianco
**Fix**: Product → Clean Build Folder (⇧⌘K) + Ricompila (⌘B)

### Script setup.sh non funziona
**Fix**: Installa XcodeGen: `brew install xcodegen`

**Più dettagli**: Vedi [SETUP.md](SETUP.md) per risoluzione problemi completa

---

## 📚 Documentazione Completa

- **[README.md](README.md)** - Architettura, struttura progetto, debugging
- **[SETUP.md](SETUP.md)** - Guida setup dettagliata (manuale + automatico)

---

## ✅ Checklist Pre-Test

- [ ] Xcode 15+ installato
- [ ] Progetto aperto in Xcode (`./setup.sh` o manuale)
- [ ] Simulatore iPhone/iPad selezionato
- [ ] App compilata senza errori (⌘ + B)
- [ ] App in esecuzione nel simulatore (⌘ + R)

**Se tutto ok**: Procedi con i test sopra! 🎉

---

## 🎯 Next Steps

Dopo aver testato l'app:

1. **Esplora il codice**: `Core/Chiosco.swift` (FSM)
2. **Personalizza UI**: `Views/ContentView.swift`
3. **Aggiungi log**: `Logger.debug("...")`
4. **Testa su dispositivo reale**: Vedi [SETUP.md](SETUP.md#-esegui-su-dispositivo-fisico)

Buon divertimento! 🚀
