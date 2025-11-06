//
//  Porta.swift
//  ChioscoApp
//
//  Modello per simulazione porta controllata
//  Tradotto da: js/porta.js
//

import Foundation

/// Stato della porta
enum StatoPorta: String {
    case aperta = "APERTA"
    case chiusa = "CHIUSA"
}

/// Modello per la porta del chiosco
class PortaModello: ObservableObject {
    // Stato pubblicato per SwiftUI
    @Published var stato: StatoPorta = .chiusa

    // Feature 002: tracking apertura
    private var timestampApertura: Date?
    private var motivoApertura: String?
    var timerChiusuraAutomatica: Timer?

    init() {
        Logger.info("🚪 Porta inizializzata - Stato: CHIUSA")
    }

    /// Apri porta
    /// - Parameter motivo: Motivo apertura ('monete', 'carta', 'qr', 'carta-autorizzata')
    func apri(motivo: String = "pagamento") {
        guard stato == .chiusa else {
            Logger.debug("🚪 Porta già aperta")
            return
        }

        Logger.info("🚪 Apertura porta - Motivo: \(motivo)")

        stato = .aperta
        timestampApertura = Date()
        motivoApertura = motivo

        Logger.debug("🚪 Animazione apertura avviata")
    }

    /// Chiudi porta
    func chiudi() {
        guard stato == .aperta else {
            Logger.debug("🚪 Porta già chiusa")
            return
        }

        Logger.info("🚪 Chiusura porta...")

        stato = .chiusa
        timestampApertura = nil
        motivoApertura = nil
        timerChiusuraAutomatica = nil

        Logger.debug("🚪 Animazione chiusura avviata")
    }

    /// Calcola tempo apertura in secondi (Feature 002)
    /// - Returns: Secondi trascorsi dall'apertura (0 se porta chiusa)
    func getTempoAperturaSeconds() -> Int {
        guard let timestamp = timestampApertura, stato == .aperta else {
            return 0
        }
        return Int(Date().timeIntervalSince(timestamp))
    }

    /// Chiusura manuale su passaggio persona (Feature 002)
    /// Cancella timer automatico, logga evento, chiude porta
    func chiudiManuale() {
        guard stato == .aperta else {
            Logger.warning("⚠️ Tentativo chiusura manuale con porta non aperta")
            return
        }

        let tempoApertura = getTempoAperturaSeconds()
        let motivo = motivoApertura ?? "sconosciuto"

        Logger.info("🚶 Passaggio persona rilevato - Porta aperta da \(tempoApertura)s - Metodo: \(motivo)")

        // Cancella timer chiusura automatica se attivo
        if let timer = timerChiusuraAutomatica {
            timer.invalidate()
            timerChiusuraAutomatica = nil
            Logger.debug("⏱️ Timer chiusura automatica cancellato")
        }

        // Chiudi porta
        chiudi()
    }

    /// Verifica se porta è aperta
    var isAperta: Bool {
        return stato == .aperta
    }

    /// Verifica se porta è chiusa
    var isChiusa: Bool {
        return stato == .chiusa
    }
}
