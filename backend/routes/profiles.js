// routes/profiles.js + inline controller logic
// Handles linking CP usernames and triggering data sync

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const verifyToken = require('../middleware/verifyToken');
const cfService = require('../services/CodeforcesService');
const lcService = require('../services/LeetCodeService');

const prisma = new PrismaClient();

// All profile routes require authentication
router.use(verifyToken);

// GET /api/profiles — list all linked CP profiles
router.get('/', async (req, res) => {
  const profiles = await prisma.cpProfile.findMany({
    where: { userId: req.user.id },
    select: { id: true, platform: true, username: true, lastSyncAt: true },
  });
  res.json(profiles);
});

// POST /api/profiles — link a new CP username
// Body: { platform: "CODEFORCES" | "LEETCODE", username: "tourist" }
router.post('/', async (req, res) => {
  const { platform, username } = req.body;

  if (!platform || !username) {
    return res.status(400).json({ error: 'platform and username are required' });
  }

  if (!['CODEFORCES', 'LEETCODE'].includes(platform)) {
    return res.status(400).json({ error: 'Invalid platform' });
  }

  try {
    // Check if already linked
    const existing = await prisma.cpProfile.findUnique({
      where: { userId_platform: { userId: req.user.id, platform } },
    });
    if (existing) {
      return res.status(409).json({ error: `${platform} already linked` });
    }

    // Validate username exists on the platform before saving
    if (platform === 'CODEFORCES') {
      await cfService.getUserInfo(username); // throws if user not found
    }
    // For LeetCode, we skip validation to avoid rate limits during linking

    const profile = await prisma.cpProfile.create({
      data: { userId: req.user.id, platform, username },
    });

    res.status(201).json(profile);
  } catch (err) {
    if (err.message?.includes('CF API error')) {
      return res.status(404).json({ error: 'Codeforces user not found' });
    }
    res.status(500).json({ error: 'Failed to link profile' });
  }
});

// POST /api/profiles/sync — fetch fresh data from external APIs
// Body: { profileId: "..." }  OR syncs all profiles if no profileId
router.post('/sync', async (req, res) => {
  const { profileId } = req.body;

  // Get profiles to sync (one specific or all)
  const where = profileId
    ? { id: profileId, userId: req.user.id }
    : { userId: req.user.id };

  const profiles = await prisma.cpProfile.findMany({ where });

  if (profiles.length === 0) {
    return res.status(404).json({ error: 'No profiles found' });
  }

  // Check sync cooldown — don't re-sync if synced in last 15 minutes
  const now = new Date();
  const COOLDOWN_MS = 15 * 60 * 1000;
  const profilesToSync = profiles.filter((p) => {
    if (!p.lastSyncAt) return true; // never synced
    return now - new Date(p.lastSyncAt) > COOLDOWN_MS;
  });

  if (profilesToSync.length === 0) {
    return res.json({ message: 'All profiles synced recently. Try again in 15 minutes.' });
  }

  // Start sync in background — respond immediately so client isn't waiting
  res.json({ message: `Syncing ${profilesToSync.length} profile(s)... Check back in 30 seconds.` });

  // This runs after response is sent
  for (const profile of profilesToSync) {
    const log = await prisma.syncLog.create({
      data: { profileId: profile.id, status: 'PENDING' },
    });

    try {
      if (profile.platform === 'CODEFORCES') {
        await syncCF(profile);
      } else if (profile.platform === 'LEETCODE') {
        await syncLC(profile);
      }

      await prisma.syncLog.update({
        where: { id: log.id },
        data: { status: 'SUCCESS' },
      });
      await prisma.cpProfile.update({
        where: { id: profile.id },
        data: { lastSyncAt: new Date() },
      });
    } catch (err) {
      console.error(`Sync failed for ${profile.username}:`, err.message);
      await prisma.syncLog.update({
        where: { id: log.id },
        data: { status: 'FAILED', error: err.message },
      });
    }
  }
});

// Sync Codeforces data for a profile
async function syncCF(profile) {
  const [ratingHistory, problems] = await Promise.all([
    cfService.getRatingHistory(profile.username),
    cfService.getSolvedProblems(profile.username),
  ]);

  // Upsert contests — insert or update if contestId already exists
  for (const contest of ratingHistory) {
    await prisma.contest.upsert({
      where: { profileId_contestId: { profileId: profile.id, contestId: contest.contestId } },
      update: { rank: contest.rank, ratingChange: contest.ratingChange, ratingAfter: contest.ratingAfter },
      create: { profileId: profile.id, platform: 'CODEFORCES', ...contest },
    });
  }

  // Upsert problems
  for (const problem of problems) {
    await prisma.problem.upsert({
      where: { profileId_slug: { profileId: profile.id, slug: problem.slug } },
      update: {},
      create: { profileId: profile.id, platform: 'CODEFORCES', ...problem },
    });
  }
}

// Sync LeetCode data for a profile
async function syncLC(profile) {
  const [contests, problems] = await Promise.all([
    lcService.getContestHistory(profile.username),
    lcService.getRecentSolvedProblems(profile.username),
  ]);

  for (const contest of contests) {
    await prisma.contest.upsert({
      where: { profileId_contestId: { profileId: profile.id, contestId: contest.contestId } },
      update: { rank: contest.rank, ratingAfter: contest.ratingAfter, solvedCount: contest.solvedCount },
      create: { profileId: profile.id, platform: 'LEETCODE', ...contest },
    });
  }

  for (const problem of problems) {
    await prisma.problem.upsert({
      where: { profileId_slug: { profileId: profile.id, slug: problem.slug } },
      update: {},
      create: { profileId: profile.id, platform: 'LEETCODE', ...problem },
    });
  }
}

// DELETE /api/profiles/:id — unlink a platform
router.delete('/:id', async (req, res) => {
  try {
    await prisma.cpProfile.deleteMany({
      where: { id: req.params.id, userId: req.user.id }, // userId check prevents deleting others' profiles
    });
    res.json({ message: 'Profile unlinked' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unlink profile' });
  }
});

module.exports = router;
