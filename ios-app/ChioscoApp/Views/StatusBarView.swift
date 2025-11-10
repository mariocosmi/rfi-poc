//
//  StatusBarView.swift
//  ChioscoApp
//
//  Barra di stato compatta RESPONSIVE con icone colorate
//  Mostra sempre stato porta e cassetta - Ottimizzato per tutte le risoluzioni
//

import SwiftUI

struct StatusBarView: View {
    @EnvironmentObject var chiosco: Chiosco

    var body: some View {
        HStack(spacing: 12) {
            // Stato Porta
            StatusBadge(
                icon: chiosco.porta.stato == .aperta ? "door.left.hand.open" : "door.left.hand.closed",
                text: chiosco.porta.stato == .aperta ? "Aperta" : "Chiusa",
                color: chiosco.porta.stato == .aperta ? .green : .gray,
                isActive: chiosco.porta.stato == .aperta
            )

            Spacer()

            // Stato Cassetta (Saldo)
            StatusBadge(
                icon: "banknote.fill",
                text: GettonierapModello.formattaImporto(chiosco.gettoniera.saldoCassetta),
                color: chiosco.gettoniera.saldoCassetta > 0 ? .orange : .gray,
                isActive: chiosco.gettoniera.saldoCassetta > 0
            )
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(Color(UIColor.secondarySystemBackground))
    }
}

/// Badge di stato riutilizzabile
struct StatusBadge: View {
    let icon: String
    let text: String
    let color: Color
    let isActive: Bool

    var body: some View {
        HStack(spacing: 5) {
            Image(systemName: icon)
                .foregroundColor(color)
                .font(.body)

            Text(text)
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundColor(color)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 5)
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(color.opacity(isActive ? 0.15 : 0.08))
        )
    }
}

#Preview {
    StatusBarView()
        .environmentObject(Chiosco())
}
