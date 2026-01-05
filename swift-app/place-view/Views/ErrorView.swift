//
//  ErrorView.swift
//  place-view
//
//  Created by Jérémy Jousse on 13/01/2022.
//

import SwiftUI

struct ErrorView: View {
    @ObservedObject var placeListViewModel: PlaceListViewModel
    
    var body: some View {
        Text("Error \(placeListViewModel.errorMessage ?? "") !")
    }
}

struct ErrorView_Previews: PreviewProvider {
    static var previews: some View {
        ErrorView(placeListViewModel: PlaceListViewModel.errorState())
    }
}
