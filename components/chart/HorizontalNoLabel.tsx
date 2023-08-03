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
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartDataLabels, Title, Tooltip, Legend)

interface BarChartHorizontalNoLabelsProps {
  datasets: any[]
  titleText: string
  queuedata: any
}

// type Align = 'start' | 'center' | 'end' | 'left' | 'right' | 'top' | 'bottom' | number | ((context: any) => Align);

const BarChartHorizontalNoLabels: FC<BarChartHorizontalNoLabelsProps> = ({
  datasets,
  titleText,
  queuedata,
}) => {
  const validQueueData = queuedata || []

  const queueDataMap: { [label: string]: any } = {}
  if (Array.isArray(validQueueData)) {
    validQueueData.forEach((data) => {
      queueDataMap[data.label] = data
    })
  }

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      bar: {
        borderWidth: 0,
        borderRadius: 10,
      },
    },
    scales: {
      y: {
        // display: false,
        display: true,

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
      datalabels: {
        color: 'white',
        font: {
          size: 14,
        },
        formatter: (value: any, context: any) => {
          const queueLabel = context.chart.data.labels[context.dataIndex]
          const queueData = queueDataMap[queueLabel]

          if (queueData) {
            const originalValue = queueData.originalData[0] || 0
            return originalValue.toString()
          }

          return ''
        },
        display: 'auto',
      },
    },
    //max height for graph bars
    maxBarThickness: 50,
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

  return <Bar data={data} plugins={[ChartDataLabels]} options={options} />
}

export default BarChartHorizontalNoLabels
