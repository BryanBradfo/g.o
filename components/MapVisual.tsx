
import React, { useEffect, useRef } from 'react';
import { Activity } from '../types';

declare global {
  interface Window {
    L: any;
  }
}

interface MapVisualProps {
  activities: Activity[];
  selectedActivity: Activity | null;
  onSelect: (activity: Activity) => void;
}

const MapVisual: React.FC<MapVisualProps> = ({ activities, selectedActivity, onSelect }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const layerGroupRef = useRef<any>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Check if Leaflet is loaded
    if (!window.L) {
        console.error("Leaflet not found");
        return;
    }

    const map = window.L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
    }).setView([48.8566, 2.3522], 13);

    // Standard OpenStreetMap Tiles - Classic look with blue water (Seine) and clear streets
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    layerGroupRef.current = window.L.featureGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
    };
  }, []);

  // Update Markers (Creation & Position)
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    // Clear existing
    layerGroupRef.current.clearLayers();
    markersRef.current = [];

    activities.forEach((activity) => {
        const marker = window.L.marker([activity.coordinates.lat, activity.coordinates.lng]);
        
        // Attach activity ID for later reference
        (marker as any).activityId = activity.id;
        
        marker.on('click', () => {
            onSelect(activity);
        });

        layerGroupRef.current.addLayer(marker);
        markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (activities.length > 0) {
        mapInstanceRef.current.fitBounds(layerGroupRef.current.getBounds(), {
            padding: [50, 50],
            maxZoom: 16
        });
    }
  }, [activities, onSelect]);

  // Update Visual State (Selection Highlighting & Panning)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    markersRef.current.forEach((marker) => {
        const activityId = (marker as any).activityId;
        const isSelected = selectedActivity?.id === activityId;
        
        // Use darker colors for better contrast on light map
        const color = isSelected ? '#BD00FF' : '#4B0082'; // Bright Purple vs Dark Indigo
        const size = isSelected ? 30 : 18;
        const zIndex = isSelected ? 1000 : 100;

        // Custom CSS Icon
        const icon = window.L.divIcon({
            className: 'custom-div-icon',
            html: `
                <div style="
                    background-color: ${color};
                    width: ${size}px;
                    height: ${size}px;
                    border-radius: 50%;
                    border: 3px solid #fff;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                    transition: all 0.3s ease;
                "></div>
            `,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
        });

        marker.setIcon(icon);
        marker.setZIndexOffset(zIndex);
    });

    // Fly to selected activity
    if (selectedActivity) {
        mapInstanceRef.current.flyTo(
            [selectedActivity.coordinates.lat, selectedActivity.coordinates.lng],
            16,
            { duration: 1.2, easeLinearity: 0.25 }
        );
    }

  }, [selectedActivity, activities]);

  return (
    <div className="absolute inset-0 bg-gray-200 z-0">
      <div ref={mapContainerRef} className="w-full h-full outline-none" style={{ background: '#e0e0e0' }} />
    </div>
  );
};

export default MapVisual;
