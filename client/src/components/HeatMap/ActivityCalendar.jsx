"use client";

import { ActivityCalendar } from "react-activity-calendar";
import { cloneElement, memo, useCallback, useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
// import "react-tooltip/dist/react-tooltip.min.css";

const DEFAULT_LIGHT_PALETTE = [
  "#ebedf0",
  "#9be9a8",
  "#40c463",
  "#30a14e",
  "#216e39",
];

const DEFAULT_DARK_PALETTE = [
  "#1e1e2f",
  "#5a3e7a",
  "#7e5aa2",
  "#a87cc3",
  "#d9a9e6",
];

/**
 * Activity contribution graph component that displays user's contribution activity
 */
export const ActivityGraph = memo(
  ({
    activities = [],
    blockMargin,
    lightColorPalette = DEFAULT_LIGHT_PALETTE,
    darkColorPalette = DEFAULT_DARK_PALETTE,
    showTooltips = true,
    containerWidth,
  }) => {
    const [activity, setActivity] = useState([]);
    const [loading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fontSize, setFontSize] = useState(14);

    // Calculate font size based on container width
    useEffect(() => {
      if (containerWidth) {
        if (containerWidth < 400) {
          setFontSize(10);
        } else if (containerWidth < 768) {
          setFontSize(12);
        } else {
          setFontSize(14);
        }
      }
    }, [containerWidth]);

    const fetchData = useCallback(async () => {
      try {
        setError(null);
        setIsLoading(true);
        setActivity(activities);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch message data"
        );
        setActivity([]);
      } finally {
        setIsLoading(false);
      }
    }, [activities]);

    useEffect(() => {
      fetchData();
    }, [fetchData]);

    const label = {
      totalCount: `{{count}} messages in ${new Date().getFullYear()}`,
    };

    if (error) {
      return <div className="text-red-500 p-4 text-center">Error: {error}</div>;
    }

    return (
      <div className="relative w-full no-scrollbar">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        )}
        <div className="w-full overflow-x-auto pb-4">
          <ActivityCalendar
            data={activity}
            maxLevel={4}
            blockMargin={blockMargin ?? 2}
            loading={loading}
            labels={label}
            fontSize={fontSize}
            theme={{
              light: lightColorPalette,
              dark: darkColorPalette,
            }}
            className="no-scrollbar"
            colorScheme={"light"}
            renderBlock={(block, activity) =>
              cloneElement(block, {
                "data-tooltip-id": "activity-tooltip",
                "data-tooltip-html": `${activity.count} messages on ${activity.date}`,
              })
            }
          />
        </div>
        {showTooltips && (
          <Tooltip
            id="activity-tooltip"
            style={{
              zIndex: 1000,
              fontSize: fontSize,
              // maxWidth: "200px",
            }}
          />
        )}
      </div>
    );
  }
);

ActivityGraph.displayName = "ActivityGraph";
