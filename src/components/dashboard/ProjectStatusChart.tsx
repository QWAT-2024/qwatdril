import React from 'react';
import { Chart } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarController,
  BarElement, 
  LineController,
  LineElement, 
  PointElement, 
  Title, 
  Tooltip, 
  Legend,
  // =======================================================
  // STEP 1: MAKE SURE 'Filler' IS IMPORTED FROM 'chart.js'
  // =======================================================
  Filler 
} from 'chart.js';

// ====================================================================
// STEP 2: MAKE SURE THE 'Filler' PLUGIN IS REGISTERED WITH ChartJS
// ====================================================================
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarController,
  BarElement, 
  LineController,
  LineElement, 
  PointElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler // <-- It must be included here
);

// Define a clear structure for the project data
interface ProjectData {
  name: string;
  progress: number; // For the bar height
  waveValue: number; // For the background wave
}

interface ProjectStatusChartProps {
  projects: ProjectData[];
}

const ProjectStatusChart: React.FC<ProjectStatusChartProps> = ({ projects }) => {
  
  // STEP 3: (Optional but recommended) Add a log to check your data
  // console.log("Projects data received by chart:", projects);

  const data = {
    labels: projects.map(p => p.name),
    datasets: [
      {
        type: 'line' as const,
        label: 'Background Wave',
        data: projects.map(p => p.waveValue),
        backgroundColor: 'rgba(173, 216, 230, 0.5)',
        borderColor: 'transparent',
        // 'fill: true' requires the Filler plugin to work
        fill: true, 
        tension: 0.4,
        pointRadius: 0,
        order: 2,
      },
      {
        type: 'bar' as const,
        label: 'Progress',
        data: projects.map(p => p.progress),
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;

          if (!chartArea) {
            return 'rgba(0, 102, 255, 1)';
          }
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(0, 102, 255, 1)');
          gradient.addColorStop(1, 'rgba(0, 191, 255, 1)');
          return gradient;
        },
        borderWidth: 0,
        barPercentage: 0.4,
        categoryPercentage: 0.5,
        order: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(200, 200, 200, 0.2)' },
        border: { display: false },
      },
      x: {
        grid: { display: false },
      },
    },
    plugins: {
        legend: { display: false }
    }
  };

  return (
    <div style={{ height: '250px', width: '100%' }}>
      <Chart type='bar' data={data} options={options} />
    </div>
  );
};

export default ProjectStatusChart;
