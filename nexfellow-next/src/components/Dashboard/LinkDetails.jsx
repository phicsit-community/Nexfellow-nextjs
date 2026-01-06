import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import api from "../../lib/axios";
import {
  FaMapMarkerAlt,
  FaGlobe,
  FaExternalLinkAlt,
  FaCopy,
  FaCalendarAlt,
} from "react-icons/fa";
import { toast } from "sonner";
import styles from "./LinkDetails.module.css";

const LinkDetails = ({ link }) => {
  const [linkStats, setLinkStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (link) {
      fetchLinkStats();
    }
  }, [link]);

  const fetchLinkStats = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/stats/${link.shortCode}`);
      setLinkStats(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching link statistics:", err);
      setError("Failed to load link statistics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(link.shortUrl);
    toast.success("Link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Loading link statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
        <button onClick={fetchLinkStats} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  // Group click details by country
  const clicksByCountry = linkStats?.clickDetails?.reduce((acc, click) => {
    const country = click.country || "Unknown";
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {});

  // Convert to array and sort by count
  const countrySortedData = Object.entries(clicksByCountry || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5); // Top 5 countries

  // Group by browser (derived from user agent)
  const clicksByBrowser = linkStats?.clickDetails?.reduce((acc, click) => {
    const userAgent = click.userAgent || "";
    let browser = "Unknown";

    if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Safari") && !userAgent.includes("Chrome"))
      browser = "Safari";
    else if (userAgent.includes("Edge")) browser = "Edge";
    else if (userAgent.includes("Opera")) browser = "Opera";

    acc[browser] = (acc[browser] || 0) + 1;
    return acc;
  }, {});

  // Convert to array and sort by count
  const browserSortedData = Object.entries(clicksByBrowser || {}).sort(
    ([, a], [, b]) => b - a
  );

  // Group by referrer
  const clicksByReferrer = linkStats?.clickDetails?.reduce((acc, click) => {
    const referrer =
      click.referrer === "Direct"
        ? "Direct"
        : click.referrer
        ? new URL(click.referrer).hostname
        : "Unknown";
    acc[referrer] = (acc[referrer] || 0) + 1;
    return acc;
  }, {});

  // Convert to array and sort by count
  const referrerSortedData = Object.entries(clicksByReferrer || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5); // Top 5 referrers

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.linkBox}>
          <div className={styles.linkUrl}>
            <span>{linkStats?.shortUrl || link.shortUrl}</span>
            <button className={styles.copyButton} onClick={handleCopyLink}>
              <FaCopy />
            </button>
          </div>
          <a
            href={linkStats?.originalUrl || link.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.originalLink}
          >
            {linkStats?.originalUrl || link.originalUrl} <FaExternalLinkAlt />
          </a>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaGlobe />
          </div>
          <div className={styles.statContent}>
            <h3>{linkStats?.clicks || 0}</h3>
            <p>Total Clicks</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaCalendarAlt />
          </div>
          <div className={styles.statContent}>
            <h3>
              {linkStats?.createdAt
                ? format(new Date(linkStats.createdAt), "MMM dd, yyyy")
                : format(new Date(link.createdAt), "MMM dd, yyyy")}
            </h3>
            <p>Created Date</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaMapMarkerAlt />
          </div>
          <div className={styles.statContent}>
            <h3>{Object.keys(clicksByCountry || {}).length}</h3>
            <p>Countries</p>
          </div>
        </div>
      </div>

      <div className={styles.chartsContainer}>
        {/* Country Chart */}
        {countrySortedData.length > 0 && (
          <div className={styles.chartCard}>
            <h3>
              <FaMapMarkerAlt /> Top Countries
            </h3>
            <div className={styles.barChart}>
              {countrySortedData.map(([country, count], index) => (
                <div key={index} className={styles.barChartItem}>
                  <div className={styles.barLabel}>{country}</div>
                  <div className={styles.barWrapper}>
                    <div
                      className={styles.bar}
                      style={{
                        width: `${(count / linkStats.clicks) * 100}%`,
                        backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
                      }}
                    ></div>
                    <span className={styles.barValue}>{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Browser Chart */}
        {browserSortedData.length > 0 && (
          <div className={styles.chartCard}>
            <h3>
              <FaGlobe /> Browsers
            </h3>
            <div className={styles.barChart}>
              {browserSortedData.map(([browser, count], index) => (
                <div key={index} className={styles.barChartItem}>
                  <div className={styles.barLabel}>{browser}</div>
                  <div className={styles.barWrapper}>
                    <div
                      className={styles.bar}
                      style={{
                        width: `${(count / linkStats.clicks) * 100}%`,
                        backgroundColor: `hsl(${index * 60 + 180}, 70%, 50%)`,
                      }}
                    ></div>
                    <span className={styles.barValue}>{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Referrer Chart */}
        {referrerSortedData.length > 0 && (
          <div className={styles.chartCard}>
            <h3>
              <FaExternalLinkAlt /> Top Referrers
            </h3>
            <div className={styles.barChart}>
              {referrerSortedData.map(([referrer, count], index) => (
                <div key={index} className={styles.barChartItem}>
                  <div className={styles.barLabel}>{referrer}</div>
                  <div className={styles.barWrapper}>
                    <div
                      className={styles.bar}
                      style={{
                        width: `${(count / linkStats.clicks) * 100}%`,
                        backgroundColor: `hsl(${index * 60 + 120}, 70%, 50%)`,
                      }}
                    ></div>
                    <span className={styles.barValue}>{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Clicks Table */}
      {linkStats?.clickDetails?.length > 0 && (
        <div className={styles.recentClicks}>
          <h3>Recent Clicks</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.clicksTable}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Referrer</th>
                </tr>
              </thead>
              <tbody>
                {linkStats.clickDetails.slice(0, 10).map((click, index) => (
                  <tr key={index}>
                    <td>
                      {format(new Date(click.timestamp), "MMM dd, yyyy HH:mm")}
                    </td>
                    <td>
                      {click.city && click.country
                        ? `${click.city}, ${click.country}`
                        : click.country || "Unknown"}
                    </td>
                    <td>
                      {click.referrer === "Direct"
                        ? "Direct"
                        : click.referrer
                        ? new URL(click.referrer).hostname
                        : "Unknown"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkDetails;
