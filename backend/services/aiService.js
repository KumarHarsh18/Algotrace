const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generatePerformanceAnalysis(stats) {
  const prompt = `
You are an expert competitive programming coach.

Analyze the following competitive programming performance data.

Performance data:
${JSON.stringify(stats, null, 2)}

Provide:
1. Strengths
2. Weaknesses
3. Recommended topics to improve
4. A practical 7-day practice plan

Keep the recommendations specific to the user's data.
Do not invent statistics that are not present in the provided data.
`;

 const response = await ai.models.generateContent({
    model: "gemini-3.7-flash",
    contents: prompt,
  });

  return response.text;
}

module.exports = {
  generatePerformanceAnalysis,
};