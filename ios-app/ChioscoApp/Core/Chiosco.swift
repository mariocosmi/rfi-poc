//
//  Chiosco.swift
//  ChioscoApp
//
//  Macchina a Stati Finiti (FSM) principale
//  Coordina tutti i componenti e gestisce le transizioni di stato
//  Tradotto da: js/chiosco.js
//

import Foundation
import Combine

/// Chiosco - FSM principale che coordina tutti i componenti
class Chiosco: ObservableObject {
    // Stato pubblicato per SwiftUI
    @Published var stato: ChioscoStato = .idle

    // Componenti del chiosco (ObservableObject per reattività)
    @Published var display: DisplayModello
    @Published var porta: PortaModello
    @Published var gettoniera: GettonierapModello

    // Gestore timeout
    private var gestoreTimeout: GestoreTimeout?

    init() {
        // Inizializza componenti
        self.display = DisplayModello()
        self.porta = PortaModello()
        self.gettoniera = GettonierapModello()

        // Inizializza gestore timeout (passa riferimento a self dopo init)
        // Nota: gestoreTimeout viene inizializzato in setupGestoreTimeout()

        Logger.info("🏗️ Chiosco inizializzato - Stato: IDLE")

        // Setup gestore timeout dopo init completo
        setupGestoreTimeout()

        // Mostra messaggio iniziale
        display.mostraMessaggioIniziale()
    }

    /// Setup gestore timeout dopo inizializzazione
    private func setupGestoreTimeout() {
        gestoreTimeout = GestoreTimeout(chiosco: self, durataSecondi: 20)
    }

    /// Tenta una transizione di stato
    /// - Parameters:
    ///   - nuovoStato: Lo stato target
    ///   - dati: Dati opzionali per la transizione
    /// - Returns: true se transizione riuscita
    @discardableResult
    func transizione(_ nuovoStato: ChioscoStato, dati: [String: Any] = [:]) -> Bool {
        // Verifica se transizione è permessa
        guard TransizioniPermesse.isPermessa(da: stato, a: nuovoStato) else {
            Logger.error("❌ Transizione non permessa: \(stato.rawValue) → \(nuovoStato.rawValue)")
            return false
        }

        let vecchioStato = stato
        stato = nuovoStato

        Logger.info("🔄 Transizione: \(vecchioStato.rawValue) → \(nuovoStato.rawValue)")

        // Gestisci cambio stato
        onCambioStato(nuovoStato: nuovoStato, vecchioStato: vecchioStato, dati: dati)

        return true
    }

    /// Handler per cambio di stato
    private func onCambioStato(nuovoStato: ChioscoStato, vecchioStato: ChioscoStato, dati: [String: Any]) {
        switch nuovoStato {
        case .idle:
            onEntraIDLE()
        case .pagamentoMonete:
            onEntraPagamentoMonete()
        case .pagamentoCarta:
            onEntraPagamentoCarta()
        case .verificaQR:
            if let codice = dati["codice"] as? String {
                onEntraVerificaQR(codice: codice)
            }
        case .verificaCarta:
            if let codice = dati["codice"] as? String {
                onEntraVerificaCarta(codice: codice)
            }
        case .portaAperta:
            let motivo = dati["motivo"] as? String ?? "pagamento"
            onEntraPortaAperta(motivo: motivo)
        case .timeout:
            onEntraTimeout()
        default:
            // Stati manutenzione non implementati in questa versione base
            break
        }
    }

    // MARK: - Handler Stati

    /// Entra in stato IDLE
    private func onEntraIDLE() {
        // Reset timeout se attivo
        gestoreTimeout?.reset()

        // Reset gettoniera
        gettoniera.reset()

        // Reset display
        display.mostraMessaggioIniziale()

        Logger.info("🏠 Stato IDLE - Sistema pronto")
    }

    /// Entra in stato PAGAMENTO_MONETE
    private func onEntraPagamentoMonete() {
        // Avvia timeout inattività
        gestoreTimeout?.avvia()

        Logger.info("💰 Pagamento monete iniziato")
    }

    /// Entra in stato PAGAMENTO_CARTA
    private func onEntraPagamentoCarta() {
        // Mostra messaggio su display
        display.mostraMessaggio("Avvicina la carta al lettore", tipo: .info)

        Logger.info("💳 Pagamento carta iniziato")
    }

    /// Entra in stato VERIFICA_QR
    private func onEntraVerificaQR(codice: String) {
        // Usa helper DRY per verifica
        verificaAccessoConCodice(codice: codice, tipoIngresso: "QR code")
    }

    /// Entra in stato VERIFICA_CARTA
    private func onEntraVerificaCarta(codice: String) {
        // Usa helper DRY per verifica
        verificaAccessoConCodice(codice: codice, tipoIngresso: "Carta")
    }

    /// Entra in stato PORTA_APERTA
    private func onEntraPortaAperta(motivo: String) {
        // Reset timeout
        gestoreTimeout?.reset()

        // Apri porta con motivo
        porta.apri(motivo: motivo)

        // Mostra messaggio successo
        display.mostraMessaggio("Accesso consentito - Porta aperta", tipo: .successo)

        Logger.info("✅ Porta aperta - Motivo: \(motivo)")

        // Programma chiusura automatica (15s)
        let timer = Timer.scheduledTimer(withTimeInterval: 15.0, repeats: false) { [weak self] _ in
            self?.porta.chiudi()

            // Torna a IDLE dopo animazione chiusura (1.5s)
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                self?.transizione(.idle)
            }
        }

