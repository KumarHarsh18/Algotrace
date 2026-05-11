// src/components/charts/TopicsChart.jsx
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function TopicsChart({ data }) {
  const chartData = {
    labels: data.map((d) => d.tag),
    datasets: [{
      label: 'Problems solved',
      data: data.map((d) => d.count),
      backgroundColor: 'rgba(79,70,229,0.7)',
      borderRadius: 4,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // horizontal bar chart — easier to read tag names
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { display: false }, ticks: { font: { size: 11 } } },
    },
  };

  return (
    <div style={{ height: '320px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
