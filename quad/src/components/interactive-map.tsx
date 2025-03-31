"use client"

import { useEffect, useRef, useState } from 'react'

interface InteractiveMapProps {
  onSelectRide?: (id: number) => void
}

interface Location {
  id: number
  coordinates: {
    lat: number
    lng: number
  }
  title: string
  rating: number
  price: number
  driver: string
  car: string
}

interface HereMap {
  dispose: () => void
  getViewPort: () => { resize: () => void }
  addObject: (marker: unknown) => void
}

interface HerePlatform {
  createDefaultLayers: () => {
    vector: {
      normal: {
        map: unknown
      }
    }
  }
}

interface HereUI {
  addBubble: (bubble: unknown) => void
}

const locations: Location[] = [
  {
    id: 1,
    coordinates: { lat: 12.9716, lng: 77.5946 },
    title: "Downtown",
    rating: 4.8,
    price: 12.50,
    driver: "Michael Smith",
    car: "Toyota Camry"
  },
  {
    id: 2,
    coordinates: { lat: 12.9816, lng: 77.5846 },
    title: "Airport",
    rating: 4.9,
    price: 14.50,
    driver: "Sarah Johnson",
    car: "Honda Civic"
  },
  {
    id: 3,
    coordinates: { lat: 12.9616, lng: 77.6046 },
    title: "Suburbs",
    rating: 4.7,
    price: 16.50,
    driver: "Robert Brown",
    car: "Ford Escape"
  },
  {
    id: 4,
    coordinates: { lat: 12.9916, lng: 77.5746 },
    title: "Mall",
    rating: 4.8,
    price: 18.50,
    driver: "Jennifer Wilson",
    car: "Nissan Altima"
  }
]

export function InteractiveMap({ onSelectRide }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<HereMap | null>(null)

  useEffect(() => {
    // Load HERE Maps scripts
    const loadHereMaps = () => {
      const script = document.createElement('script')
      script.src = 'https://js.api.here.com/v3/3.1/mapsjs-core.js'
      script.async = true
      document.body.appendChild(script)

      script.onload = () => {
        const script2 = document.createElement('script')
        script2.src = 'https://js.api.here.com/v3/3.1/mapsjs-service.js'
        document.body.appendChild(script2)

        script2.onload = () => {
          const script3 = document.createElement('script')
          script3.src = 'https://js.api.here.com/v3/3.1/mapsjs-ui.js'
          document.body.appendChild(script3)

          const script4 = document.createElement('script')
          script4.src = 'https://js.api.here.com/v3/3.1/mapsjs-mapevents.js'
          document.body.appendChild(script4)

          script4.onload = initializeMap
        }
      }
    }

    loadHereMaps()

    return () => {
      if (map) {
        map.dispose()
      }
    }
  }, [map])

  const initializeMap = () => {
    if (mapRef.current && (window as any).H) {
      const H = (window as any).H
      // Initialize the platform object
      const platform = new H.service.Platform({
        apikey: process.env.NEXT_PUBLIC_HERE_API_KEY
      }) as HerePlatform

      // Get the default map types from the platform object
      const defaultLayers = platform.createDefaultLayers()

      // Instantiate the map
      const newMap = new H.Map(
        mapRef.current,
        defaultLayers.vector.normal.map,
        {
          center: { lat: 12.9716, lng: 77.5946 },
          zoom: 13,
          pixelRatio: window.devicePixelRatio || 1
        }
      ) as HereMap
      setMap(newMap)

      // Create the default UI components
      const ui = H.ui.UI.createDefault(newMap, defaultLayers) as HereUI

      // Add markers for each location
      locations.forEach(location => {
        const marker = new H.map.Marker(location.coordinates)
        marker.setData(location)
        marker.addEventListener('tap', (evt: { target: { getData: () => Location } }) => {
          const loc = evt.target.getData()
          onSelectRide?.(loc.id)
          
          const bubble = new H.ui.InfoBubble(loc.coordinates, {
            content: `
              <div class="p-4">
                <h3 class="font-medium">${loc.driver}</h3>
                <p class="text-sm text-gray-600">${loc.car}</p>
                <div class="flex items-center gap-1 mt-1">
                  <span class="text-yellow-500">★</span>
                  <span class="text-sm">${loc.rating}</span>
                </div>
                <p class="text-sm font-medium mt-1">₹${loc.price}</p>
                <div class="text-xs text-gray-500 mt-1">${loc.title}</div>
              </div>
            `
          })
          ui.addBubble(bubble)
        })
        newMap.addObject(marker)
      })

      // Make the map responsive
      window.addEventListener('resize', () => {
        newMap.getViewPort().resize()
      })
    }
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      <link rel="stylesheet" type="text/css" href="https://js.api.here.com/v3/3.1/mapsjs-ui.css" />
    </div>
  )
}