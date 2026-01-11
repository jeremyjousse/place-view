//
//  PlaceGrid.swift
//  place-view
//

import SwiftUI

struct PlaceGrid: View {
    let places: [Place]
    
    var body: some View {
        GeometryReader { geometry in
            ScrollView {
                LazyVGrid(columns: columns(for: geometry.size.width), spacing: 20) {
                    ForEach(places) { place in
                        NavigationLink(value: place) {
                            PlaceGridItem(place: place)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding()
            }
        }
    }
    
    /// Calculates column count based on available width to mimic web breakpoints
    private func columns(for width: CGFloat) -> [GridItem] {
        let count: Int
        
        if width < 500 {
            // Mobile / Narrow Sidebar: 1 item
            count = 1
        } else if width < 800 {
            // Large Phone / Small Tablet: 2 items
            count = 2
        } else if width < 1100 {
            // iPad / Tablet: 3 items
            count = 3
        } else if width < 1400 {
            // Desktop / Wide Screen: 4 items
            count = 4
        } else {
            // Large Desktop: 5 items
            count = 5
        }
        
        return Array(repeating: GridItem(.flexible(), spacing: 20), count: count)
    }
}
