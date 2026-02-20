import React, { useEffect, useState } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import styles from './AnalyticsCharts.module.css';

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Participation Growth - Area chart (teal + green areas)
 */
export const ParticipationGrowthChart = ({ data, loading }) => {
  if (loading) return <div className={styles.loadingChart}>Loading...</div>;

  const labels = data?.labels || [];
  const totalData = data?.total || [];
  const activeData = data?.active || [];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Total Participants',
        data: totalData,
        borderColor: '#19AE9F',
        backgroundColor: 'rgba(20, 219, 219, 0.4)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 1,
      },
      {
        label: 'Active Participants',
        data: activeData,
        borderColor: '#36E27E',
        backgroundColor: 'rgba(54, 226, 126, 0.6)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 160,
        ticks: {
          stepSize: 40,
          color: '#64748B',
          font: { size: 11, family: 'Inter' },
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
          drawBorder: false,
          borderDash: [4, 4],
        },
        border: { display: false },
      },
      x: {
        ticks: {
          color: '#64748B',
          font: { size: 11, family: 'Inter' },
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
          drawBorder: false,
          borderDash: [4, 4],
        },
        border: { display: false },
      },
    },
  };

  return (
    <div className={styles.chartContainer}>
      <Line data={chartData} options={options} />
    </div>
  );
};

/**
 * Daily Submissions - Bar chart (teal bars)
 */
export const DailySubmissionsChart = ({ data, loading }) => {
  if (loading) return <div className={styles.loadingChart}>Loading...</div>;

  const labels = data?.labels || [];
  const submissionData = data?.values || [];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Submissions',
        data: submissionData,
        backgroundColor: '#19AE9F',
        borderRadius: 2,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 15,
          color: '#64748B',
          font: { size: 11, family: 'Inter' },
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
          drawBorder: false,
          borderDash: [4, 4],
        },
        border: { display: false },
      },
      x: {
        ticks: {
          color: '#64748B',
          font: { size: 11, family: 'Inter' },
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
          drawBorder: false,
          borderDash: [4, 4],
        },
        border: { display: false },
      },
    },
  };

  return (
    <div className={styles.chartContainer}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

/**
 * Progress Trends - Line chart with dots
 */
export const ProgressTrendsChart = ({ data, loading }) => {
  if (loading) return <div className={styles.loadingChart}>Loading...</div>;

  const labels = data?.labels || [];
  const progressData = data?.values || [];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Progress',
        data: progressData,
        borderColor: '#19AE9F',
        backgroundColor: '#19AE9F',
        pointBackgroundColor: '#19AE9F',
        pointBorderColor: '#19AE9F',
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 3,
        tension: 0.3,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 80,
        ticks: {
          stepSize: 20,
          color: '#64748B',
          font: { size: 11, family: 'Inter' },
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
          drawBorder: false,
          borderDash: [4, 4],
        },
        border: { display: false },
      },
      x: {
        ticks: {
          color: '#64748B',
          font: { size: 11, family: 'Inter' },
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
          drawBorder: false,
          borderDash: [4, 4],
        },
        border: { display: false },
      },
    },
  };

  return (
    <div className={styles.chartContainer}>
      <Line data={chartData} options={options} />
    </div>
  );
};

/**
 * Hourly Engagement - Area chart (teal gradient fill)
 */
export const HourlyEngagementChart = ({ data, loading }) => {
  if (loading) return <div className={styles.loadingChart}>Loading...</div>;

  const labels = data?.labels || [];
  const engagementData = data?.values || [];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Activity',
        data: engagementData,
        borderColor: '#36E2DF',
        backgroundColor: 'rgba(54, 226, 203, 0.6)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 80,
        ticks: {
          stepSize: 20,
          color: '#666',
          font: { size: 15, family: 'Inter' },
        },
        grid: {
          color: '#CCCCCC',
          drawBorder: false,
          borderDash: [4, 4],
        },
        border: { display: false },
      },
      x: {
        ticks: {
          color: '#666',
          font: { size: 15, family: 'Inter' },
          maxTicksLimit: 7,
        },
        grid: {
          color: '#CCCCCC',
          drawBorder: false,
          borderDash: [4, 4],
        },
        border: { display: false },
      },
    },
  };

  return (
    <div className={styles.chartContainerLarge}>
      <Line data={chartData} options={options} />
    </div>
  );
};

