import { useState } from 'react'
import './SearchBar.css'

const REGIONS = [
  { name: 'San Francisco Bay Area', lat: 37.7749, lng: -122.4194 },
  { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
  { name: 'Pacific Northwest', lat: 47.6062, lng: -122.3321 },
]

export default function SearchBar({ onSearch, onLocationSearch, filters, onFilterChange }) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(query)
  }

  const handleRegionClick = (region) => {
    setQuery(region.name)
    onLocationSearch(region.lat, region.lng, region.name)
  }

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onLocationSearch(pos.coords.latitude, pos.coords.longitude, '')
        },
        () => alert('Could not get your location. Please search by name instead.')
      )
    }
  }

  return (
    <div className="search-bar">
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="search-input-wrap">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search trails by name, city, or region..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              onSearch(e.target.value)
            }}
          />
          <button type="button" className="location-btn" onClick={handleUseMyLocation} title="Use my location">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            </svg>
          </button>
        </div>
      </form>

      <div className="quick-regions">
        <span className="quick-label">Quick search:</span>
        {REGIONS.map((r) => (
          <button key={r.name} className="region-chip" onClick={() => handleRegionClick(r)}>
            {r.name}
          </button>
        ))}
      </div>

      <div className="filters">
        <label className="filter-toggle">
          <input
            type="checkbox"
            checked={filters.petFriendly}
            onChange={(e) => onFilterChange({ ...filters, petFriendly: e.target.checked })}
          />
          <span className="filter-label">Pet-Friendly</span>
        </label>
        <label className="filter-toggle">
          <input
            type="checkbox"
            checked={filters.kidFriendly}
            onChange={(e) => onFilterChange({ ...filters, kidFriendly: e.target.checked })}
          />
          <span className="filter-label">Kid-Friendly</span>
        </label>
        <select
          className="difficulty-select"
          value={filters.difficulty}
          onChange={(e) => onFilterChange({ ...filters, difficulty: e.target.value })}
        >
          <option value="all">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="moderate">Moderate</option>
          <option value="hard">Hard</option>
        </select>
      </div>
    </div>
  )
}
