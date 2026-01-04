//
//  PlaceDetailViewModel.swift
//  place-view
//
//  ViewModel for Place Detail - follows MVVM + Clean Architecture

import Foundation
import SwiftUI

@MainActor
final class PlaceDetailViewModel: ObservableObject {
    
    @Published var thumbnails: [ThumbnailImg] = []
    @Published var selectedImage: Int = 0
    
    private let webcams: [Webcam]
    private let loadWebcamImagesUseCase: LoadWebcamImagesUseCase
    
    init(webcams: [Webcam], loadWebcamImagesUseCase: LoadWebcamImagesUseCase) {
        self.webcams = webcams
        self.loadWebcamImagesUseCase = loadWebcamImagesUseCase
    }
    
    func loadThumbnails() async {
        let loadedThumbnails = await loadWebcamImagesUseCase.loadThumbnails(for: webcams)
        self.thumbnails = loadedThumbnails
    }
}
