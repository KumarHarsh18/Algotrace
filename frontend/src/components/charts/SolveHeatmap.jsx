// src/components/charts/SolveHeatmap.jsx
// GitHub contribution-style calendar heatmap built with pure CSS grid.
// No library needed — just a grid of colored squares.

export default function SolveHeatmap({ data }) {
  // Generate last 365 days
  const days = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }

  // Find max solve count for color scaling
  const counts = Object.values(data);
  const max = Math.max(...counts, 1);

  // Map a solve count to a color intensity
  function getColor(count) {
    if (!count || count === 0) return '#ebedf0';
    const intensity = count / max;
    if (intensity < 0.25) return '#9be9a8';
    if (intensity < 0.5) return '#40c463';
    if (intensity < 0.75) return '#30a14e';
    return '#216e39';
  }

  // Group days by week (7 days per column)
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '2px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}
      >
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {week.map((day) => {
              const count = data[day] || 0;
              return (
                <div
                  key={day}
                  title={`${day}: ${count} problem${count !== 1 ? 's' : ''}`}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '2px',
                    backgroundColor: getColor(count),
                    cursor: 'default',
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginTop: '8px', fontSize: '11px', color: '#666' }}>
        <span>Less</span>
        {['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'].map((c) => (
          <div key={c} style={{ width: '10px', height: '10px', borderRadius: '2px', background: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
