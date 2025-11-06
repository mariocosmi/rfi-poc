//
//  ChioscoStato.swift
//  ChioscoApp
//
//  Enum per gli stati della Finite State Machine del chiosco
//  Tradotto da: js/chiosco.js
//

import Foundation

/// Stati della macchina a stati del chiosco
enum ChioscoStato: String {
    /// Stato iniziale - In attesa di azione utente
    case idle = "IDLE"

    /// Inserimento monete in corso (con timeout 20s)
    case pagamentoMonete = "PAGAMENTO_MONETE"

    /// Transazione carta di credito in corso
    case pagamentoCarta = "PAGAMENTO_CARTA"

    /// Verifica codice QR autorizzato in corso
    case verificaQR = "VERIFICA_QR"

    /// Verifica carta contactless autorizzata in corso
    case verificaCarta = "VERIFICA_CARTA"

    /// Porta aperta (si chiude automaticamente dopo 15s)
    case portaAperta = "PORTA_APERTA"

    /// Timeout inattività (ritorna a IDLE dopo 2s)
    case timeout = "TIMEOUT"

    /// Attesa autenticazione operatore (10s countdown) - Feature 003
    case manutenzioneAuthPending = "MANUTENZIONE_AUTH_PENDING"

    /// Operatore autenticato, attesa chiusura cassetta - Feature 003
    case manutenzioneAttesaChiusura = "MANUTENZIONE_ATTESA_CHIUSURA"

    /// Scelta azzeramento saldo monete - Feature 003
    case manutenzioneSceltaAzzeramento = "MANUTENZIONE_SCELTA_AZZERAMENTO"

    /// Sistema fuori servizio (timeout auth), richiede reset operatore - Feature 003
    case fuoriServizio = "FUORI_SERVIZIO"
}

/// Transizioni permesse tra stati
struct TransizioniPermesse {
    static let mappa: [ChioscoStato: [ChioscoStato]] = [
        .idle: [.pagamentoMonete, .pagamentoCarta, .verificaQR, .verificaCarta, .portaAperta, .manutenzioneAuthPending],
        .pagamentoMonete: [.portaAperta, .timeout, .idle, .manutenzioneAuthPending],
        .pagamentoCarta: [.portaAperta, .idle],
        .verificaQR: [.portaAperta, .idle],
        .verificaCarta: [.portaAperta, .idle],
        .portaAperta: [.idle, .manutenzioneAuthPending],
        .timeout: [.idle],
        .manutenzioneAuthPending: [.manutenzioneAttesaChiusura, .fuoriServizio, .idle],
        .manutenzioneAttesaChiusura: [.manutenzioneSceltaAzzeramento, .fuoriServizio],
        .manutenzioneSceltaAzzeramento: [.idle],
        .fuoriServizio: [.idle]
    ]

    /// Verifica se una transizione è permessa
    /// - Parameters:
    ///   - da: Stato di partenza
    ///   - a: Stato di destinazione
    /// - Returns: true se la transizione è permessa
    static func isPermessa(da: ChioscoStato, a: ChioscoStato) -> Bool {
        return mappa[da]?.contains(a) ?? false
    }
}
