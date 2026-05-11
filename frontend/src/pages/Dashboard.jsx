// src/pages/Dashboard.jsx
// The main dashboard — shows overview stats + charts.
// This is the core page users see after logging in.

import { useState, useEffect } from 'react';
import { statsAPI, profilesAPI } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import RatingChart from '../components/charts/RatingChart';
import TopicsChart from '../components/charts/TopicsChart';
import SolveHeatmap from '../components/charts/SolveHeatmap';
import StatCard from '../components/ui/StatCard';
import LinkPlatform from '../components/ui/LinkPlatform';

export default function Dashboard() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [contests, setContests] = useState([]);
  const [topics, setTopics] = useState([]);
  const [heatmap, setHeatmap] = useState({});
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      // Fetch all dashboard data in parallel for speed
      const [overviewRes, contestsRes, topicsRes, heatmapRes, profilesRes] =
        await Promise.all([
          statsAPI.overview(),
          statsAPI.contests(),
          statsAPI.topics(),
          statsAPI.heatmap(),
          profilesAPI.getAll(),
        ]);

      setOverview(overviewRes.data);
      setContests(contestsRes.data);
      setTopics(topicsRes.data);
      setHeatmap(heatmapRes.data);
      setProfiles(profilesRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    await profilesAPI.sync();
    setTimeout(loadAllData, 5000); // reload data after 5 seconds
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <p>Loading your stats...</p>
      </div>
    );
  }

  // If no profiles linked yet, show the connect screen
  if (profiles.length === 0) {
    return (
      <div className="empty-state">
        <h2>Connect your accounts</h2>
        <p>Link your Codeforces or LeetCode username to see your analytics.</p>
        <LinkPlatform onLinked={loadAllData} />
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="subtitle">
            {profiles.map((p) => `${p.platform}: ${p.username}`).join(' · ')}
          </p>
        </div>
        <button className="sync-btn" onClick={handleSync}>
          ↻ Sync Data
        </button>
      </div>

      {/* Stat cards row */}
      <div className="stat-cards">
        <StatCard label="Problems Solved" value={overview?.totalSolved ?? 0} icon="✅" />
        <StatCard label="Peak Rating" value={overview?.peakRating ?? 0} icon="🏆" />
        <StatCard label="Contests Attended" value={overview?.contestCount ?? 0} icon="⚔️" />
        <StatCard label="Platforms Linked" value={overview?.platforms ?? 0} icon="🔗" />
      </div>

      {/* Rating trend chart */}
      <div className="chart-section">
        <h2>Rating History</h2>
        {contests.length > 0 ? (
          <RatingChart data={contests} />
        ) : (
          <p className="no-data">No contest data yet. Sync your profiles.</p>
        )}
      </div>

      {/* Topic breakdown */}
      <div className="charts-row">
        <div className="chart-half">
          <h2>Top Topics</h2>
          {topics.length > 0 ? (
            <TopicsChart data={topics.slice(0, 10)} />
          ) : (
            <p className="no-data">No problem data yet.</p>
          )}
        </div>

        {/* Solve heatmap */}
        <div className="chart-half">
          <h2>Solve Streak</h2>
          <SolveHeatmap data={heatmap} />
        </div>
      </div>

      {/* Link additional platforms */}
      <div className="chart-section">
        <h2>Linked Platforms</h2>
        <LinkPlatform profiles={profiles} onLinked={loadAllData} onUnlinked={loadAllData} />
      </div>
    </div>
  );
}
