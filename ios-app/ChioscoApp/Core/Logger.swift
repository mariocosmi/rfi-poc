//
//  Logger.swift
//  ChioscoApp
//
//  Sistema di logging centralizzato
//  Tradotto da: js/logger.js (wrapper per loglevel)
//  Usa os.log per conformità alle best practice Apple
//

import Foundation
import os.log

/// Livelli di log
enum LogLevel: String {
    case debug = "DEBUG"
    case info = "INFO"
    case warning = "WARN"
    case error = "ERROR"
}

/// Logger centralizzato per l'applicazione
class Logger {
    // Subsystem per os.log
    private static let subsystem = Bundle.main.bundleIdentifier ?? "it.rfi.chiosco"
    private static let category = "Chiosco"

    // Logger OS
    private static let osLog = OSLog(subsystem: subsystem, category: category)

    // Livello minimo di logging (configurabile)
    static var livelloMinimo: LogLevel = .debug

    /// Log messaggio debug
    /// - Parameter messaggio: Messaggio da loggare
    static func debug(_ messaggio: String) {
        log(messaggio, livello: .debug)
    }

    /// Log messaggio info
    /// - Parameter messaggio: Messaggio da loggare
    static func info(_ messaggio: String) {
        log(messaggio, livello: .info)
    }

    /// Log messaggio warning
    /// - Parameter messaggio: Messaggio da loggare
    static func warning(_ messaggio: String) {
        log(messaggio, livello: .warning)
    }

    /// Log messaggio error
    /// - Parameter messaggio: Messaggio da loggare
    static func error(_ messaggio: String) {
        log(messaggio, livello: .error)
    }

    /// Funzione interna di logging
    /// - Parameters:
    ///   - messaggio: Messaggio da loggare
    ///   - livello: Livello del log
    private static func log(_ messaggio: String, livello: LogLevel) {
        // Filtra in base al livello minimo
        guard shouldLog(livello) else { return }

        let messaggioFormattato = "[\(livello.rawValue)] \(messaggio)"

        // Log su console Xcode (sempre visibile durante sviluppo)
        print(messaggioFormattato)

        // Log su os.log (per debugging con Instruments/Console.app)
        let osLogType = mappaLivelloOSLog(livello)
        os_log("%{public}@", log: osLog, type: osLogType, messaggioFormattato)
    }

    /// Verifica se un messaggio dovrebbe essere loggato in base al livello minimo
    /// - Parameter livello: Livello del messaggio
    /// - Returns: true se il messaggio deve essere loggato
    private static func shouldLog(_ livello: LogLevel) -> Bool {
        let priorita: [LogLevel: Int] = [
            .debug: 0,
            .info: 1,
            .warning: 2,
            .error: 3
        ]

        let prioritaLivello = priorita[livello] ?? 0
        let prioritaMinima = priorita[livelloMinimo] ?? 0

        return prioritaLivello >= prioritaMinima
    }

    /// Mappa LogLevel a OSLogType
    /// - Parameter livello: Livello del log
    /// - Returns: OSLogType corrispondente
    private static func mappaLivelloOSLog(_ livello: LogLevel) -> OSLogType {
        switch livello {
        case .debug:
            return .debug
        case .info:
            return .info
        case .warning:
            return .default
        case .error:
            return .error
        }
    }
}
