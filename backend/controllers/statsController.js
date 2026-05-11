// controllers/statsController.js
// Handles all stats/analytics endpoints.
// These are the endpoints that power the dashboard charts.

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/stats/overview
// Returns summary numbers for the top stat cards on the dashboard
const getOverview = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all profiles for this user
    const profiles = await prisma.cpProfile.findMany({
      where: { userId },
      select: { id: true },
    });
    const profileIds = profiles.map((p) => p.id);

    if (profileIds.length === 0) {
      return res.json({ totalSolved: 0, peakRating: 0, contestCount: 0, platforms: 0 });
    }

    // Count unique solved problems across all platforms
    const totalSolved = await prisma.problem.count({
      where: { profileId: { in: profileIds } },
    });

    // Find peak rating ever achieved across all contests
    const peakRatingResult = await prisma.contest.aggregate({
      where: { profileId: { in: profileIds }, ratingAfter: { not: null } },
      _max: { ratingAfter: true },
    });

    // Count total contest participations
    const contestCount = await prisma.contest.count({
      where: { profileId: { in: profileIds } },
    });

    res.json({
      totalSolved,
      peakRating: peakRatingResult._max.ratingAfter || 0,
      contestCount,
      platforms: profiles.length,
    });
  } catch (err) {
    console.error('getOverview error:', err);
    res.status(500).json({ error: 'Failed to fetch overview stats' });
  }
};

// GET /api/stats/contests?platform=CODEFORCES
// Returns contest history for rating chart — optionally filtered by platform
const getContests = async (req, res) => {
  try {
    const userId = req.user.id;
    const { platform } = req.query; // optional filter: CODEFORCES or LEETCODE

    const profiles = await prisma.cpProfile.findMany({
      where: { userId, ...(platform ? { platform } : {}) },
      select: { id: true },
    });
    const profileIds = profiles.map((p) => p.id);

    const contests = await prisma.contest.findMany({
      where: { profileId: { in: profileIds } },
      orderBy: { timestamp: 'asc' }, // chronological order for the chart
      select: {
        contestName: true,
        rank: true,
        ratingChange: true,
        ratingAfter: true,
        solvedCount: true,
        platform: true,
        timestamp: true,
      },
    });

    res.json(contests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contests' });
  }
};

// GET /api/stats/topics
// Returns problem count grouped by tag — powers the bar chart
const getTopics = async (req, res) => {
  try {
    const userId = req.user.id;

    const profiles = await prisma.cpProfile.findMany({
      where: { userId },
      select: { id: true },
    });
    const profileIds = profiles.map((p) => p.id);

    // Fetch all problems with their tags
    const problems = await prisma.problem.findMany({
      where: { profileId: { in: profileIds } },
      select: { tags: true },
    });

    // Count occurrences of each tag across all solved problems
    const tagCount = {};
    for (const problem of problems) {
      for (const tag of problem.tags) {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      }
    }

    // Sort by count descending, return top 20
    const sorted = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count }));

    res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch topic stats' });
  }
};

// GET /api/stats/heatmap
// Returns daily solve counts for the GitHub-style contribution calendar
const getHeatmap = async (req, res) => {
  try {
    const userId = req.user.id;

    const profiles = await prisma.cpProfile.findMany({
      where: { userId },
      select: { id: true },
    });
    const profileIds = profiles.map((p) => p.id);

    // Get problems from the last 365 days
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const problems = await prisma.problem.findMany({
      where: {
        profileId: { in: profileIds },
        solvedAt: { gte: oneYearAgo },
      },
      select: { solvedAt: true },
    });

    // Group by date string (YYYY-MM-DD)
    const dayCount = {};
    for (const p of problems) {
      const date = p.solvedAt.toISOString().split('T')[0];
      dayCount[date] = (dayCount[date] || 0) + 1;
    }

    res.json(dayCount); // { "2024-03-15": 3, "2024-03-16": 1, ... }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch heatmap data' });
  }
};

module.exports = { getOverview, getContests, getTopics, getHeatmap };
