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

interface BarChartHorizontalWithTitleProps {
  labels: string[]
  datasets: any[]
  tickColor?: string
  titleText: string
}

const BarChartHorizontalWithTitle: FC<BarChartHorizontalWithTitleProps> = ({
  labels,
  datasets,
  tickColor,
  titleText,
}) => {
  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      bar: {
        borderWidth: 0,
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
          stepSize: 2,
          color: tickColor,
          font: {
            size: 14,
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
    plugins: {
      legend: {
        position: 'bottom' as const,
        display: false,
      },
      title: {
        display: true,
        text: titleText,
        font: {
          size: 16,
        },
        padding: {
          top: 0,
          bottom: 4,
        },
      },
    },
  }

  const data = {
    labels,
    datasets,
  }

  return <Bar data={data} options={options} />
}

export default BarChartHorizontalWithTitle
