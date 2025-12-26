//
//  WebcamView.swift
//  place-view
//
//  Created by Jérémy Jousse on 26/11/2021.
//

import SwiftUI
import UIKit

struct WebcamView: View {
    
    var imageUrl: String
    @State private var isFullScreenPresented = false
    
    var body: some View {
        VStack {
            ScrollViewReader { scrollView in
                ScrollView([.horizontal, .vertical]) {
                    AsyncImage(url: URL(string: imageUrl)) { image in
                        // Un bouton transparent permet de détecter le clic sur l'image
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
            }
            .ignoresSafeArea()
            
            // Bouton pour fermer le plein écran
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
        if isFullScreen {
            AppDelegate.orientationLock = .allButUpsideDown
        } else {
            AppDelegate.orientationLock = .portrait
        }
        
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene {
            if !isFullScreen {
                windowScene.requestGeometryUpdate(.iOS(interfaceOrientations: .portrait))
            } else {
                UIViewController.attemptRotationToDeviceOrientation()
            }
        }
        #endif
    }
}

struct WebcamView_Previews: PreviewProvider {
    static var previews: some View {
        WebcamView(imageUrl: "https://www.trinum.com/ibox/ftpcam/small_superdevoluy_superdevoluy.jpg")
    }
}