        // Salva timer in porta per poterlo cancellare
        porta.timerChiusuraAutomatica = timer
    }

    /// Entra in stato TIMEOUT
    private func onEntraTimeout() {
        Logger.warning("⏱️ Timeout inattività raggiunto")

        // Mostra messaggio timeout
        display.mostraMessaggio("Timeout - Operazione annullata", tipo: .warning)

        // Reset e torna a IDLE dopo 2 secondi
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) { [weak self] in
            self?.transizione(.idle)
        }
    }

    // MARK: - Azioni Pubbliche

    /// Inserisci moneta
    func inserisciMoneta(_ valore: Double) {
        // Se non in pagamento, inizia pagamento
        if stato == .idle {
            transizione(.pagamentoMonete)
        }

        guard stato == .pagamentoMonete else {
            Logger.warning("⚠️ Tentativo inserimento moneta in stato \(stato.rawValue)")
            return
        }

        // Inserisci moneta
        guard gettoniera.inserisciMoneta(valore) else {
            return
        }

        // Reset timeout (ogni moneta resetta il timeout)
        gestoreTimeout?.reset()
        gestoreTimeout?.avvia()

        // Aggiorna display con importo rimanente
        let rimanente = gettoniera.getImportoRimanente()
        display.mostraMessaggio("Inserisci monete", tipo: .info)
        display.mostraImporto(rimanente)

        // Verifica se pagamento completato
        verificaPagamento()
    }

    /// Verifica pagamento completato
    private func verificaPagamento() {
        guard stato == .pagamentoMonete else {
            return
        }

        if gettoniera.isPagamentoCompletato {
            Logger.info("✅ Pagamento completato")
            transizione(.portaAperta, dati: ["motivo": "monete"])
        }
    }

    /// Inizia pagamento con carta di credito
    func iniziaPagamentoCarta() {
        guard stato == .idle else {
            Logger.warning("⚠️ Tentativo pagamento carta in stato \(stato.rawValue)")
            return
        }

        transizione(.pagamentoCarta)
    }

    /// Elabora pagamento con carta
    func elaboraPagamentoCarta(numeroCarta: String) {
        guard stato == .pagamentoCarta else {
            return
        }

        display.mostraMessaggio("Elaborazione...", tipo: .info)

        // Simula elaborazione (500ms)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
            guard let self = self else { return }

            // Verifica se carta VISA valida
            if Validatore.isCartaValida(numeroCarta) {
                Logger.info("✅ Pagamento carta accettato: \(numeroCarta)")
                self.display.mostraMessaggio("Pagamento accettato", tipo: .successo)

                DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                    self.transizione(.portaAperta, dati: ["motivo": "carta"])
                }
            } else {
                Logger.warning("⚠️ Pagamento carta rifiutato: \(numeroCarta)")
                self.display.mostraMessaggio("Pagamento rifiutato - Solo VISA", tipo: .errore)

                DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                    self.transizione(.idle)
                }
            }
        }
    }

    /// Verifica QR code
    func verificaQR(codice: String) {
        guard stato == .idle else {
            Logger.warning("⚠️ Tentativo verifica QR in stato \(stato.rawValue)")
            return
        }

        transizione(.verificaQR, dati: ["codice": codice])
    }

    /// Verifica carta autorizzata
    func verificaCarta(codice: String) {
        guard stato == .idle else {
            Logger.warning("⚠️ Tentativo verifica carta in stato \(stato.rawValue)")
            return
        }

        transizione(.verificaCarta, dati: ["codice": codice])
    }

    /// Helper per verifica accesso con codice autorizzato (DRY helper)
    private func verificaAccessoConCodice(codice: String, tipoIngresso: String) {
        display.mostraMessaggio("Verifica in corso...", tipo: .info)

        // Simula verifica (500ms)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
            guard let self = self else { return }

            let autorizzato = Validatore.isCodiceAutorizzato(codice)

            if autorizzato {
                Logger.info("✅ \(tipoIngresso) \(codice): AUTORIZZATO")
                self.display.mostraMessaggio("Accesso autorizzato", tipo: .successo)

                DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                    self.transizione(.portaAperta, dati: ["motivo": tipoIngresso.lowercased()])
                }
            } else {
                Logger.warning("⚠️ \(tipoIngresso) \(codice): NON AUTORIZZATO")
                self.display.mostraMessaggio("Accesso negato", tipo: .errore)

                DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                    self.transizione(.idle)
                }
            }
        }
    }

    /// Handler passaggio persona (Feature 002)
    func onPassaggioPersona() {
        guard stato == .portaAperta else {
            Logger.warning("⚠️ Tentativo passaggio persona con porta non aperta - Ignorato")
            return
        }

        Logger.debug("🚶 Click pulsante \"Persona passata\"")

        // Mostra feedback su display
        display.mostraMessaggio("Passaggio rilevato - Porta in chiusura", tipo: .info)

        // Chiusura manuale porta (cancella timer e chiude)
        porta.chiudiManuale()

        // Torna a IDLE dopo animazione chiusura (1.5s)
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { [weak self] in
            self?.transizione(.idle)
        }
    }

    /// Reset completo del chiosco (per debugging)
    func reset() {
        Logger.warning("🔄 Reset manuale chiosco")
        transizione(.idle)
    }
}
