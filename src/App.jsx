import { useState, useCallback } from 'react'
import SearchBar from './components/SearchBar'
import SpotList from './components/SpotList'
import MapView from './components/MapView'
import VisitPlanner from './components/VisitPlanner'
import SavedPlans from './components/SavedPlans'
import { SAMPLE_SPOTS } from './data/spots'
import './App.css'

function loadFromStorage(key, fallback) {
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : fallback
  } catch { return fallback }
}

function App() {
  const [spots] = useState(SAMPLE_SPOTS)
  const [filteredSpots, setFilteredSpots] = useState(SAMPLE_SPOTS)
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [planningSpot, setPlanningSpot] = useState(null)
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194])
  const [starred, setStarred] = useState(() => loadFromStorage('starredSpots', []))
  const [savedPlans, setSavedPlans] = useState(() => loadFromStorage('savedPlans', {}))
  const [activeTab, setActiveTab] = useState('explore')
  const [filters, setFilters] = useState({
    petFriendly: false,
    kidFriendly: false,
    libraryParkPass: false,
    starredOnly: false,
    difficulty: 'all',
  })

  const toggleStar = useCallback((spotId) => {
    setStarred((prev) => {
      const next = prev.includes(spotId) ? prev.filter((id) => id !== spotId) : [...prev, spotId]
      localStorage.setItem('starredSpots', JSON.stringify(next))
      return next
    })
  }, [])

  const savePlan = useCallback((spotId, plan) => {
    setSavedPlans((prev) => {
      const next = { ...prev, [spotId]: plan }
      localStorage.setItem('savedPlans', JSON.stringify(next))
      return next
    })
  }, [])

  const deletePlan = useCallback((spotId) => {
    setSavedPlans((prev) => {
      const next = { ...prev }
      delete next[spotId]
      localStorage.setItem('savedPlans', JSON.stringify(next))
      return next
    })
  }, [])

  const applyFilters = useCallback((spotList, f) => {
    return spotList.filter((s) => {
      if (f.petFriendly && !s.petFriendly) return false
      if (f.kidFriendly && !s.kidFriendly) return false
      if (f.libraryParkPass && !s.libraryParkPass) return false
      if (f.starredOnly && !starred.includes(s.id)) return false
      if (f.difficulty !== 'all' && s.difficulty !== f.difficulty) return false
      return true
    })
  }, [starred])

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

  const planCount = Object.keys(savedPlans).length

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Stardust</h1>
        <p className="app-subtitle">Discover trails, museums, heritage sites & hidden gems</p>
      </header>

      {activeTab === 'explore' && (
        <main className="page">
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
              <div className="list-header">
                <h2 className="section-title">
                  {filteredSpots.length} Place{filteredSpots.length !== 1 ? 's' : ''}
                </h2>
              </div>
              <SpotList
                spots={filteredSpots}
                selectedSpot={selectedSpot}
                onSpotSelect={setSelectedSpot}
                onPlanVisit={setPlanningSpot}
                starred={starred}
                onToggleStar={toggleStar}
                savedPlans={savedPlans}
              />
            </div>
          </div>
        </main>
      )}

      {activeTab === 'plans' && (
        <main className="page">
          <SavedPlans
            plans={savedPlans}
            spots={spots}
            onDeletePlan={deletePlan}
            onOpenPlan={(spot) => { setPlanningSpot(spot) }}
          />
        </main>
      )}

      {planningSpot && (
        <VisitPlanner
          spot={planningSpot}
          onClose={() => setPlanningSpot(null)}
          savedPlan={savedPlans[planningSpot.id]}
          onSavePlan={(plan) => savePlan(planningSpot.id, plan)}
          onDeletePlan={() => deletePlan(planningSpot.id)}
        />
      )}

      <nav className="tab-bar">
        <button
          className={`tab-item ${activeTab === 'explore' ? 'active' : ''}`}
          onClick={() => setActiveTab('explore')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="tab-icon">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <span>Explore</span>
        </button>
        <button
          className={`tab-item ${activeTab === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="tab-icon">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>Plans</span>
          {planCount > 0 && <span className="tab-badge">{planCount}</span>}
        </button>
      </nav>
    </div>
  )
}

export default App
