//
//  WebcamView.swift
//  place-view
//
//  Created by Jérémy Jousse on 26/11/2021.
//

import SwiftUI

struct WebcamView: View {
    
    var imageUrl: String
    
    var body: some View {
        VStack {
            ScrollViewReader { scrollView in
                ScrollView([.horizontal, .vertical]) {
                    AsyncImage(url: URL(string: imageUrl)) { image in
                        image
                            .resizable()
                            .scaledToFit()
                            .frame(height: 350)
                    } placeholder: {
                        ProgressView()
                            .frame(height: 350)
                    }
                }
                .frame(height: 350)
                .scrollBounceBehavior(.basedOnSize)
                .cornerRadius(10)
            }
        }
    }
}

struct WebcamView_Previews: PreviewProvider {
    static var previews: some View {
        WebcamView(imageUrl: "https://www.trinum.com/ibox/ftpcam/small_superdevoluy_superdevoluy.jpg")
    }
}
