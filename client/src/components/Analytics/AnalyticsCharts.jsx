import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import styles from './AnalyticsCharts.module.css';

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Renders a bar chart showing checkpoint completion statistics
 * @param {Object} props - Component props
 * @param {Array} props.data - Checkpoint completion data
 * @param {boolean} props.loading - Loading state
 */
export const CheckpointCompletionChart = ({ data, loading }) => {
  const [chartInstance, setChartInstance] = useState(null);
  
  // Responsive handling
  useEffect(() => {
    const handleResize = () => {
      if (chartInstance) {
        chartInstance.resize();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [chartInstance]);

  if (loading) {
    return <div className={styles.loadingChart}>Loading checkpoint data...</div>;
  }

  if (!data || data.length === 0) {
    return <div className={styles.emptyChart}>No checkpoint data available</div>;
  }

  const chartData = {
    labels: data.map(checkpoint => {
      // Truncate long titles for mobile
      const title = checkpoint.title;
      return window.innerWidth <= 480 && title.length > 10 
        ? `${title.substring(0, 10)}...` 
        : title;
    }),
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: data.map(checkpoint => checkpoint.completionRate),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        display: window.innerWidth > 480, // Hide legend on mobile
      },
      title: {
        display: true,
        text: 'Checkpoint Completion Rates',
        font: {
          size: window.innerWidth <= 480 ? 14 : 16,
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            const completionCount = data[index].completionCount;
            return [
              `Completion Rate: ${context.parsed.y}%`,
              `Completed by: ${completionCount} participants`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: window.innerWidth > 480,
          text: 'Completion Rate (%)',
          font: {
            size: window.innerWidth <= 768 ? 12 : 14,
          }
        },
        ticks: {
          font: {
            size: window.innerWidth <= 480 ? 10 : 12,
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: window.innerWidth <= 480 ? 10 : 12,
          }
        }
      }
    }
  };

  return (
    <div className={styles.chartContainer}>
      <Bar 
        data={chartData} 
        options={options} 
        onLoad={(chart) => setChartInstance(chart)}
      />
    </div>
  );
};

/**
 * Renders a line chart showing daily activity data over time
 * @param {Object} props - Component props
 * @param {Array} props.submissions - Daily submission data
 * @param {Array} props.participants - Daily participant data
 * @param {boolean} props.loading - Loading state
 */
export const DailyActivityChart = ({ submissions, participants, loading }) => {
  const [chartInstance, setChartInstance] = useState(null);
  
  // Responsive handling
  useEffect(() => {
    const handleResize = () => {
      if (chartInstance) {
        chartInstance.resize();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [chartInstance]);
  
  if (loading) {
    return <div className={styles.loadingChart}>Loading activity data...</div>;
  }

  if ((!submissions || submissions.length === 0) && (!participants || participants.length === 0)) {
    return <div className={styles.emptyChart}>No activity data available</div>;
  }

  // Get unique dates from both datasets
  const allDates = new Set([
    ...(submissions || []).map(item => item._id),
    ...(participants || []).map(item => item._id)
  ]);
  
  // Convert to array and sort
  const sortedDates = Array.from(allDates).sort();
  
  // Format dates for display
  const formatDateLabels = (dateStr) => {
    const date = new Date(dateStr);
    // For mobile screens, use shorter format
    if (window.innerWidth <= 480) {
      return date.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
    }
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Create datasets
  const chartData = {
    labels: sortedDates.map(formatDateLabels),
    datasets: [
      {
        label: 'Submissions',
        data: sortedDates.map(date => {
          const entry = submissions?.find(item => item._id === date);
          return entry ? entry.count : 0;
        }),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
      },
      {
        label: 'New Participants',
        data: sortedDates.map(date => {
          const entry = participants?.find(item => item._id === date);
          return entry ? entry.count : 0;
        }),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.4,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        display: window.innerWidth > 480, // Hide legend on mobile
        labels: {
          font: {
            size: window.innerWidth <= 768 ? 12 : 14,
          }
        }
      },
      title: {
        display: true,
        text: 'Daily Challenge Activity',
        font: {
          size: window.innerWidth <= 480 ? 14 : 16,
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: window.innerWidth > 480,
          text: 'Count',
          font: {
            size: window.innerWidth <= 768 ? 12 : 14,
          }
        },
        ticks: {
          font: {
            size: window.innerWidth <= 480 ? 10 : 12,
          }
        }
      },
      x: {
        title: {
          display: window.innerWidth > 480,
          text: 'Date',
          font: {
            size: window.innerWidth <= 768 ? 12 : 14,
          }
        },
        ticks: {
          font: {
            size: window.innerWidth <= 480 ? 10 : 12,
          },
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  return (
    <div className={styles.chartContainer}>
      <Line 
        data={chartData} 
        options={options} 
        onLoad={(chart) => setChartInstance(chart)}
      />
    </div>
  );
};
