//
//  ContentView.swift
//  ChioscoApp
//
//  Vista principale RESPONSIVE ottimizzata per tutte le risoluzioni iPhone
//  Layout con TabView - Supporta iPhone SE (667pt) fino a Pro Max (932pt)
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var chiosco: Chiosco
    @State private var selectedTab = 0

    var body: some View {
        GeometryReader { geometry in
            VStack(spacing: 0) {
                // Header fisso (compatto)
                HeaderView()

                // Display sempre visibile (adattivo)
                DisplayView()
                    .padding(.horizontal, 12)
                    .padding(.top, 8)

                // StatusBar compatto (icone porta + cassetta)
                StatusBarView()
                    .padding(.top, 6)

                // Pulsante Persona Passata (solo se porta aperta)
                if chiosco.porta.stato == .aperta {
                    Button(action: {
                        chiosco.onPassaggioPersona()
                    }) {
                        HStack(spacing: 8) {
                            Image(systemName: "figure.walk")
                            Text("Persona passata")
                                .fontWeight(.semibold)
                        }
                        .font(.subheadline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(Color.blue)
                        .cornerRadius(10)
                    }
                    .padding(.horizontal, 12)
                    .padding(.top, 8)
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
                    InfoTabView(screenHeight: geometry.size.height)
                        .tabItem {
                            Label("Info", systemImage: "info.circle.fill")
                        }
                        .tag(2)
                }
            }
            .background(Color(UIColor.systemGroupedBackground))
        }
    }
}

// MARK: - Tab Views

/// Tab Pagamento (Monete + Carta)
struct PagamentoTabView: View {
    @EnvironmentObject var chiosco: Chiosco

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                // Gettoniera
                GettonierapView()

                // Pagamento Carta
                PagamentoCartaView()
            }
            .padding(12)
        }
    }
}

/// Tab Accesso (QR + Carte Autorizzate)
struct AccessoTabView: View {
    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                // Lettore QR
                LettoreQRView()

                // Lettore Carte
                LettoreCarteView()

                // Info codici autorizzati
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Image(systemName: "info.circle.fill")
                            .foregroundColor(.blue)
                        Text("Codici Autorizzati")
                            .font(.subheadline)
                            .fontWeight(.semibold)
                    }

                    Text("I codici autorizzati sono numeri da 1 a 99")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    HStack(spacing: 12) {
                        Text("Validi: 1, 42, 99 ✅")
                            .font(.caption2)
                            .foregroundColor(.green)

                        Text("Non validi: 0, 100, abc ❌")
                            .font(.caption2)
                            .foregroundColor(.red)
                    }
                }
                .padding(12)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color(UIColor.secondarySystemBackground))
                )
            }
            .padding(12)
        }
    }
}

/// Tab Info (Stato dettagliato + Porta) - RESPONSIVE
struct InfoTabView: View {
    @EnvironmentObject var chiosco: Chiosco
    let screenHeight: CGFloat

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                // Porta (dimensione adattiva basata su schermo)
                PortaDetailView(maxHeight: portaHeight)

                // Stato Sistema
                StatoSistemaView()

                // Info Versione
                VStack(spacing: 6) {
                    Text("ChioscoApp iOS")
                        .font(.subheadline)
                        .fontWeight(.semibold)

                    Text("Versione 1.0")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    Text("Swift + SwiftUI • Responsive")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
                .padding(12)
                .frame(maxWidth: .infinity)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color(UIColor.secondarySystemBackground))
                )
            }
            .padding(12)
        }
    }

    /// Calcola altezza porta in base allo schermo (25-30% dello spazio disponibile)
    private var portaHeight: CGFloat {
        // Sottrai header (70) + display (~80) + statusBar (35) + tab bar (50) + padding
        let availableHeight = screenHeight - 235
        let desiredHeight = availableHeight * 0.35 // 35% dello spazio disponibile
        // Clamp tra 140pt (min) e 200pt (max)
        return min(max(desiredHeight, 140), 200)
    }
}

// MARK: - Componenti Info Tab

