//
//  WebcamThumbnail.swift
//  place-view
//
//  Created by Jérémy Jousse on 03/12/2021.
//

import SwiftUI
import Kingfisher

struct WebcamThumbnail: View {
    
    var imageUrl: String
    
    var body: some View {
        
        KFImage(URL(
            string:imageUrl))
            .placeholder {
                Image(systemName: "arrow.2.circlepath.circle")
                    .font(.largeTitle)
                    .opacity(0.3)
            }
            .diskCacheExpiration(.seconds(3600))
            .onSuccess { r in
                // print("success: \(r)")
            }
            .onFailure { e in
                print("failure: \(e)")
            }                .resizable()
            .aspectRatio(contentMode: .fill)
            .frame(width: 100, height: 100, alignment: .center)
            .clipped()
    }
}

struct WebcamThumbnail_Previews: PreviewProvider {
    static var previews: some View {
        WebcamThumbnail(imageUrl:  "https://www.trinum.com/ibox/ftpcam/small_superdevoluy_superdevoluy.jpg")
    }
}
