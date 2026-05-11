// src/components/charts/RatingChart.jsx
// Line chart showing rating history over time.
// Uses react-chartjs-2 which is the official React wrapper for Chart.js.

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components — required before use
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function RatingChart({ data }) {
  // Format dates as readable labels for x-axis
  const labels = data.map((d) =>
    new Date(d.timestamp).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Rating',
        data: data.map((d) => d.ratingAfter),
        borderColor: '#4f46e5',           // indigo line
        backgroundColor: 'rgba(79,70,229,0.08)', // very light fill under line
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
        tension: 0.3,  // slightly curved line — 0 = sharp, 1 = very curved
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // hide legend — it's obvious from context
      tooltip: {
        callbacks: {
          // Custom tooltip: show contest name + rating change
          title: (items) => data[items[0].dataIndex]?.contestName || '',
          afterLabel: (item) => {
            const d = data[item.dataIndex];
            if (d?.ratingChange == null) return '';
            return d.ratingChange >= 0 ? `+${d.ratingChange}` : `${d.ratingChange}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxTicksLimit: 12 }, // don't crowd x-axis labels
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { stepSize: 100 },
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
