// services/CodeforcesService.js
// Handles all communication with the official Codeforces API.
// Codeforces API docs: https://codeforces.com/apiHelp
// No API key needed for public endpoints.

const axios = require('axios');

const CF_BASE = 'https://codeforces.com/api';

// Helper: add delay between requests to respect CF rate limit (5 req/sec)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper: retry with exponential backoff on rate limit (HTTP 429)
async function fetchWithRetry(url, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await axios.get(url, { timeout: 10000 });
      if (res.data.status !== 'OK') {
        throw new Error(`CF API error: ${res.data.comment}`);
      }
      return res.data.result;
    } catch (err) {
      if (err.response?.status === 429 && attempt < retries - 1) {
        const waitMs = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        console.log(`CF rate limited. Retrying in ${waitMs}ms...`);
        await sleep(waitMs);
      } else {
        throw err;
      }
    }
  }
}

// Fetch basic user info — current rating, rank, etc.
async function getUserInfo(handle) {
  const data = await fetchWithRetry(`${CF_BASE}/user.info?handles=${handle}`);
  const user = data[0];
  return {
    handle: user.handle,
    rating: user.rating || 0,
    maxRating: user.maxRating || 0,
    rank: user.rank || 'unrated',
    maxRank: user.maxRank || 'unrated',
  };
}

// Fetch full contest rating history
async function getRatingHistory(handle) {
  const data = await fetchWithRetry(`${CF_BASE}/user.rating?handle=${handle}`);
  return data.map((entry) => ({
    contestId: String(entry.contestId),
    contestName: entry.contestName,
    rank: entry.rank,
    ratingChange: entry.newRating - entry.oldRating,
    ratingAfter: entry.newRating,
    solvedCount: 0, // CF rating API doesn't include this
    timestamp: new Date(entry.ratingUpdateTimeSeconds * 1000),
  }));
}

// Fetch all accepted submissions to extract solved problems and their tags
async function getSolvedProblems(handle) {
  await sleep(300); // small pause to respect rate limits
  const data = await fetchWithRetry(
    `${CF_BASE}/user.status?handle=${handle}&from=1&count=10000`
  );

  const seen = new Set();
  const problems = [];

  for (const sub of data) {
    if (sub.verdict !== 'OK') continue; // only count accepted submissions

    const slug = `${sub.problem.contestId}-${sub.problem.index}`;
    if (seen.has(slug)) continue; // deduplicate — only first accepted submission
    seen.add(slug);

    problems.push({
      slug,
      title: sub.problem.name,
      difficulty: sub.problem.rating ? String(sub.problem.rating) : null,
      tags: sub.problem.tags || [],
      solvedAt: new Date(sub.creationTimeSeconds * 1000),
    });
  }

  return problems;
}

module.exports = { getUserInfo, getRatingHistory, getSolvedProblems };
