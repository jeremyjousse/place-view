//
//  WebcamThumbnail.swift
//  place-view
//
//  Created by Jérémy Jousse on 03/12/2021.
//

import SwiftUI

struct WebcamThumbnail: View {
    
    var imageUrl: String
    var body: some View {
        AsyncImage(url: URL(string: imageUrl)) { sourceImage in
            sourceImage
                .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: 100, height: 100, alignment: .center)
                        
                        .clipped()
        } placeholder: {
            ProgressView()
        }
    }
}

struct WebcamThumbnail_Previews: PreviewProvider {
    static var previews: some View {
        WebcamThumbnail(imageUrl:  "https://www.trinum.com/ibox/ftpcam/small_superdevoluy_superdevoluy.jpg")
    }
}
