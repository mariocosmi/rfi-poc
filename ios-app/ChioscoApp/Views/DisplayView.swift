//
//  DisplayView.swift
//  ChioscoApp
//
//  Vista del display del chiosco
//  Mostra messaggi, importi, countdown
//

import SwiftUI

struct DisplayView: View {
    @EnvironmentObject var chiosco: Chiosco

    var body: some View {
        VStack(spacing: 12) {
            // Messaggio principale
            Text(chiosco.display.messaggio)
                .font(.title3)
                .fontWeight(.semibold)
                .multilineTextAlignment(.center)
                .foregroundColor(colorForTipo(chiosco.display.tipoMessaggio))
                .padding()

            // Importo rimanente
            if let importo = chiosco.display.importoRimanente {
                Text("Rimanente: \(formattaImporto(importo))")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
            }

            // Countdown timeout
            if let countdown = chiosco.display.countdownSecondi {
                HStack {
                    Image(systemName: "clock.fill")
                    Text("Timeout: \(countdown)s")
                }
                .font(.subheadline)
                .foregroundColor(.orange)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 24)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(backgroundForTipo(chiosco.display.tipoMessaggio))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(colorForTipo(chiosco.display.tipoMessaggio), lineWidth: 2)
        )
    }

    // Helper per colore testo in base al tipo
    private func colorForTipo(_ tipo: TipoMessaggio) -> Color {
        switch tipo {
        case .info:
            return .primary
        case .successo:
            return .green
        case .errore:
            return .red
        case .warning:
            return .orange
        }
    }

    // Helper per colore sfondo in base al tipo
    private func backgroundForTipo(_ tipo: TipoMessaggio) -> Color {
        switch tipo {
        case .info:
            return Color(UIColor.secondarySystemBackground)
        case .successo:
            return Color.green.opacity(0.1)
        case .errore:
            return Color.red.opacity(0.1)
        case .warning:
            return Color.orange.opacity(0.1)
        }
    }

    // Formatta importo
    private func formattaImporto(_ importo: Double) -> String {
        return String(format: "%.2f", importo).replacingOccurrences(of: ".", with: ",") + " €"
    }
}

#Preview {
    DisplayView()
        .environmentObject(Chiosco())
        .padding()
}
