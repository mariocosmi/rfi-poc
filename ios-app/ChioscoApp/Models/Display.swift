//
//  Display.swift
//  ChioscoApp
//
//  Modello per gestione display chiosco
//  Tradotto da: js/display.js
//

import Foundation

/// Tipo di messaggio visualizzato sul display
enum TipoMessaggio {
    case info
    case successo
    case errore
    case warning
}

/// Modello per il display del chiosco
class DisplayModello: ObservableObject {
    // Stato pubblicato per SwiftUI
    @Published var messaggio: String = "Benvenuto - Scegli modalità di accesso"
    @Published var tipoMessaggio: TipoMessaggio = .info
    @Published var importoRimanente: Double? = nil
    @Published var countdownSecondi: Int? = nil
    @Published var countdownManutenzioneSecondi: Int? = nil
    @Published var mostraPulsantiAzzeramento: Bool = false
    @Published var saldoAzzeramento: Double = 0.0

    /// Mostra messaggio iniziale
    func mostraMessaggioIniziale() {
        messaggio = "Benvenuto - Scegli modalità di accesso"
        tipoMessaggio = .info
        nascondiImporto()
        nascondiCountdown()
        Logger.debug("📺 Display: messaggio iniziale")
    }

    /// Mostra un messaggio sul display
    /// - Parameters:
    ///   - testo: Il messaggio da mostrare
    ///   - tipo: Tipo messaggio (.info, .successo, .errore, .warning)
    func mostraMessaggio(_ testo: String, tipo: TipoMessaggio = .info) {
        messaggio = testo
        tipoMessaggio = tipo
        Logger.debug("📺 Display aggiornato: \"\(testo)\" (\(tipo))")
    }

    /// Mostra importo rimanente
    /// - Parameter importo: Importo in euro
    func mostraImporto(_ importo: Double) {
        importoRimanente = importo
        Logger.debug("📺 Display importo: \(formattaImporto(importo))")
    }

    /// Nascondi importo
    func nascondiImporto() {
        importoRimanente = nil
    }

    /// Aggiorna countdown timeout
    /// - Parameter secondi: Secondi rimanenti
    func aggiornaCountdown(_ secondi: Int) {
        countdownSecondi = secondi > 0 ? secondi : nil
    }

    /// Nascondi countdown
    func nascondiCountdown() {
        countdownSecondi = nil
    }

    /// Aggiorna countdown manutenzione (Feature 003)
    /// - Parameter secondi: Secondi rimanenti per autenticazione
    func aggiornaCountdownManutenzione(_ secondi: Int) {
        countdownManutenzioneSecondi = secondi > 0 ? secondi : nil
        Logger.debug("Display: countdown manutenzione aggiornato a \(secondi)s")
    }

    /// Mostra pulsanti azzeramento saldo (Feature 003)
    /// - Parameter saldo: Saldo monete corrente in euro
    func mostraPulsantiAzzeramento(saldo: Double) {
        saldoAzzeramento = saldo
        mostraPulsantiAzzeramento = true
        mostraMessaggio("Azzerare saldo monete (\(formattaImporto(saldo)))?", tipo: .warning)
        Logger.info("Display: pulsanti azzeramento mostrati (saldo: \(formattaImporto(saldo)))")
    }

    /// Nascondi pulsanti azzeramento
    func nascondiPulsantiAzzeramento() {
        mostraPulsantiAzzeramento = false
        Logger.debug("Display: pulsanti azzeramento nascosti")
    }

    /// Mostra schermata fuori servizio (Feature 003)
    func mostraFuoriServizio() {
        mostraMessaggio("FUORI SERVIZIO - Attendere operatore", tipo: .errore)
        nascondiImporto()
        nascondiCountdown()
        Logger.warning("Display: modalità FUORI SERVIZIO attivata")
    }

    /// Formatta importo per visualizzazione
    /// - Parameter importo: Importo in euro
    /// - Returns: Stringa formattata (es. "1,20 €")
    private func formattaImporto(_ importo: Double) -> String {
        return String(format: "%.2f", importo).replacingOccurrences(of: ".", with: ",") + " €"
    }
}
