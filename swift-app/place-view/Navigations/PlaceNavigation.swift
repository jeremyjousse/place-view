//
//  PlaceNavigation.swift
//  place-view
//
//  Created by Jérémy Jousse on 23/11/2021.
//

import SwiftUI

struct PlaceNavigation: View {
    
    @EnvironmentObject var placeFetcher: PlaceFetcher
    
    let places: [Place]
    
    @ObservedObject var favorites = PlaceFavorites.sharedInstance
    
    @State private var showFavoritesOnly = false
    @State private var showSettings: Bool = false
    
    var filteredPlaces: [Place] {
        places.filter { place in
            (!showFavoritesOnly || favorites.contains(place))
        }
    }
    
    var body: some View {
        
        NavigationView {
            VStack {
                List {
                    Toggle(isOn: $showFavoritesOnly) {
                        Text("Favorites only")
                    }
                    
                    ForEach(filteredPlaces) { place in
                        NavigationLink {
                            PlaceView(place: place)
                        } label: {
                            PlaceRow(place: place)
                        }
                    }
                }
            }.navigationTitle("Places")
//                .refreshable {
//                    print("Do your refresh work here")
//                    //placeFetcher.fetchAllPlaces()
//                }
                .navigationBarItems(trailing:
                                        Button(action: {
                    self.showSettings = true
                }, label: {
                    Image(systemName: "gear").font(.body)
                        .foregroundColor(.black)
                }) )
                .sheet(isPresented: $showSettings) {
                    SettingsSheet()
                }
        }
    }
}

struct PlaceNavigation_Previews: PreviewProvider {
    static var previews: some View {
        ForEach(["iPhone SE (2nd generation)", "iPhone XS Max"], id: \.self) { deviceName in
            PlaceNavigation(places: []).environmentObject(PlaceFetcher())
                .previewDevice(PreviewDevice(rawValue: deviceName))
                .previewDisplayName(deviceName)
        }
    }
}
