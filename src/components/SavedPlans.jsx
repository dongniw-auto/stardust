import './SavedPlans.css'

function formatDate(iso) {
  if (!iso) return 'No date set'
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

export default function SavedPlans({ plans, spots, onDeletePlan, onOpenPlan }) {
  const entries = Object.entries(plans).map(([spotId, plan]) => {
    const spot = spots.find((s) => s.id === Number(spotId))
    return { spotId: Number(spotId), plan, spot }
  }).filter((e) => e.spot)

  entries.sort((a, b) => {
    if (a.plan.visitDate && b.plan.visitDate) return a.plan.visitDate.localeCompare(b.plan.visitDate)
    if (a.plan.visitDate) return -1
    if (b.plan.visitDate) return 1
    return (b.plan.savedAt || '').localeCompare(a.plan.savedAt || '')
  })

  return (
    <div className="plans-page">
      <div className="plans-page-header">
        <h1>My Plans</h1>
        <p className="plans-count">{entries.length} planned visit{entries.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="plans-list">
        {entries.length === 0 ? (
          <div className="plans-empty">
            <div className="plans-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h3>No plans yet</h3>
            <p>Use "Plan Visit" on any place to get started.</p>
          </div>
        ) : (
          entries.map(({ spotId, plan, spot }) => (
            <div key={spotId} className="plan-card" onClick={() => onOpenPlan(spot)}>
              <div className="plan-card-content">
                <h3 className="plan-card-name">{spot.name}</h3>
                <p className="plan-card-location">{spot.location}</p>
                <div className="plan-card-meta">
                  {plan.visitDate && (
                    <span className="plan-chip date-chip">{formatDate(plan.visitDate)}</span>
                  )}
                  {plan.startTime && (
                    <span className="plan-chip">{plan.startTime}</span>
                  )}
                  {plan.bringPets && <span className="plan-chip pet-chip">Pets</span>}
                  {plan.bringKids && <span className="plan-chip kid-chip">Kids</span>}
                </div>
              </div>
              <div className="plan-card-actions">
                <button className="plan-action-btn edit" onClick={(e) => { e.stopPropagation(); onOpenPlan(spot) }}>
                  Edit
                </button>
                <button className="plan-action-btn remove" onClick={(e) => { e.stopPropagation(); onDeletePlan(spotId) }}>
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
