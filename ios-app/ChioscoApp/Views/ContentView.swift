//
//  ContentView.swift
//  ChioscoApp
//
//  Vista principale dell'applicazione
//  Layout chiosco con display, input controls e porta
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var chiosco: Chiosco

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HeaderView()

            // Layout principale
            GeometryReader { geometry in
                HStack(spacing: 20) {
                    // Area input (sinistra)
                    ScrollView {
                        VStack(spacing: 20) {
                            // Display
                            DisplayView()

                            // Gettoniera
                            GettonierapView()

                            // Pagamento Carta
                            PagamentoCartaView()

                            // Lettore Carte Autorizzate
                            LettoreCarteView()

                            // Lettore QR
                            LettoreQRView()
                        }
                        .padding()
                    }
                    .frame(width: geometry.size.width * 0.6)

                    // Porta (destra)
                    PortaView()
                        .frame(width: geometry.size.width * 0.35)
                }
                .padding()
            }

            // Footer
            FooterView()
        }
        .background(Color(UIColor.systemGroupedBackground))
    }
}

// MARK: - Header

struct HeaderView: View {
    var body: some View {
        ZStack {
            Color.blue
                .ignoresSafeArea(edges: .top)

            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("🚪 Chiosco Ingresso")
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundColor(.white)

                    Text("Simulatore di pagamento e controllo accessi")
                        .font(.subheadline)
                        .foregroundColor(.white.opacity(0.9))
                }

                Spacer()
            }
            .padding()
        }
        .frame(height: 100)
    }
}

// MARK: - Footer

struct FooterView: View {
    var body: some View {
        HStack {
            Text("Branch: ios-swift-app | iOS App | Versione 1.0")
                .font(.caption)
                .foregroundColor(.secondary)

            Spacer()
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
        .background(Color(UIColor.systemBackground))
    }
}

#Preview {
    ContentView()
        .environmentObject(Chiosco())
}
