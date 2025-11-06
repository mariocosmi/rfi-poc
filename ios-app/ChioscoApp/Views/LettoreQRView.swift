//
//  LettoreQRView.swift
//  ChioscoApp
//
//  Vista per lettore QR code
//

import SwiftUI

struct LettoreQRView: View {
    @EnvironmentObject var chiosco: Chiosco
    @State private var codiceQR: String = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Titolo
            HStack {
                Image(systemName: "qrcode")
                    .foregroundColor(.green)
                Text("Lettore QR")
                    .font(.headline)
            }

            // Input codice + pulsante
            HStack(spacing: 8) {
                TextField("Inserisci codice QR (es. 42)", text: $codiceQR)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .keyboardType(.numberPad)
                    .disabled(chiosco.stato != .idle)

                Button(action: {
                    chiosco.verificaQR(codice: codiceQR)
                    codiceQR = ""
                }) {
                    Text("Scansiona")
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Color.green)
                        .cornerRadius(8)
                }
                .disabled(codiceQR.isEmpty || chiosco.stato != .idle)
                .opacity((chiosco.stato == .idle && !codiceQR.isEmpty) ? 1.0 : 0.5)
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
    LettoreQRView()
        .environmentObject(Chiosco())
        .padding()
}
