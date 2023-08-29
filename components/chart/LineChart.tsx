import React from 'react'
import { FC } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface LineChartProps {
    labels: string[]
    datasets: any[]
  }
  
  const LineChart: FC<LineChartProps> = ({ labels, datasets }) => {
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          //Add space at the top of the chart
          grace:'5%'
        },
      },
      plugins: {
        legend: {
          position: 'bottom' as const,
        },
        title: {
          display: true,
          // text: 'Chart.js Bar Chart',
        },
      },
    }
  
    const data = {
      labels,
      datasets,
    }
  
    return <Line data={data} options={options} />
  }
  
  export default LineChart
