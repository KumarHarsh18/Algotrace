const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getUserPerformanceStats(userId) {
  // Get all CP profiles belonging to the logged-in user
  const profiles = await prisma.cpProfile.findMany({
    where: { userId },
    select: {
      id: true,
      platform: true,
    },
  });

  const profileIds = profiles.map((profile) => profile.id);

  // User has no linked CP accounts
  if (profileIds.length === 0) {
    return {
      platforms: [],
      contests: {
        total: 0,
        bestRank: null,
        peakRating: null,
        averageRatingChange: null,
      },
      problems: {
        total: 0,
        byDifficulty: {},
        topTopics: [],
      },
    };
  }

  // Fetch contests
  const contests = await prisma.contest.findMany({
    where: {
      profileId: { in: profileIds },
    },
    select: {
      platform: true,
      rank: true,
      ratingChange: true,
      ratingAfter: true,
      solvedCount: true,
      timestamp: true,
    },
  });

  // Fetch solved problems
  const problems = await prisma.problem.findMany({
    where: {
      profileId: { in: profileIds },
    },
    select: {
      platform: true,
      difficulty: true,
      tags: true,
      solvedAt: true,
    },
  });

  // -----------------------------
  // Contest analytics
  // -----------------------------

  const rankedContests = contests.filter(
    (contest) => contest.rank !== null
  );

  const contestsWithRatingChange = contests.filter(
    (contest) => contest.ratingChange !== null
  );

  const contestsWithRating = contests
    .filter((contest) => contest.ratingAfter !== null)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const bestRank =
    rankedContests.length > 0
      ? Math.min(...rankedContests.map((contest) => contest.rank))
      : null;

  const peakRating =
    contestsWithRating.length > 0
      ? Math.max(...contestsWithRating.map((contest) => contest.ratingAfter))
      : null;

  const averageRatingChange =
    contestsWithRatingChange.length > 0
      ? Math.round(
          contestsWithRatingChange.reduce(
            (sum, contest) => sum + contest.ratingChange,
            0
          ) / contestsWithRatingChange.length
        )
      : null;

  // -----------------------------
  // Problem analytics
  // -----------------------------

  const byDifficulty = {};
  const topicCount = {};

  for (const problem of problems) {
    if (problem.difficulty) {
      byDifficulty[problem.difficulty] =
        (byDifficulty[problem.difficulty] || 0) + 1;
    }

    for (const tag of problem.tags || []) {
      topicCount[tag] = (topicCount[tag] || 0) + 1;
    }
  }

  const topTopics = Object.entries(topicCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([topic, count]) => ({
      topic,
      count,
    }));

  return {
    platforms: profiles.map((profile) => profile.platform),

    contests: {
      total: contests.length,
      bestRank,
      peakRating,
      averageRatingChange,
    },

    problems: {
      total: problems.length,
      byDifficulty,
      topTopics,
    },
  };
}

module.exports = {
  getUserPerformanceStats,
};