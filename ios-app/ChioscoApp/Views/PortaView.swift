//
//  PortaView.swift
//  ChioscoApp
//
//  Vista della porta del chiosco
//  Visualizza stato porta con animazione
//

import SwiftUI

struct PortaView: View {
    @EnvironmentObject var chiosco: Chiosco

    var body: some View {
        VStack(spacing: 20) {
            Spacer()

            // Porta
            ZStack {
                // Sfondo porta
                RoundedRectangle(cornerRadius: 20)
                    .fill(chiosco.porta.stato == .aperta ? Color.green.opacity(0.3) : Color.gray.opacity(0.3))
                    .frame(height: 300)

                // Icona porta
                VStack(spacing: 12) {
                    Image(systemName: chiosco.porta.stato == .aperta ? "door.left.hand.open" : "door.left.hand.closed")
                        .font(.system(size: 80))
                        .foregroundColor(chiosco.porta.stato == .aperta ? .green : .gray)

                    Text("PORTA")
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundColor(.primary)
                }
            }
            .rotationEffect(.degrees(chiosco.porta.stato == .aperta ? -15 : 0))
            .animation(.spring(response: 0.6, dampingFraction: 0.7), value: chiosco.porta.stato)

            // Status porta
            HStack {
                Image(systemName: chiosco.porta.stato == .aperta ? "lock.open.fill" : "lock.fill")
                    .foregroundColor(chiosco.porta.stato == .aperta ? .green : .red)

                Text(chiosco.porta.stato == .aperta ? "Aperta" : "Chiusa")
                    .font(.headline)
                    .foregroundColor(chiosco.porta.stato == .aperta ? .green : .red)
            }
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color(UIColor.secondarySystemBackground))
            )

            // Pulsante "Persona passata" (Feature 002)
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
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(Color.blue)
                    .cornerRadius(12)
                }
                .transition(.scale.combined(with: .opacity))
            }

            Spacer()
        }
        .padding()
    }
}

#Preview {
    PortaView()
        .environmentObject(Chiosco())
}
