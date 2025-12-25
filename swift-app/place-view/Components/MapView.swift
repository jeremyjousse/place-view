import SwiftUI
import MapKit

struct MapView: UIViewRepresentable {
    var coordinates: CLLocationCoordinate2D
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    func makeUIView(context: Context) -> MKMapView {
        let mapView = MKMapView(frame: .zero)
        return mapView
    }
    
    func updateUIView(_ view: MKMapView, context: Context) {
        // Only update if coordinates have changed
        if context.coordinator.lastCoordinates == nil || 
           !context.coordinator.coordinatesEqual(coordinates, context.coordinator.lastCoordinates!) {
            
            // Remove existing annotations
            view.removeAnnotations(view.annotations)
            
            // Add new annotation
            let annotation = MKPointAnnotation()
            annotation.coordinate = coordinates
            view.addAnnotation(annotation)
            
            // Set region without animation to prevent blinking
            let span = MKCoordinateSpan(latitudeDelta: 0.3, longitudeDelta: 0.3)
            let region = MKCoordinateRegion(center: coordinates, span: span)
            view.setRegion(region, animated: false)
            
            // Update last coordinates
            context.coordinator.lastCoordinates = coordinates
        }
    }
    
    class Coordinator: NSObject {
        var parent: MapView
        var lastCoordinates: CLLocationCoordinate2D?
        
        init(_ parent: MapView) {
            self.parent = parent
        }
        
        func coordinatesEqual(_ coord1: CLLocationCoordinate2D, _ coord2: CLLocationCoordinate2D) -> Bool {
            return coord1.latitude == coord2.latitude && coord1.longitude == coord2.longitude
        }
    }
}


struct AnnotationItem: Identifiable {
    var coordinate: CLLocationCoordinate2D
    let id = UUID()
}

struct MapView_Previews: PreviewProvider {
    static var previews: some View {
        MapView(coordinates: CLLocationCoordinate2D(latitude: 45.904690, longitude: 6.142201))
    }
}
