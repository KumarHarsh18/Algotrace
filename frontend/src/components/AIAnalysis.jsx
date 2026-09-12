import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { aiAPI } from '../api/client';
import './AIAnalysis.css';

export default function AIAnalysis() {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await aiAPI.analyzePerformance();

      setAnalysis(response.data.analysis);
    } catch (err) {
      console.error('AI Analysis Error:', err);
      setError('Failed to generate AI performance analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="ai-analysis">

      {/* Header */}
      <div className="ai-header">
        <div>
          <div className="ai-title">
            <span className="ai-icon">✦</span>
            <h2>AI Performance Coach</h2>
          </div>

          <p className="ai-subtitle">
            Personalized insights based on your competitive programming
            performance.
          </p>
        </div>

        <button
          className="ai-button"
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner" />
              Analyzing...
            </>
          ) : (
            <>
              <span>✨</span>
              Analyze My Performance
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="ai-error">
          <span>⚠</span>
          {error}
        </div>
      )}

      {/* Empty State */}
      {!analysis && !loading && !error && (
        <div className="ai-empty">
          <div className="ai-empty-icon">✦</div>

          <h3>Unlock your personalized analysis</h3>

          <p>
            Analyze your contests, solved problems, ratings and topics to
            discover where you can improve.
          </p>

          <div className="ai-features">
            <span>🎯 Strengths</span>
            <span>⚡ Weaknesses</span>
            <span>📚 Topics</span>
            <span>📅 7-Day Plan</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="ai-loading">
          <div className="loading-orb">
            <span>✦</span>
          </div>

          <h3>Analyzing your performance...</h3>

          <p>
            Studying your contest and problem-solving history.
          </p>
        </div>
      )}

      {/* Result */}
      {analysis && !loading && (
        <div className="ai-result">

          {/* Result Header */}
          <div className="result-header">
            <div>
              <span className="result-badge">AI INSIGHTS</span>
              <h3>Your Performance Analysis</h3>
            </div>

            <button
              className="reanalyze-button"
              onClick={handleAnalyze}
            >
              ↻ Re-analyze
            </button>
          </div>

          {/* Render Gemini Markdown */}
          <div className="analysis-content">
            <ReactMarkdown
              components={{
                h3: ({ children }) => (
                  <h3 className="analysis-section-title">
                    {children}
                  </h3>
                ),

                ul: ({ children }) => (
                  <ul className="analysis-list">
                    {children}
                  </ul>
                ),

                ol: ({ children }) => (
                  <ol className="analysis-list numbered">
                    {children}
                  </ol>
                ),

                blockquote: ({ children }) => (
                  <div className="analysis-tip">
                    {children}
                  </div>
                ),

                table: ({ children }) => (
                  <div className="analysis-table-wrapper">
                    <table>{children}</table>
                  </div>
                ),

                th: ({ children }) => (
                  <th>{children}</th>
                ),

                td: ({ children }) => (
                  <td>{children}</td>
                ),

                strong: ({ children }) => (
                  <strong>{children}</strong>
                ),
              }}
            >
              {analysis}
            </ReactMarkdown>
          </div>

        </div>
      )}

    </section>
  );
}