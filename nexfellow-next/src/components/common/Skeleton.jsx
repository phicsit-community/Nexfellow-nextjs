import React from "react";
import "./Skeleton.css";

const Skeleton = ({ type, count = 1, className = "" }) => {
  const renderSkeleton = () => {
    const skeletons = [];

    for (let i = 0; i < count; i++) {
      skeletons.push(
        <div key={i} className={`skeleton ${type} ${className}`}>
          <div className="shimmer"></div>
        </div>
      );
    }

    return skeletons;
  };

  return <>{renderSkeleton()}</>;
};

export default Skeleton;
