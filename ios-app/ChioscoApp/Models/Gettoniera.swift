//
//  Gettoniera.swift
//  ChioscoApp
//
//  Modello per simulazione gettoniera
//  Gestisce inserimento monete e calcolo importo rimanente
//  Tradotto da: js/gettoniera.js
//

import Foundation

/// Modello per la gettoniera del chiosco
class GettonierapModello: ObservableObject {
    // Stato pubblicato per SwiftUI
    @Published var importoInserito: Double = 0.0
    @Published var saldoCassetta: Double = 0.0  // Feature 003

    let importoRichiesto: Double
    private var moneteInserite: [Double] = []

    // Tagli monete disponibili (in euro)
    let tagliDisponibili: [Double] = [1.00, 0.50, 0.20, 0.10, 0.05, 0.02, 0.01]

    init(importoRichiesto: Double = 1.20) {
        self.importoRichiesto = importoRichiesto
        Logger.info("💰 Gettoniera inizializzata - Importo richiesto: \(Self.formattaImporto(importoRichiesto))")
    }

    /// Inserisci una moneta
    /// - Parameter valore: Valore moneta in euro
    /// - Returns: true se inserimento riuscito
    func inserisciMoneta(_ valore: Double) -> Bool {
        // Verifica che sia un taglio valido
        guard tagliDisponibili.contains(valore) else {
            Logger.warning("⚠️ Taglio moneta non valido: \(Self.formattaImporto(valore))")
            return false
        }

        // Inserisci moneta (pagamento corrente + cassetta)
        importoInserito += valore
        moneteInserite.append(valore)
        saldoCassetta += valore

        let rimanente = getImportoRimanente()

        Logger.info("💰 Moneta inserita: \(Self.formattaImporto(valore)) | Totale: \(Self.formattaImporto(importoInserito)) | Rimanente: \(Self.formattaImporto(rimanente)) | Saldo cassetta: \(Self.formattaImporto(saldoCassetta))")

        return true
    }

    /// Ottieni importo rimanente da versare
    /// - Returns: Importo rimanente (0 se pagamento completato)
    func getImportoRimanente() -> Double {
        let rimanente = importoRichiesto - importoInserito
        // Arrotonda a 2 decimali per evitare problemi float
        return max(0, (rimanente * 100).rounded() / 100)
    }

    /// Verifica se pagamento è completato
    var isPagamentoCompletato: Bool {
        return getImportoRimanente() <= 0
    }

    /// Ottieni importo inserito
    var importoInseritoCorrected: Double {
        return (importoInserito * 100).rounded() / 100
    }

    /// Ottieni lista monete inserite
    func getMoneteInserite() -> [Double] {
        return moneteInserite
    }

    /// Reset gettoniera (nuovo pagamento)
    /// NOTA: Azzera solo importo corrente, NON il saldo cassetta
    func reset() {
        let vecchioImporto = importoInserito

        importoInserito = 0
        moneteInserite = []
        // NON azzerare saldoCassetta - rimane in cassetta!

        if vecchioImporto > 0 {
            Logger.debug("💰 Gettoniera resettata (importo precedente: \(Self.formattaImporto(vecchioImporto))) - Saldo cassetta: \(Self.formattaImporto(saldoCassetta))")
        }
    }

    /// Ottieni saldo monete corrente nella cassetta (Feature 003)
    /// - Returns: Saldo totale monete in cassetta (euro)
    func getSaldoMonete() -> Double {
        let saldo = saldoCassetta
        Logger.debug("💰 Saldo monete cassetta: \(Self.formattaImporto(saldo))")
        return (saldo * 100).rounded() / 100
    }

    /// Azzera saldo cassetta monete (Feature 003)
    /// Simula svuotamento fisico della cassetta
    /// - Returns: Saldo azzerato (per logging operazione)
    @discardableResult
    func azzeraSaldo() -> Double {
        let saldoPrecedente = getSaldoMonete()

        if saldoPrecedente <= 0 {
            Logger.info("💰 Azzeramento saldo cassetta: già a \(Self.formattaImporto(0))")
            return 0
        }

        // Azzera SOLO saldo cassetta, non importo corrente
        saldoCassetta = 0

        Logger.warning("💰 Saldo cassetta azzerato: \(Self.formattaImporto(saldoPrecedente)) → \(Self.formattaImporto(0))")
        return saldoPrecedente
    }

    /// Formatta importo per display
    /// - Parameter importo: Importo da formattare
    /// - Returns: Importo formattato (es. "1,20€")
    static func formattaImporto(_ importo: Double) -> String {
        return String(format: "%.2f", importo).replacingOccurrences(of: ".", with: ",") + "€"
    }
}
