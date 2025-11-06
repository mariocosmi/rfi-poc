//
//  GestoreTimeout.swift
//  ChioscoApp
//
//  Gestisce timeout inattività con countdown
//  Tradotto da: js/chiosco.js (classe GestoreTimeout)
//

import Foundation

/// Gestore del timeout per inattività durante pagamento monete
class GestoreTimeout {
    private let durataSecondi: Int
    private var timer: Timer?
    private var secondiRimanenti: Int = 0
    private weak var chiosco: Chiosco?

    init(chiosco: Chiosco, durataSecondi: Int = 20) {
        self.chiosco = chiosco
        self.durataSecondi = durataSecondi
    }

    /// Avvia timeout
    func avvia() {
        Logger.debug("⏱️ Timer timeout avviato: \(durataSecondi) secondi")
        secondiRimanenti = durataSecondi

        // Avvia timer che esegue ogni secondo
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            self?.tick()
        }

        // Prima aggiornamento immediato del display
        aggiornaDisplay()
    }

    /// Tick del timer (eseguito ogni secondo)
    private func tick() {
        secondiRimanenti -= 1

        if secondiRimanenti <= 0 {
            Logger.warning("⏱️ Timeout scaduto")
            reset()
            chiosco?.transizione(.timeout)
        } else {
            aggiornaDisplay()
            Logger.debug("⏱️ Countdown: \(secondiRimanenti)s rimanenti")
        }
    }

    /// Aggiorna display con countdown
    private func aggiornaDisplay() {
        chiosco?.display.aggiornaCountdown(secondiRimanenti)
    }

    /// Reset timeout
    func reset() {
        timer?.invalidate()
        timer = nil
        secondiRimanenti = 0

        // Nascondi countdown su display
        chiosco?.display.nascondiCountdown()

        Logger.debug("⏱️ Timer timeout resettato")
    }

    deinit {
        reset()
    }
}
