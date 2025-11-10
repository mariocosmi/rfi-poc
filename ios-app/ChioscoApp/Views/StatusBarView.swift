//
//  StatusBarView.swift
//  ChioscoApp
//
//  Barra di stato compatta con icone colorate
//  Mostra sempre stato porta e cassetta senza occupare troppo spazio
//

import SwiftUI

struct StatusBarView: View {
    @EnvironmentObject var chiosco: Chiosco

    var body: some View {
        HStack(spacing: 20) {
            // Stato Porta
            HStack(spacing: 6) {
                Image(systemName: chiosco.porta.stato == .aperta ? "door.left.hand.open" : "door.left.hand.closed")
                    .foregroundColor(chiosco.porta.stato == .aperta ? .green : .gray)
                    .font(.title3)

                Text(chiosco.porta.stato == .aperta ? "Aperta" : "Chiusa")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(chiosco.porta.stato == .aperta ? .green : .gray)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(
                RoundedRectangle(cornerRadius: 8)
                    .fill(chiosco.porta.stato == .aperta ? Color.green.opacity(0.1) : Color.gray.opacity(0.1))
            )

            Spacer()

            // Stato Cassetta (Saldo)
            HStack(spacing: 6) {
                Image(systemName: "banknote.fill")
                    .foregroundColor(chiosco.gettoniera.saldoCassetta > 0 ? .orange : .gray)
                    .font(.title3)

                Text(GettonierapModello.formattaImporto(chiosco.gettoniera.saldoCassetta))
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(chiosco.gettoniera.saldoCassetta > 0 ? .orange : .gray)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(
                RoundedRectangle(cornerRadius: 8)
                    .fill(chiosco.gettoniera.saldoCassetta > 0 ? Color.orange.opacity(0.1) : Color.gray.opacity(0.1))
            )
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
        .background(Color(UIColor.secondarySystemBackground))
    }
}

#Preview {
    StatusBarView()
        .environmentObject(Chiosco())
}
