//
//  GettonierapView.swift
//  ChioscoApp
//
//  Vista della gettoniera
//  Griglia di pulsanti per inserimento monete
//

import SwiftUI

struct GettonierapView: View {
    @EnvironmentObject var chiosco: Chiosco

    // Tagli monete (in euro)
    let tagli: [Double] = [1.00, 0.50, 0.20, 0.10, 0.05, 0.02, 0.01]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Titolo
            HStack {
                Image(systemName: "eurosign.circle.fill")
                    .foregroundColor(.orange)
                Text("Gettoniera")
                    .font(.headline)
            }

            // Griglia monete (3 colonne)
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 12) {
                ForEach(tagli, id: \.self) { taglio in
                    Button(action: {
                        chiosco.inserisciMoneta(taglio)
                    }) {
                        Text(formattaTaglio(taglio))
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(Color.orange)
                            .cornerRadius(12)
                    }
                    .disabled(!isInputAbilitato)
                    .opacity(isInputAbilitato ? 1.0 : 0.5)
                }
            }

            // Info saldo cassetta
            if chiosco.gettoniera.saldoCassetta > 0 {
                HStack {
                    Image(systemName: "banknote.fill")
                        .foregroundColor(.green)
                    Text("Saldo cassetta: \(GettonierapModello.formattaImporto(chiosco.gettoniera.saldoCassetta))")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding(.top, 4)
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(UIColor.secondarySystemBackground))
        )
    }

    // Verifica se input è abilitato (IDLE o PAGAMENTO_MONETE)
    private var isInputAbilitato: Bool {
        return chiosco.stato == .idle || chiosco.stato == .pagamentoMonete
    }

    // Formatta taglio moneta
    private func formattaTaglio(_ taglio: Double) -> String {
        return String(format: "%.2f", taglio).replacingOccurrences(of: ".", with: ",") + "€"
    }
}

#Preview {
    GettonierapView()
        .environmentObject(Chiosco())
        .padding()
}
