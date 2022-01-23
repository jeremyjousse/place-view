//
//  PlaceViewVM.swift
//  place-view
//
//  Created by Jérémy Jousse on 19/01/2022.
//

import Foundation
import SwiftUI

final class PlaceViewModel: ObservableObject {
    
    @Published var thumbnails: [ThumbnailImg] = []
    @Published var selectedImage : Int = 0

    var webcams: [Webcam]
    
    init(webcams: [Webcam]) {
        self.webcams = webcams
    }
    
    
    func loadParallel() async {
        return await withTaskGroup(of: (String, UIImage).self) { group in
            for webcam in webcams {
                print(webcam.thumbnailImage)
                if let url = URL(string: webcam.thumbnailImage) {
                    group.addTask { await (url.absoluteString, self.loadImage(url: url)) }
                }
            }
            for await result in group {
                DispatchQueue.main.async {
                    self.thumbnails.append(ThumbnailImg(url: result.0, image: result.1))
                }
            }
        }
    }
    
    private func loadImage(url: URL) async -> UIImage {
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            if let img = UIImage(data: data) { return img }
        }
        catch { print(error) }
        return UIImage()
    }
}


struct ThumbnailImg: Identifiable, Hashable {
    let id = UUID()
    var url: String
    var image: UIImage
}
