//
//  LettoreCarteView.swift
//  ChioscoApp
//
//  Vista per lettore carte autorizzate
//

import SwiftUI

struct LettoreCarteView: View {
    @EnvironmentObject var chiosco: Chiosco
    @State private var codiceCarta: String = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Titolo
            HStack {
                Image(systemName: "lock.shield.fill")
                    .foregroundColor(.purple)
                Text("Lettore Carte Autorizzate")
                    .font(.headline)
            }

            // Input codice + pulsante
            HStack(spacing: 8) {
                TextField("Codice carta (es. 42)", text: $codiceCarta)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .keyboardType(.numberPad)
                    .disabled(chiosco.stato != .idle)

                Button(action: {
                    chiosco.verificaCarta(codice: codiceCarta)
                    codiceCarta = ""
                }) {
                    Text("Verifica")
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Color.purple)
                        .cornerRadius(8)
                }
                .disabled(codiceCarta.isEmpty || chiosco.stato != .idle)
                .opacity((chiosco.stato == .idle && !codiceCarta.isEmpty) ? 1.0 : 0.5)
            }

            Text("Codici validi: 1-99")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(UIColor.secondarySystemBackground))
        )
    }
}

#Preview {
    LettoreCarteView()
        .environmentObject(Chiosco())
        .padding()
}
