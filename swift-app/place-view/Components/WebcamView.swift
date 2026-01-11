//
//  WebcamView.swift
//  place-view
//

import SwiftUI
import Kingfisher

struct WebcamView: View {
    var imageUrl: String
    @State private var isFullScreenPresented = false
    @State private var isCentered = false
    
    // Détection du mode large (iPad ou Mac)
    private var useWideRatio: Bool {
        #if os(macOS)
        return true
        #else
        return UIDevice.current.userInterfaceIdiom == .pad || UIDevice.current.userInterfaceIdiom == .mac
        #endif
    }
    
    var body: some View {
        ZStack {
            if !isCentered {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    #if os(macOS)
                    .background(Color(NSColor.windowBackgroundColor))
                    #else
                    .background(Color(.systemGray6))
                    #endif
            }
            
            GeometryReader { geometry in
                ScrollViewReader { proxy in
                    ScrollView(.horizontal, showsIndicators: false) {
                        Button(action: { isFullScreenPresented = true }) {
                            KFImage(URL(string: imageUrl))
                                .forceRefresh() // Force le téléchargement à chaque fois
                                .onSuccess { _ in
                                    proxy.scrollTo("largeImage", anchor: .center)
                                    DispatchQueue.main.async {
                                        isCentered = true
                                    }
                                }
                                .fade(duration: 0)
                                .resizable()
                                .scaledToFill()
                                // On s'assure que l'image prend toute la hauteur définie par l'aspect ratio
                                .frame(height: geometry.size.height)
                                .id("largeImage")
                                .opacity(isCentered ? 1 : 0)
                        }
                        .buttonStyle(.plain)
                    }
                    .scrollDisabled(!isCentered)
                }
            }
        }
        // Ratio 16/9 pour desktop/ipad, 1/1 pour mobile
        .aspectRatio(useWideRatio ? 16/9 : 1, contentMode: .fit)
        .cornerRadius(10)
        .onChange(of: imageUrl) { _ in
            isCentered = false
        }
#if os(iOS) || targetEnvironment(macCatalyst)
.fullScreenCover(isPresented: $isFullScreenPresented) {
    FullScreenWebcamView(imageUrl: imageUrl)
}
#else
.sheet(isPresented: $isFullScreenPresented) {
    FullScreenWebcamView(imageUrl: imageUrl)
        .frame(minWidth: 600, minHeight: 400) // Les sheets macOS ont besoin d'une taille
}
#endif
    }
}

struct FullScreenWebcamView: View {
    let imageUrl: String
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            KFImage(URL(string: imageUrl))
                .forceRefresh()
                .placeholder {
                    ProgressView().tint(.white)
                }
                .resizable()
                .scaledToFit()
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
    }
}

