//
//  Validatore.swift
//  ChioscoApp
//
//  Regole hardcoded per validazione codici e carte
//  Tradotto da: js/validatore.js
//
//  Regole:
//  - Codici QR/Carte autorizzate: numeri da 1 a 99
//  - Carte di credito: solo VISA (numero inizia con "4")
//

import Foundation

/// Validatore per codici autorizzati e carte di credito
struct Validatore {
    /// Verifica se un codice QR o carta contactless è autorizzato
    /// - Parameter codice: Il codice da verificare
    /// - Returns: true se autorizzato (1-99), false altrimenti
    static func isCodiceAutorizzato(_ codice: String) -> Bool {
        guard let num = Int(codice) else {
            Logger.debug("Validatore.isCodiceAutorizzato(\"\(codice)\"): NON AUTORIZZATO (non numerico)")
            return false
        }

        let isValid = num >= 1 && num <= 99

        Logger.debug("Validatore.isCodiceAutorizzato(\"\(codice)\"): \(isValid ? "AUTORIZZATO" : "NON AUTORIZZATO")")

        return isValid
    }

    /// Verifica se una carta di credito è VISA
    /// - Parameter numeroCarta: Il numero della carta
    /// - Returns: true se VISA (inizia con "4"), false altrimenti
    static func isCartaVISA(_ numeroCarta: String) -> Bool {
        guard !numeroCarta.isEmpty else {
            Logger.debug("Validatore.isCartaVISA: formato non valido (stringa vuota)")
            return false
        }

        let isVisa = numeroCarta.hasPrefix("4")

        Logger.debug("Validatore.isCartaVISA(\"\(numeroCarta)\"): \(isVisa ? "VISA" : "NON VISA")")

        return isVisa
    }

    /// Verifica se una carta è valida (VISA + lunghezza minima)
    /// - Parameter numeroCarta: Il numero della carta
    /// - Returns: true se carta valida, false altrimenti
    static func isCartaValida(_ numeroCarta: String) -> Bool {
        let isVisa = isCartaVISA(numeroCarta)
        let hasValidLength = numeroCarta.count >= 13 && numeroCarta.count <= 19
        let isValid = isVisa && hasValidLength

        Logger.debug("Validatore.isCartaValida(\"\(numeroCarta)\"): \(isValid)")

        return isValid
    }
}
