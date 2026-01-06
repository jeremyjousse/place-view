//
//  ContentView.swift
//  place-view
//
//  Created by Jérémy Jousse on 20/11/2021.
//

import SwiftUI

struct ContentView: View {

    @StateObject var placeListViewModel = DependencyContainer.shared.makePlaceListViewModel()
    
    var body: some View {
//        if placeListViewModel.isLoading {
//            LoadingView()
//        }else if placeListViewModel.errorMessage != nil  {
//            ErrorView(placeListViewModel: placeListViewModel)
//        }else {
            PlaceNavigation(places: placeListViewModel.places).environmentObject(placeListViewModel)
//        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
