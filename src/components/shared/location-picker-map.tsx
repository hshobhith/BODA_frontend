"use client";

import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L, { type LeafletEvent, type Marker as LeafletMarker } from "leaflet";

// Bundler asset imports for Leaflet's default marker icon are unreliable across
// webpack/Turbopack (they resolve to StaticImageData objects, not URL strings),
// so we point straight at the same version's CDN copy instead.
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LatLng {
  lat: number;
  lng: number;
}

function RecenterOnChange({ position }: { position: LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
}

function ClickHandler({ onPick }: { onPick: (position: LatLng) => void }) {
  useMapEvents({
    click(event) {
      onPick({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });
  return null;
}

interface LocationPickerMapProps {
  position: LatLng;
  onChange: (position: LatLng) => void;
}

export default function LocationPickerMap({ position, onChange }: LocationPickerMapProps) {
  function handleDragEnd(event: LeafletEvent & { target: LeafletMarker }) {
    const latLng = event.target.getLatLng();
    onChange({ lat: latLng.lat, lng: latLng.lng });
  }

  return (
    <MapContainer
      center={position}
      zoom={16}
      scrollWheelZoom
      style={{ width: "100%", height: "320px" }}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
        position={position}
        icon={markerIcon}
        draggable
        eventHandlers={{ dragend: handleDragEnd }}
      />
      <ClickHandler onPick={onChange} />
      <RecenterOnChange position={position} />
    </MapContainer>
  );
}
