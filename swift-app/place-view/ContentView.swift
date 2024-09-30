//
//  ContentView.swift
//  place-view
//
//  Created by Jérémy Jousse on 20/11/2021.
//

import SwiftUI

struct ContentView: View {

    @StateObject var placeFetcher = PlaceFetcher()
    
    var body: some View {
//        if placeFetcher.isLoading {
//            LoadingView()
//        }else if placeFetcher.errorMessage != nil  {
//            ErrorView(placeFetcher: placeFetcher)
//        }else {
            PlaceNavigation(places: placeFetcher.places).environmentObject(placeFetcher)
//        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
