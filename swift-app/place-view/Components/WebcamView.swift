//
//  WebcamView.swift
//  place-view
//
//  Created by Jérémy Jousse on 26/11/2021.
//

import SwiftUI
import os

struct WebcamView: View {
    
    var imageUrl: String
    @State private var isFullScreenPresented = false
    
    var body: some View {
        VStack {
            ScrollViewReader { scrollView in
                ScrollView([.horizontal, .vertical]) {
                    AsyncImage(url: URL(string: imageUrl)) { image in
                        Button(action: { isFullScreenPresented = true }) {
                            image
                                .resizable()
                                .scaledToFit()
                                .frame(height: 350)
                        }
                        .buttonStyle(.plain)
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
        .fullScreenCover(isPresented: $isFullScreenPresented) {
            FullScreenWebcamView(imageUrl: imageUrl)
        }
    }
}

struct FullScreenWebcamView: View {
    private let logger = Logger(subsystem: "place-view", category: "FullScreenWebcamView")
    let imageUrl: String
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            GeometryReader { geometry in
                ScrollView([.horizontal, .vertical]) {
                    AsyncImage(url: URL(string: imageUrl)) { image in
                        image
                            .resizable()
                            .scaledToFit()
                            .frame(height: geometry.size.height)
                    } placeholder: {
                        ProgressView()
                            .tint(.white)
                            .frame(width: geometry.size.width, height: geometry.size.height)
                    }
                }
                .scrollBounceBehavior(.basedOnSize, axes: .vertical)
            }
            .ignoresSafeArea()
            
            VStack {
                HStack {
                    Spacer()
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 30))
                            .foregroundColor(.white)
                            .padding()
                    }
                }
                Spacer()
            }
        }
        .onAppear {
            setOrientation(isFullScreen: true)
        }
        .onDisappear {
            setOrientation(isFullScreen: false)
        }
    }
    
    private func setOrientation(isFullScreen: Bool) {
        #if os(iOS)
        let mask: UIInterfaceOrientationMask = isFullScreen ? .landscape : .portrait
        AppDelegate.orientationLock = mask
        if let windowScene = UIApplication.shared.connectedScenes.first(where: { $0.activationState == .foregroundActive }) as? UIWindowScene {
            let geometryPreferences = UIWindowScene.GeometryPreferences.iOS(interfaceOrientations: mask)
            windowScene.requestGeometryUpdate(geometryPreferences) { error in
                logger.error("Error changing orientation: \(error.localizedDescription, privacy: .public)")
            }
            windowScene.windows.first?.rootViewController?.setNeedsUpdateOfSupportedInterfaceOrientations()
        }
        #endif
    }
}

struct WebcamView_Previews: PreviewProvider {
    static var previews: some View {
        WebcamView(imageUrl: "https://www.trinum.com/ibox/ftpcam/small_superdevoluy_superdevoluy.jpg")
    }
}
