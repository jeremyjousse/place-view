//
//  PlaceNavigation.swift
//  place-view
//
//  Created by Jérémy Jousse on 23/11/2021.
//

import SwiftUI
import MapKit

struct PlaceNavigation: View {
    
    enum ViewMode {
        case list
        case map
    }
    
    @EnvironmentObject var placeFetcher: PlaceFetcher
    let places: [Place]
    @ObservedObject var favorites = PlaceFavorites.sharedInstance
    
    @State private var showFavoritesOnly = false
    @State private var showSettings: Bool = false
    @State private var viewMode: ViewMode = .list
    
    @State private var selectedPlace: Place?
    
    @AppStorage("mapCenterLat") private var centerLat: Double = 0.0
    @AppStorage("mapCenterLon") private var centerLon: Double = 0.0
    @AppStorage("mapSpanLat") private var spanLat: Double = 0.5
    @AppStorage("mapSpanLon") private var spanLon: Double = 0.5
    
    @State private var position: MapCameraPosition = .automatic
    
    var filteredPlaces: [Place] {
        places.filter { place in
            (!showFavoritesOnly || favorites.contains(place))
        }
    }
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                Toggle(isOn: $showFavoritesOnly) {
                    Text("Favorites only")
                }
                .padding(.horizontal)
                .padding(.vertical, 8)
                
                Divider()
                
                ZStack {
                    if viewMode == .list {
                        List(filteredPlaces) { place in
                            NavigationLink(value: place) {
                                PlaceRow(place: place)
                            }
                        }
                        .refreshable {
                            await placeFetcher.clearCacheAndRefresh()
                        }
                    } else {
                        PlacesMapView(places: filteredPlaces, position: $position, selectedPlace: $selectedPlace)
                            .onMapCameraChange(frequency: .onEnd) { context in
                                saveRegion(context.region)
                            }
                    }
                }
            }
            .navigationTitle("Places")
            .navigationBarTitleDisplayMode(.inline)
            .navigationDestination(for: Place.self) { place in
                PlaceView(place: place)
            }
            .navigationDestination(item: $selectedPlace) { place in
                PlaceView(place: place)
            }
            .safeAreaInset(edge: .bottom) {
                VStack(spacing: 0) {
                    HStack {
                        Spacer()
                        Picker("View Mode", selection: $viewMode) {
                            Label("List", systemImage: "list.bullet").tag(ViewMode.list)
                            Label("Map", systemImage: "map").tag(ViewMode.map)
                        }
                        .pickerStyle(.segmented)
                        .frame(width: 160)
                        Spacer()
                    }
                    .frame(height: 49)
                }
            }
            .onAppear {
                restorePosition()
            }
        }
    }
    
    // MARK: - Persistence Logic
    
    private func saveRegion(_ region: MKCoordinateRegion) {
        centerLat = region.center.latitude
        centerLon = region.center.longitude
        spanLat = region.span.latitudeDelta
        spanLon = region.span.longitudeDelta
    }
    
    private func restorePosition() {
        if centerLat != 0 {
            let region = MKCoordinateRegion(
                center: CLLocationCoordinate2D(latitude: centerLat, longitude: centerLon),
                span: MKCoordinateSpan(latitudeDelta: spanLat, longitudeDelta: spanLon)
            )
            position = .region(region)
        } else {
            position = .automatic
        }
    }
}

struct PlacesMapView: View {
    let places: [Place]
    @Binding var position: MapCameraPosition
    @Binding var selectedPlace: Place?
    
    var body: some View {
        Map(position: $position, selection: $selectedPlace) {
            ForEach(places) { place in
                Annotation(place.name, coordinate: place.locationCoordinate) {
                    PlaceMapAnnotationView(place: place)
                }
                .tag(place)
            }
        }
        .mapStyle(.standard(elevation: .realistic))
        .onChange(of: places) { _, _ in
            if places.count == 1, let first = places.first {
                position = .region(MKCoordinateRegion(
                    center: first.locationCoordinate,
                    span: MKCoordinateSpan(latitudeDelta: 0.1, longitudeDelta: 0.1)
                ))
            }
        }
    }
}

struct PlaceMapAnnotationView: View {
    let place: Place
    
    var body: some View {
        VStack(spacing: 0) {
            Image(systemName: "mappin.circle.fill")
                .font(.title)
                .foregroundColor(.red)
                .background(Color.white)
                .clipShape(Circle())
            
            Text(place.name)
                .font(.caption2)
                .bold()
                .padding(5)
                .background(Color.white.opacity(0.9))
                .cornerRadius(8)
                .fixedSize()
        }
    }
}

struct PlaceNavigation_Previews: PreviewProvider {
    static var previews: some View {
        PlaceNavigation(places: []).environmentObject(PlaceFetcher())
    }
}
