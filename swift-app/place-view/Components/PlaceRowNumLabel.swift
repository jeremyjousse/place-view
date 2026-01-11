//
//  PlaceRowNumLabel.swift
//  place-view
//
//  Created by Jérémy Jousse on 10/01/2026.
//


import SwiftUI

struct PlaceRowNumLabel: View {
    let count: Int
    
    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            Color.clear
            if count > 1 {
                Text("\(count)")
                    .font(.caption2)
                    .fontWeight(.bold)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .foregroundColor(.white)
                    .background(Color.black.opacity(0.6))
                    .clipShape(Capsule())
                    .padding(4)
            }
        }
    }
}
