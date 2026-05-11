// services/LeetCodeService.js
// LeetCode has no official public API, but their website uses GraphQL.
// We query the same endpoint that leetcode.com's frontend uses.
// This is commonly used and allowed for personal tools.

const axios = require('axios');

const LC_GRAPHQL = 'https://leetcode.com/graphql';

// Axios instance with headers that mimic a browser request
const lcClient = axios.create({
  baseURL: LC_GRAPHQL,
  headers: {
    'Content-Type': 'application/json',
    'Referer': 'https://leetcode.com',
    'User-Agent': 'Mozilla/5.0 AlgoTrace/1.0',
  },
  timeout: 15000,
});

// Fetch user's contest rating history
async function getContestHistory(username) {
  const query = `
    query userContestRankingInfo($username: String!) {
      userContestRanking(username: $username) {
        attendedContestsCount
        rating
        globalRanking
        topPercentage
      }
      userContestRankingHistory(username: $username) {
        attended
        trendDirection
        problemsSolved
        totalProblems
        finishTimeInSeconds
        rating
        ranking
        contest {
          title
          startTime
        }
      }
    }
  `;

  const res = await lcClient.post('', {
    query,
    variables: { username },
  });

  const history = res.data?.data?.userContestRankingHistory || [];

  return history
    .filter((c) => c.attended) // only include contests they participated in
    .map((c, idx) => ({
      contestId: `lc-${c.contest.startTime}`, // synthetic ID
      contestName: c.contest.title,
      rank: c.ranking,
      ratingChange: null, // LeetCode doesn't expose rating delta directly
      ratingAfter: Math.round(c.rating),
      solvedCount: c.problemsSolved,
      timestamp: new Date(c.contest.startTime * 1000),
    }));
}

// Fetch recent accepted submissions to get solved problems + tags
// Note: LeetCode limits public submission visibility to ~20 recent
// For more, users would need to be logged in — MVP uses public data only
async function getRecentSolvedProblems(username) {
  const query = `
    query recentAcSubmissions($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        id
        title
        titleSlug
        timestamp
      }
    }
  `;

  const res = await lcClient.post('', {
    query,
    variables: { username, limit: 20 },
  });

  const submissions = res.data?.data?.recentAcSubmissionList || [];

  // We need a second query to get tags per problem
  const problems = [];
  for (const sub of submissions) {
    try {
      const details = await getProblemDetails(sub.titleSlug);
      problems.push({
        slug: sub.titleSlug,
        title: sub.title,
        difficulty: details.difficulty,
        tags: details.tags,
        solvedAt: new Date(sub.timestamp * 1000),
      });
      // Small delay to avoid hammering
      await new Promise((r) => setTimeout(r, 200));
    } catch {
      // Skip problems we can't fetch details for
    }
  }

  return problems;
}

// Fetch difficulty and tags for a specific problem
async function getProblemDetails(titleSlug) {
  const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        difficulty
        topicTags {
          name
          slug
        }
      }
    }
  `;

  const res = await lcClient.post('', {
    query,
    variables: { titleSlug },
  });

  const q = res.data?.data?.question;
  return {
    difficulty: q?.difficulty || null,
    tags: q?.topicTags?.map((t) => t.slug) || [],
  };
}

// Fetch overall user stats
async function getUserStats(username) {
  const query = `
    query userPublicProfile($username: String!) {
      matchedUser(username: $username) {
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;

  const res = await lcClient.post('', {
    query,
    variables: { username },
  });

  const stats = res.data?.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum || [];
  const result = { Easy: 0, Medium: 0, Hard: 0, total: 0 };
  for (const s of stats) {
    result[s.difficulty] = s.count;
    if (s.difficulty !== 'All') result.total += s.count;
  }
  return result;
}

module.exports = { getContestHistory, getRecentSolvedProblems, getUserStats };
