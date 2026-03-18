import { useState, useCallback } from 'react'
import SearchBar from './components/SearchBar'
import SpotList from './components/SpotList'
import MapView from './components/MapView'
import VisitPlanner from './components/VisitPlanner'
import { SAMPLE_SPOTS } from './data/spots'
import './App.css'

function App() {
  const [spots] = useState(SAMPLE_SPOTS)
  const [filteredSpots, setFilteredSpots] = useState(SAMPLE_SPOTS)
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [planningSpot, setPlanningSpot] = useState(null)
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194])
  const [filters, setFilters] = useState({
    petFriendly: false,
    kidFriendly: false,
    difficulty: 'all',
  })

  const applyFilters = (spotList, f) => {
    return spotList.filter((s) => {
      if (f.petFriendly && !s.petFriendly) return false
      if (f.kidFriendly && !s.kidFriendly) return false
      if (f.difficulty !== 'all' && s.difficulty !== f.difficulty) return false
      return true
    })
  }

  const handleSearch = useCallback((query) => {
    if (!query.trim()) {
      setFilteredSpots(applyFilters(spots, filters))
      return
    }
    const q = query.toLowerCase()
    const results = spots.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.region.toLowerCase().includes(q)
    )
    setFilteredSpots(applyFilters(results, filters))
  }, [spots, filters])

  const handleLocationSearch = useCallback((lat, lng, regionName) => {
    setMapCenter([lat, lng])
    if (regionName) {
      const q = regionName.toLowerCase()
      const results = spots.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q) ||
          s.region.toLowerCase().includes(q)
      )
      setFilteredSpots(applyFilters(results.length > 0 ? results : spots, filters))
    } else {
      // No region name (e.g. "Use my location") -- filter by proximity (50km radius)
      const toRad = (deg) => (deg * Math.PI) / 180
      const distanceKm = (lat1, lng1, lat2, lng2) => {
        const R = 6371
        const dLat = toRad(lat2 - lat1)
        const dLng = toRad(lng2 - lng1)
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      }
      const nearby = spots.filter((s) => distanceKm(lat, lng, s.lat, s.lng) <= 50)
      setFilteredSpots(applyFilters(nearby.length > 0 ? nearby : spots, filters))
    }
  }, [spots, filters])

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setFilteredSpots(applyFilters(spots, newFilters))
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Hiking Spot Explorer</h1>
        <p className="subtitle">Discover trails, plan your visit, bring the whole family</p>
      </header>

      <SearchBar
        onSearch={handleSearch}
        onLocationSearch={handleLocationSearch}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <div className="main-content">
        <div className="map-section">
          <MapView
            spots={filteredSpots}
            center={mapCenter}
            selectedSpot={selectedSpot}
            onSpotSelect={setSelectedSpot}
          />
        </div>

        <div className="list-section">
          <h2 className="section-title">
            {filteredSpots.length} Trail{filteredSpots.length !== 1 ? 's' : ''} Found
          </h2>
          <SpotList
            spots={filteredSpots}
            selectedSpot={selectedSpot}
            onSpotSelect={setSelectedSpot}
            onPlanVisit={setPlanningSpot}
          />
        </div>
      </div>

      {planningSpot && (
        <VisitPlanner
          spot={planningSpot}
          onClose={() => setPlanningSpot(null)}
        />
      )}
    </div>
  )
}

export default App
