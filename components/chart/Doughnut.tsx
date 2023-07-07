import React from 'react'
import { FC } from 'react'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface DoughnutChartProps {
  labels: string[]
  datasets: any[]
  titleText: string
}

const DoughnutChart: FC<DoughnutChartProps> = ({ labels, datasets, titleText }) => {
  const options = {
    responsive: true,
    layout: {
      padding: {
        top: 20,
        bottom: 20,
      },
    },
    plugins: {
      legend: {
        position: 'right' as 'right',
        labels: {
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          title: function (tooltipItem: any) {
            return ''
          },
          label: function (context: any) {
            const value = context.parsed ? context.parsed : 0
            return value.toFixed(2) + '%'
          },
        },
      },
      title: {
        display: true,
        text: titleText,
        font: {
          size: 16,
        },
      },
    },
  }

  const data = {
    labels,
    datasets,
  }

  return <Doughnut data={data} options={options} />
}

export default DoughnutChart
