// src/components/ui/LinkPlatform.jsx
// Lets users link their Codeforces and LeetCode usernames.
// Shows existing linked profiles with option to unlink.

import { useState } from 'react';
import { profilesAPI } from '../../api/client';

export default function LinkPlatform({ profiles = [], onLinked, onUnlinked }) {
  const [platform, setPlatform] = useState('CODEFORCES');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const linkedPlatforms = new Set(profiles.map((p) => p.platform));

  async function handleLink() {
    if (!username.trim()) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await profilesAPI.link(platform, username.trim());
      setSuccess(`${platform} account linked! Click "Sync Data" to fetch your stats.`);
      setUsername('');
      onLinked?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to link. Check the username.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlink(id, platform) {
    if (!confirm(`Unlink ${platform}? This will delete all synced data.`)) return;
    try {
      await profilesAPI.unlink(id);
      onUnlinked?.();
    } catch {
      alert('Failed to unlink. Try again.');
    }
  }

  return (
    <div className="link-platform">
      {/* Show existing linked profiles */}
      {profiles.length > 0 && (
        <div className="linked-profiles">
          {profiles.map((p) => (
            <div key={p.id} className="linked-profile-row">
              <span className="platform-badge">{p.platform}</span>
              <span className="username">{p.username}</span>
              {p.lastSyncAt && (
                <span className="sync-time">
                  Last synced: {new Date(p.lastSyncAt).toLocaleDateString()}
                </span>
              )}
              <button
                className="unlink-btn"
                onClick={() => handleUnlink(p.id, p.platform)}
              >
                Unlink
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Link new platform form */}
      {linkedPlatforms.size < 2 && (
        <div className="link-form">
          <h3>Add a platform</h3>
          <div className="form-row">
            <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
              {!linkedPlatforms.has('CODEFORCES') && (
                <option value="CODEFORCES">Codeforces</option>
              )}
              {!linkedPlatforms.has('LEETCODE') && (
                <option value="LEETCODE">LeetCode</option>
              )}
            </select>
            <input
              type="text"
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLink()}
            />
            <button onClick={handleLink} disabled={loading || !username.trim()}>
              {loading ? 'Verifying...' : 'Link Account'}
            </button>
          </div>
          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}
        </div>
      )}
    </div>
  );
}
