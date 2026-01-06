//
//  SettingsSheet.swift
//  place-view
//
//  Created by Jérémy Jousse on 16/01/2022.
//

import SwiftUI

// https://dev.to/jeehut/multi-selector-in-swiftui-5heg

struct SettingsSheet: View {
    
    @EnvironmentObject var placeListViewModel: PlaceListViewModel
    
    var body: some View {
        VStack {
            Text("Settings").font(.title).padding([.top, .bottom])
            ForEach(placeListViewModel.states, id: \.self) { state in
                Text(state)
            }
            Spacer()
        }
    }
}

struct SettingsSheet_Previews: PreviewProvider {
    static var previews: some View {
        SettingsSheet().environmentObject(PlaceListViewModel.successState())
    }
}
