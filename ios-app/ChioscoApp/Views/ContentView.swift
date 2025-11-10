//
//  ContentView.swift
//  ChioscoApp
//
//  Vista principale ottimizzata per mobile
//  Layout con TabView per dividere funzionalità senza scrolling
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var chiosco: Chiosco
    @State private var selectedTab = 0

    var body: some View {
        VStack(spacing: 0) {
            // Header fisso
            HeaderView()

            // Display sempre visibile
            DisplayView()
                .padding(.horizontal)
                .padding(.top, 12)

            // StatusBar compatto (icone porta + cassetta)
            StatusBarView()
                .padding(.top, 8)

            // Pulsante Persona Passata (solo se porta aperta)
            if chiosco.porta.stato == .aperta {
                Button(action: {
                    chiosco.onPassaggioPersona()
                }) {
                    HStack {
                        Image(systemName: "figure.walk")
                        Text("Persona passata")
                    }
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .cornerRadius(12)
                }
                .padding(.horizontal)
                .padding(.top, 12)
                .transition(.move(edge: .top).combined(with: .opacity))
                .animation(.spring(), value: chiosco.porta.stato)
            }

            // TabView per funzionalità
            TabView(selection: $selectedTab) {
                // Tab 1: Pagamento
                PagamentoTabView()
                    .tabItem {
                        Label("Pagamento", systemImage: "eurosign.circle.fill")
                    }
                    .tag(0)

                // Tab 2: Accesso Autorizzato
                AccessoTabView()
                    .tabItem {
                        Label("Accesso", systemImage: "key.fill")
                    }
                    .tag(1)

                // Tab 3: Info
                InfoTabView()
                    .tabItem {
                        Label("Info", systemImage: "info.circle.fill")
                    }
                    .tag(2)
            }
        }
        .background(Color(UIColor.systemGroupedBackground))
    }
}

// MARK: - Tab Views

/// Tab Pagamento (Monete + Carta)
struct PagamentoTabView: View {
    @EnvironmentObject var chiosco: Chiosco

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Gettoniera
                GettonierapView()

                // Pagamento Carta
                PagamentoCartaView()
            }
            .padding()
        }
    }
}

/// Tab Accesso (QR + Carte Autorizzate)
struct AccessoTabView: View {
    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Lettore QR
                LettoreQRView()

                // Lettore Carte
                LettoreCarteView()

                // Info codici autorizzati
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Image(systemName: "info.circle.fill")
                            .foregroundColor(.blue)
                        Text("Codici Autorizzati")
                            .font(.headline)
                    }

                    Text("I codici autorizzati sono numeri da 1 a 99")
                        .font(.subheadline)
                        .foregroundColor(.secondary)

                    Text("Esempi: 1, 42, 99 ✅")
                        .font(.caption)
                        .foregroundColor(.green)

                    Text("Non validi: 0, 100, abc ❌")
                        .font(.caption)
                        .foregroundColor(.red)
                }
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color(UIColor.secondarySystemBackground))
                )
            }
            .padding()
        }
    }
}

/// Tab Info (Stato dettagliato + Porta)
struct InfoTabView: View {
    @EnvironmentObject var chiosco: Chiosco

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Porta (grande)
                PortaDetailView()

                // Stato Sistema
                StatoSistemaView()

                // Info Versione
                VStack(spacing: 8) {
                    Text("ChioscoApp iOS")
                        .font(.headline)

                    Text("Versione 1.0")
                        .font(.subheadline)
                        .foregroundColor(.secondary)

                    Text("Swift + SwiftUI")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding()
                .frame(maxWidth: .infinity)
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color(UIColor.secondarySystemBackground))
                )
            }
            .padding()
        }
    }
}

// MARK: - Componenti Info Tab

/// Vista porta dettagliata (solo in tab Info)
struct PortaDetailView: View {
    @EnvironmentObject var chiosco: Chiosco

    var body: some View {
        VStack(spacing: 16) {
            // Icona porta grande
            ZStack {
                RoundedRectangle(cornerRadius: 20)
                    .fill(chiosco.porta.stato == .aperta ? Color.green.opacity(0.3) : Color.gray.opacity(0.3))
                    .frame(height: 200)

                VStack(spacing: 12) {
                    Image(systemName: chiosco.porta.stato == .aperta ? "door.left.hand.open" : "door.left.hand.closed")
                        .font(.system(size: 60))
                        .foregroundColor(chiosco.porta.stato == .aperta ? .green : .gray)

                    Text("PORTA")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.primary)
                }
            }
            .rotationEffect(.degrees(chiosco.porta.stato == .aperta ? -15 : 0))
            .animation(.spring(response: 0.6, dampingFraction: 0.7), value: chiosco.porta.stato)

            // Status
            HStack {
                Image(systemName: chiosco.porta.stato == .aperta ? "lock.open.fill" : "lock.fill")
                    .foregroundColor(chiosco.porta.stato == .aperta ? .green : .red)

                Text(chiosco.porta.stato == .aperta ? "Aperta" : "Chiusa")
                    .font(.headline)
                    .foregroundColor(chiosco.porta.stato == .aperta ? .green : .red)
            }
            .padding()
            .frame(maxWidth: .infinity)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color(UIColor.tertiarySystemBackground))
            )
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(UIColor.secondarySystemBackground))
        )
    }
}

/// Vista stato sistema
struct StatoSistemaView: View {
    @EnvironmentObject var chiosco: Chiosco

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "gearshape.fill")
                    .foregroundColor(.blue)
                Text("Stato Sistema")
                    .font(.headline)
            }

            Divider()

            // Stato FSM
            HStack {
                Text("Stato:")
                    .foregroundColor(.secondary)
                Spacer()
                Text(chiosco.stato.rawValue)
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.blue.opacity(0.2))
                    .cornerRadius(6)
            }

            // Saldo cassetta
            HStack {
                Text("Saldo cassetta:")
                    .foregroundColor(.secondary)
                Spacer()
                Text(GettonierapModello.formattaImporto(chiosco.gettoniera.saldoCassetta))
                    .fontWeight(.semibold)
                    .foregroundColor(chiosco.gettoniera.saldoCassetta > 0 ? .orange : .gray)
            }

            // Importo richiesto
            HStack {
                Text("Importo richiesto:")
                    .foregroundColor(.secondary)
                Spacer()
                Text(GettonierapModello.formattaImporto(chiosco.gettoniera.importoRichiesto))
                    .fontWeight(.semibold)
            }

            // Stato porta
            HStack {
                Text("Porta:")
                    .foregroundColor(.secondary)
                Spacer()
                HStack(spacing: 4) {
                    Circle()
                        .fill(chiosco.porta.stato == .aperta ? Color.green : Color.gray)
                        .frame(width: 8, height: 8)
                    Text(chiosco.porta.stato.rawValue)
                        .fontWeight(.semibold)
                        .foregroundColor(chiosco.porta.stato == .aperta ? .green : .gray)
                }
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(UIColor.secondarySystemBackground))
        )
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
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)

                    Text("Simulatore iOS")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.9))
                }

                Spacer()
            }
            .padding()
        }
        .frame(height: 80)
    }
}

#Preview {
    ContentView()
        .environmentObject(Chiosco())
}
