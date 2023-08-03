import React, { FC } from 'react'
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
import { getRandomColor } from '../../lib/queueManager'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface BarChartHorizontalNoLabelsProps {
  datasets: any[]
  titleText: string
}

// type Align = 'start' | 'center' | 'end' | 'left' | 'right' | 'top' | 'bottom' | number | ((context: any) => Align);

const BarChartHorizontalNoLabels: FC<BarChartHorizontalNoLabelsProps> = ({
  datasets,
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
          font: {
            size: 14,
          },
          //   mirror:true,
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
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const value = context.parsed ? context.parsed : 0
            // return `${value.y}: ${value.x.toFixed(2)}%`;
            return `${value.x.toFixed(2)}%`
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
    labels: datasets.map((dataset) => dataset.label),
    datasets: [
      {
        data: datasets.map((dataset) => dataset.data[0]),
        backgroundColor: datasets.map((dataset, index) => getRandomColor(index)),
      },
    ],
  }

  return <Bar data={data} options={options} />
}

export default BarChartHorizontalNoLabels
