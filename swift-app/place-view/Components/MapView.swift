import SwiftUI
import MapKit

#if os(macOS)
typealias ViewRepresentable = NSViewRepresentable
#else
typealias ViewRepresentable = UIViewRepresentable
#endif

struct MapView: ViewRepresentable {
    var coordinates: CLLocationCoordinate2D
    
    @State private var region = MKCoordinateRegion()
    
    #if os(macOS)
    func makeNSView(context: Context) -> MKMapView {
        MKMapView(frame: .zero)
    }
    
    func updateNSView(_ view: MKMapView, context: Context) {
        updateMap(view)
    }
    #else
    func makeUIView(context: Context) -> MKMapView {
        MKMapView(frame: .zero)
    }
    
    func updateUIView(_ view: MKMapView, context: Context) {
        updateMap(view)
    }
    #endif
    
    private func updateMap(_ view: MKMapView) {
        view.removeAnnotations(view.annotations)
        let annotation = MKPointAnnotation()
        annotation.coordinate = coordinates
        view.addAnnotation(annotation)
        
        let span = MKCoordinateSpan(latitudeDelta: 0.3, longitudeDelta: 0.3)
        let region = MKCoordinateRegion(center: coordinates, span: span)
        view.setRegion(region, animated: true)
    }
}

