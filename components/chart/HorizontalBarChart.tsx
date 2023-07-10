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
import { convertToHumanReadable } from '../../lib/queueManager'
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface BarChartHorizontalProps {
  labels: string[]
  datasets: any[]
  titleText: string
}

const BarChartHorizontal: FC<BarChartHorizontalProps> = ({ labels, datasets, titleText }) => {
  const options = {
    indexAxis: 'y' as const,
    elements: {
      bar: {
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        display: false,
        stacked: true,
      },
      x: {
        display: false,
      },
    },
    responsive: true,
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
        labels: {
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: titleText,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const originalValue = context.dataset.data[context.dataIndex]
            const formattedValue = convertToHumanReadable(originalValue)

            return `${context.dataset.label}: ${formattedValue}`
          },
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

export default BarChartHorizontal