/**
 * Reward Distribution - Doughnut/Pie chart
 */
export const RewardDistributionChart = ({ data, loading }) => {
  if (loading) return <div className={styles.loadingChart}>Loading...</div>;

  const chartData = {
    labels: data?.labels && data.labels.length > 0 ? data.labels : ['Bronze Tier', 'Silver Tier', 'Gold Tier', 'Platinum Tier'],
    datasets: [
      {
        data: data?.values && data.values.length > 0 ? data.values : [45, 28, 15, 12],
        backgroundColor: ['#08AAA2', '#C0C0C0', '#28C7C9', '#E5E4E2'],
        borderColor: '#FFFFFF',
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '55%',
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 0,
        right: 0
      }
    },
    plugins: {
      datalabels: {
        display: false, // In case a global datalabels plugin is drawing lines
      },
      outlabels: {
        display: false,
      },
      legend: {
        display: true,
        position: 'right',
        align: 'center',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 24,
          color: '#000000',
          font: { size: 14, family: 'Inter', weight: '500' },
          generateLabels: (chart) => {
            const ds = chart.data.datasets[0];
            const dataSum = ds.data.reduce((acc, val) => acc + val, 0);
            return chart.data.labels.map((label, i) => {
              const value = ds.data[i];
              const percentage = dataSum > 0 ? Math.round((value / dataSum) * 100) : 0;
              return {
                text: `${label} ${percentage}%`,
                fillStyle: ds.backgroundColor[i],
                strokeStyle: ds.backgroundColor[i],
                lineWidth: 0,
                hidden: false,
                index: i,
              };
            });
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const dataset = context.dataset;
            const dataSum = dataset.data.reduce((acc, val) => acc + val, 0);
            const value = context.raw;
            const percentage = dataSum > 0 ? Math.round((value / dataSum) * 100) : 0;
            return ` ${context.label}: ${percentage}%`;
          }
        }
      }
    },
  };

  return (
    <div className={styles.chartContainer} style={{ height: '300px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

/**
 * Legacy exports for backward compatibility
 */
export const CheckpointCompletionChart = ({ data, loading }) => {
  if (loading) return <div className={styles.loadingChart}>Loading checkpoint data...</div>;
  if (!data || data.length === 0) return <div className={styles.emptyChart}>No checkpoint data available</div>;

  const chartData = {
    labels: data.map(checkpoint => checkpoint.title),
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
      legend: { position: 'top' },
      title: { display: true, text: 'Checkpoint Completion Rates' },
    },
    scales: {
      y: { beginAtZero: true, max: 100, title: { display: true, text: 'Completion Rate (%)' } },
    },
  };

  return (
    <div className={styles.chartContainer}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export const DailyActivityChart = ({ submissions, participants, loading }) => {
  if (loading) return <div className={styles.loadingChart}>Loading activity data...</div>;
  if ((!submissions || submissions.length === 0) && (!participants || participants.length === 0)) {
    return <div className={styles.emptyChart}>No activity data available</div>;
  }

  const allDates = new Set([
    ...(submissions || []).map(item => item._id),
    ...(participants || []).map(item => item._id),
  ]);
  const sortedDates = Array.from(allDates).sort();

  const chartData = {
    labels: sortedDates.map(d => {
      const date = new Date(d);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Submissions',
        data: sortedDates.map(date => {
          const entry = submissions?.find(item => item._id === date);
          return entry ? entry.count : 0;
        }),
        borderColor: '#19AE9F',
        backgroundColor: 'rgba(25, 174, 159, 0.2)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'New Participants',
        data: sortedDates.map(date => {
          const entry = participants?.find(item => item._id === date);
          return entry ? entry.count : 0;
        }),
        borderColor: '#36E27E',
        backgroundColor: 'rgba(54, 226, 126, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Daily Challenge Activity' },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className={styles.chartContainer}>
      <Line data={chartData} options={options} />
    </div>
  );
};
