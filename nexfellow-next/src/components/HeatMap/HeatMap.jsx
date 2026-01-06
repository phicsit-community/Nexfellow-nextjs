import React, { useState, useEffect, useRef } from "react";
import styles from "./HeatMap.module.css";
import api from "../../lib/axios";
import { ActivityGraph } from "./ActivityCalendar";
import { useMediaQuery } from "react-responsive";

const HeatMapComponent = ({ year, className, style, communityId }) => {
  const [heatMapData, setHeatMapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Media queries for responsive design
  const isMobile = useMediaQuery({ maxWidth: 480 });
  const isTablet = useMediaQuery({ minWidth: 481, maxWidth: 768 });

  // Calculate blockMargin based on screen size
  const getBlockMargin = () => {
    if (isMobile) return 3;
    if (isTablet) return 3;
    return 3;
  };

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth(); // Initial width

    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Fetch heatmap data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/discussions/heatmap/${communityId}`);
        if (response.status != 200) {
          throw new Error("Failed to fetch heatmap data");
        }
        const data = response.data;
        // Transform data to include level property
        const transformedData = data.map((item) => {
          let level = 0;
          if (item.count >= 1 && item.count <= 9) level = 1;
          else if (item.count >= 10 && item.count <= 19) level = 2;
          else if (item.count >= 20 && item.count <= 29) level = 3;
          else if (item.count >= 30) level = 4;

          return {
            date: item.date,
            count: item.count,
            level: level,
          };
        });
        setHeatMapData(transformedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [communityId]);

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className}`}
      style={style}
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 w-full">
        <h4 className={styles.title}>Discussion Heatmap</h4>
      </div>
      <div className="w-full flex  justify-center overflow-x-auto no-scrollbar">
        <ActivityGraph
          activities={heatMapData}
          blockMargin={getBlockMargin()}
          lightColorPalette={[
            "#eee", // No activities
            "#a7e9ea", // 1–9 activities (lighter shade of #24b2b4)
            "#6dd7d8", // 10–19 activities (light shade of #24b2b4)
            "#24b2b4", // 20–29 activities (main theme color)
            "#178f91", // 30+ activities (darker shade of #24b2b4)
          ]}
          darkColorPalette={[
            "#161b22", // No activities
            "#0e4e4f", // 1–9 activities
            "#177e80", // 10–19 activities
            "#24b2b4", // 20–29 activities
            "#7adcdd", // 30+ activities
          ]}
          containerWidth={containerWidth}
        />
      </div>
    </div>
  );
};

export default HeatMapComponent;