/// Vista porta dettagliata (solo in tab Info) - RESPONSIVE
struct PortaDetailView: View {
    @EnvironmentObject var chiosco: Chiosco
    let maxHeight: CGFloat

    var body: some View {
        VStack(spacing: 12) {
            // Icona porta grande (responsive)
            ZStack {
                RoundedRectangle(cornerRadius: 16)
                    .fill(chiosco.porta.stato == .aperta ? Color.green.opacity(0.3) : Color.gray.opacity(0.3))
                    .frame(height: maxHeight)

                VStack(spacing: 8) {
                    Image(systemName: chiosco.porta.stato == .aperta ? "door.left.hand.open" : "door.left.hand.closed")
                        .font(.system(size: iconSize))
                        .foregroundColor(chiosco.porta.stato == .aperta ? .green : .gray)

                    Text("PORTA")
                        .font(titleFont)
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
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(chiosco.porta.stato == .aperta ? .green : .red)
            }
            .padding(10)
            .frame(maxWidth: .infinity)
            .background(
                RoundedRectangle(cornerRadius: 10)
                    .fill(Color(UIColor.tertiarySystemBackground))
            )
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(UIColor.secondarySystemBackground))
        )
    }

    // Dimensione icona proporzionale all'altezza porta
    private var iconSize: CGFloat {
        maxHeight * 0.3 // 30% dell'altezza porta
    }

    // Font titolo adattivo
    private var titleFont: Font {
        maxHeight > 180 ? .title2 : .headline
    }
}

/// Vista stato sistema - COMPATTA
struct StatoSistemaView: View {
    @EnvironmentObject var chiosco: Chiosco

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Image(systemName: "gearshape.fill")
                    .foregroundColor(.blue)
                    .font(.subheadline)
                Text("Stato Sistema")
                    .font(.subheadline)
                    .fontWeight(.semibold)
            }

            Divider()

            // Stato FSM
            InfoRow(
                label: "Stato:",
                value: chiosco.stato.rawValue,
                valueColor: .blue,
                isTag: true
            )

            // Saldo cassetta
            InfoRow(
                label: "Saldo cassetta:",
                value: GettonierapModello.formattaImporto(chiosco.gettoniera.saldoCassetta),
                valueColor: chiosco.gettoniera.saldoCassetta > 0 ? .orange : .secondary
            )

            // Importo richiesto
            InfoRow(
                label: "Importo richiesto:",
                value: GettonierapModello.formattaImporto(chiosco.gettoniera.importoRichiesto)
            )

            // Stato porta
            HStack {
                Text("Porta:")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Spacer()
                HStack(spacing: 4) {
                    Circle()
                        .fill(chiosco.porta.stato == .aperta ? Color.green : Color.gray)
                        .frame(width: 6, height: 6)
                    Text(chiosco.porta.stato.rawValue)
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(chiosco.porta.stato == .aperta ? .green : .gray)
                }
            }
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(UIColor.secondarySystemBackground))
        )
    }
}

/// Componente riutilizzabile per riga info
struct InfoRow: View {
    let label: String
    let value: String
    var valueColor: Color = .primary
    var isTag: Bool = false

    var body: some View {
        HStack {
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
            Spacer()
            if isTag {
                Text(value)
                    .font(.caption2)
                    .fontWeight(.medium)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 3)
                    .background(valueColor.opacity(0.2))
                    .cornerRadius(5)
            } else {
                Text(value)
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(valueColor)
            }
        }
    }
}

// MARK: - Header

struct HeaderView: View {
    var body: some View {
        ZStack {
            Color.blue
                .ignoresSafeArea(edges: .top)

            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("🚪 Chiosco Ingresso")
                        .font(.title3)
                        .fontWeight(.bold)
                        .foregroundColor(.white)

                    Text("Simulatore iOS")
                        .font(.caption2)
                        .foregroundColor(.white.opacity(0.9))
                }

                Spacer()
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 8)
        }
        .frame(height: 70)
    }
}

#Preview {
    ContentView()
        .environmentObject(Chiosco())
}
