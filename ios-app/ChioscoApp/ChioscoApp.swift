//
//  ChioscoApp.swift
//  ChioscoApp
//
//  Entry point dell'applicazione iOS
//  Simulatore chiosco ingresso ferroviario
//

import SwiftUI

@main
struct ChioscoApp: App {
    // Crea istanza globale del chiosco (singleton)
    @StateObject private var chiosco = Chiosco()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(chiosco)
        }
    }
}
