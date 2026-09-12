const {
  getUserPerformanceStats,
} = require("../services/analyticsService");

const {
  generatePerformanceAnalysis,
} = require("../services/aiService");

const analyzePerformance = async (req, res) => {
  try {
    const userId = req.body.userId;

    // Get deterministic performance statistics from PostgreSQL
    const stats = await getUserPerformanceStats(userId);

    // Ask Gemini to interpret the statistics
    const analysis = await generatePerformanceAnalysis(stats);

    return res.status(200).json({
      success: true,
      stats,
      analysis,
    });
  } catch (error) {
    console.error("AI Performance Analysis Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate AI performance analysis",
    });
  }
};

module.exports = {
  analyzePerformance,
};