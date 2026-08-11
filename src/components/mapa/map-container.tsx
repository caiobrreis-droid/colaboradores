"use client";

import { useEffect } from "react";
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPopup } from "./map-popup";
import { MAP_CENTER, MAP_DEFAULT_ZOOM } from "@/lib/constants";

// Fix leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MarkerData {
  id: string;
  name: string;
  cargo: string;
  bairro: string;
  telefone: string;
  instagram?: string;
  status: string;
  fotoUrl?: string;
  lat: number;
  lng: number;
}

interface MapContainerProps {
  markers: MarkerData[];
  height?: string;
  zoom?: number;
  center?: { lat: number; lng: number };
}

// Component to handle map view updates
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MapContainer({
  markers,
  height = "100%",
  zoom = MAP_DEFAULT_ZOOM,
  center = MAP_CENTER,
}: MapContainerProps) {

  const getCustomIcon = (status: string) => {
    let borderColor = "#0057FF"; // default vessel-blue
    const bgColor = "#ffffff";

    if (status === "Positivado") borderColor = "#00C853"; // vessel-green
    else if (status === "Negativado") borderColor = "#ef4444"; // red-500
    else if (status === "Parcial" || status === "Pendente") borderColor = "#f59e0b"; // amber-500
    else if (status === "Rede não encontrada") borderColor = "#7c3aed"; // violet-600

    const html = `
      <div style="
        width: 24px;
        height: 24px;
        background-color: ${bgColor};
        border: 4px solid ${borderColor};
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `;

    return L.divIcon({
      html,
      className: "custom-leaflet-marker",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12],
    });
  };

  const mapCenter: [number, number] = [center.lat, center.lng];

  return (
    <div style={{ height, width: "100%", zIndex: 0 }} className="relative z-0">
      <LeafletMap center={mapCenter} zoom={zoom} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={mapCenter} zoom={zoom} />

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={getCustomIcon(marker.status)}
          >
            <Popup className="vessel-map-popup">
              <MapPopup funcionario={marker} />
            </Popup>
          </Marker>
        ))}
      </LeafletMap>
    </div>
  );
}
