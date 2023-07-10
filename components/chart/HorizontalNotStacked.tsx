import { FC } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface BarChartHorizontalNotStackedProps {
  labels: string[]
  datasets: any[]
  tickColor?: string
}

const BarChartHorizontalNotStacked: FC<BarChartHorizontalNotStackedProps> = ({
  labels,
  datasets,
  tickColor
}) => {
  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      bar: {
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          stepSize: 1,
          color: tickColor,
          font:{
            size:14,
          },
        },
      },
      x: {
        display: false,
        grid: {
          display: false,
        },
      },
    },
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        right: 0,
      },
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        display: false,
      },
      title: {
        display: false,
      },
    },
  }

  const data = {
    labels,
    datasets,
  }

  return <Bar data={data} options={options} />
}

export default BarChartHorizontalNotStacked
