//
//  PagamentoCartaView.swift
//  ChioscoApp
//
//  Vista per pagamento con carta di credito
//

import SwiftUI

struct PagamentoCartaView: View {
    @EnvironmentObject var chiosco: Chiosco
    @State private var numeroCarta: String = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Titolo
            HStack {
                Image(systemName: "creditcard.fill")
                    .foregroundColor(.blue)
                Text("Pagamento Carta di Credito")
                    .font(.headline)
            }

            if chiosco.stato == .pagamentoCarta {
                // Mostra area inserimento carta
                VStack(spacing: 12) {
                    Text("Avvicina la carta al lettore...")
                        .font(.subheadline)
                        .foregroundColor(.secondary)

                    TextField("Numero carta (es. 4111111111111111)", text: $numeroCarta)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .keyboardType(.numberPad)

                    Button(action: {
                        chiosco.elaboraPagamentoCarta(numeroCarta: numeroCarta)
                        numeroCarta = ""
                    }) {
                        Text("Conferma Pagamento (1,20€)")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .cornerRadius(12)
                    }
                    .disabled(numeroCarta.isEmpty)
                }
            } else {
                // Pulsante per iniziare pagamento
                Button(action: {
                    chiosco.iniziaPagamentoCarta()
                }) {
                    Text("Paga con Carta (1,20€)")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .cornerRadius(12)
                }
                .disabled(chiosco.stato != .idle)
                .opacity(chiosco.stato == .idle ? 1.0 : 0.5)
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(UIColor.secondarySystemBackground))
        )
    }
}

#Preview {
    PagamentoCartaView()
        .environmentObject(Chiosco())
        .padding()
}
