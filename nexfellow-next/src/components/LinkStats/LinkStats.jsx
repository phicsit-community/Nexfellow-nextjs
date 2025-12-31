"use client";

import React, { useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { format } from "date-fns";
import {
  FaExternalLinkAlt,
  FaCalendarAlt,
  FaGlobe,
  FaChartBar,
  FaCopy,
  FaMapMarkerAlt,
  FaLongArrowAltRight,
} from "react-icons/fa";
import { toast } from "sonner";
import { getIpAddress, getLocationByIp } from "../../utils/ipUtils";

import styles from "./LinkStats.module.css";

const LinkStats = () => {
  const params = useParams();
  const shortCode = params?.shortCode;
  const [linkData, setLinkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redirecting, setRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(1.5);
  const [originalUrl, setOriginalUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    let countdownInterval;
    let progressInterval;

    if (redirecting) {
      // Start countdown
      countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 0.1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);

      // Animate progress bar
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 100 / 15; // Complete in ~1.5 seconds (15 steps)
        });
      }, 100);
    }

    return () => {
      clearInterval(countdownInterval);
      clearInterval(progressInterval);
    };
  }, [redirecting]);

  useEffect(() => {
    const fetchLinkData = async () => {
      try {
        setLoading(true);

        // Check if there's a 'stats' query parameter or if this is a direct visit
        const showStats = false; // Default to false for direct visits

        // If this is a direct visit without the stats parameter, redirect to the original URL
        if (!showStats) {
          setRedirecting(true);

          try {
            // Get location data in the frontend
            const ipAddress = await getIpAddress();
            const locationData = await getLocationByIp(ipAddress);

            // Prepare click data to send to backend
            const clickData = {
              ip: ipAddress,
              userAgent: navigator.userAgent,
              referrer: document.referrer || "Direct",
              timestamp: new Date().toISOString(),
            };

            // Add location data if available
            if (locationData) {
              clickData.country = locationData.country_name;
              clickData.city = locationData.city;
              clickData.region = locationData.region;
              console.log(
                `Location detected: ${locationData.city}, ${locationData.country_name}`
              );
            }

            // Send the click data to backend and get redirect info
            const redirectResponse = await axios.post(
              `/link/${shortCode}/track`,
              clickData
            );

            if (redirectResponse.data && redirectResponse.data.originalUrl) {
              setOriginalUrl(redirectResponse.data.originalUrl);
              // Small delay to show the redirecting message
              setTimeout(() => {
                window.location.href = redirectResponse.data.originalUrl;
              }, 1500);
              return;
            }
          } catch (err) {
            console.error("Error handling redirect with tracking:", err);

            // Fallback to regular redirect if tracking fails
            try {
              const fallbackResponse = await axios.get(
                `/link/${shortCode}/redirect-info`
              );
              if (fallbackResponse.data && fallbackResponse.data.originalUrl) {
                setOriginalUrl(fallbackResponse.data.originalUrl);
                setTimeout(() => {
                  window.location.href = fallbackResponse.data.originalUrl;
                }, 1500);
                return;
              }
            } catch (fallbackErr) {
              console.error("Fallback redirect also failed:", fallbackErr);
              setError("Unable to redirect to the target URL");
              setRedirecting(false);
              setLoading(false);
            }
          }
        } else {
          // If we're not redirecting, load the stats data
          const response = await axios.get(`/stats/${shortCode}`);
          setLinkData(response.data);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching link data:", err);
        setError("This link was not found or has expired.");
        setLoading(false);
      }
    };

    if (shortCode) {
      fetchLinkData();
    }
  }, [shortCode]);

  const handleCopyLink = () => {
    if (linkData?.shortUrl) {
      // Add stats parameter when copying to make it open stats directly
      const statsUrl = `${window.location.href.split("?")[0]}`;
      navigator.clipboard.writeText(statsUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  if (redirecting) {
    return (
      <div className={styles.redirectingContainer}>
        <div className={styles.redirectCard}>
          <div className={styles.pulseLoader}></div>
          <h2>Redirecting you to:</h2>
          <div className={styles.urlPreview}>
            <FaExternalLinkAlt className={styles.linkIcon} />
            <p className={styles.targetUrl}>
              {originalUrl || "destination website"}
            </p>
          </div>

          <div className={styles.progressContainer}>
            <div
              className={styles.progressBar}
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className={styles.redirectInfo}>
            <p>You will be redirected in {countdown.toFixed(1)} seconds</p>
            <FaLongArrowAltRight className={styles.arrowIcon} />
          </div>
        </div>
      </div>
    );
  }

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
        <h2>Link Not Found</h2>
        <p>{error}</p>
        <Link href="/" className={styles.homeButton}>
          Go to Home
        </Link>
      </div>
    );
  }

  // Group click details by country
  const clicksByCountry = linkData?.clickDetails?.reduce((acc, click) => {
    const country = click.country || "Unknown";
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {});

  // Convert to array and sort by count
  const countrySortedData = Object.entries(clicksByCountry || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5); // Top 5 countries

  // Group by browser (derived from user agent)
  const clicksByBrowser = linkData?.clickDetails?.reduce((acc, click) => {
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
  const clicksByReferrer = linkData?.clickDetails?.reduce((acc, click) => {
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
        <h1>Link Statistics</h1>
        <div className={styles.linkBox}>
          <div className={styles.linkUrl}>
            <span>{window.location.href.split("?")[0]}</span>
            <button className={styles.copyButton} onClick={handleCopyLink}>
              <FaCopy />
            </button>
          </div>
          <a
            href={linkData?.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.originalLink}
          >
            {linkData?.originalUrl} <FaExternalLinkAlt />
          </a>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaChartBar />
          </div>
          <div className={styles.statContent}>
            <h3>{linkData?.clicks || 0}</h3>
            <p>Total Clicks</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaCalendarAlt />
          </div>
          <div className={styles.statContent}>
            <h3>
              {linkData?.createdAt
                ? format(new Date(linkData.createdAt), "MMM dd, yyyy")
                : "Unknown"}
            </h3>
            <p>Created Date</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaGlobe />
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
                        width: `${(count / linkData.clicks) * 100}%`,
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
                        width: `${(count / linkData.clicks) * 100}%`,
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
                        width: `${(count / linkData.clicks) * 100}%`,
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
      {linkData?.clickDetails?.length > 0 && (
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
                {linkData.clickDetails.slice(0, 10).map((click, index) => (
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

export default LinkStats;
