//
//  ThumbnailImg.swift
//  place-view
//
//  Domain model for thumbnail images

import Foundation

struct ThumbnailImg: Identifiable, Hashable {
    let id = UUID()
    var url: String
    var image: PlatformImage
}
