"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle, useState, Component } from "react";

// Validate if icon data is a valid Lottie animation
const isValidLottieData = (data) => {
  if (!data || typeof data !== 'object') return false;
  // Check for required lottie properties
  if (!data.v || !data.fr || !data.w || !data.h) return false;
  // Check for layers or assets (at least one should exist)
  if (!data.layers && !data.assets) return false;
  // Validate layers array if present
  if (data.layers && !Array.isArray(data.layers)) return false;
  return true;
};

// Error boundary to catch lottie render errors
class LottieErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn("Lottie animation error caught by boundary:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

// Wrapper class component to catch render errors
class LottieWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn("LottieWrapper caught error:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    const { LottieComponent, lottieRef, animationData, style, ...rest } = this.props;

    if (!LottieComponent) {
      return this.props.fallback;
    }

    return (
      <LottieComponent
        lottieRef={lottieRef}
        animationData={animationData}
        loop={false}
        autoplay={false}
        style={style}
        {...rest}
      />
    );
  }
}

const PlayOnce = forwardRef(
  ({ icon, play, staticIcon, style, size, ...props }, ref) => {
    const lottieRef = useRef(null);
    const [isClient, setIsClient] = useState(false);
    const [LottieLoaded, setLottieLoaded] = useState(null);

    useEffect(() => {
      setIsClient(true);
      // Dynamically import lottie-react only on client
      import("lottie-react").then((mod) => {
        setLottieLoaded(() => mod.default);
      }).catch((err) => {
        console.warn("Failed to load lottie-react:", err);
      });
    }, []);

    useImperativeHandle(ref, () => ({
      playFromBeginning: () => {
        if (lottieRef.current) {
          try {
            lottieRef.current.goToAndPlay(0);
          } catch (e) {
            console.warn("Error playing animation:", e);
          }
        }
      },
    }));

    useEffect(() => {
      if (play && lottieRef.current && typeof icon !== "string") {
        try {
          lottieRef.current.goToAndPlay(0);
        } catch (e) {
          console.warn("Error playing animation:", e);
        }
      }
    }, [play, icon]);

    // Fallback placeholder - simple empty div with same size
    const Placeholder = (
      <div
        style={{
          width: size || 24,
          height: size || 24,
          ...style
        }}
      />
    );

    // If icon is a GIF (string ending with .gif), show staticIcon when not playing
    if (typeof icon === "string" && icon.toLowerCase().endsWith(".gif")) {
      if (play) {
        return <img src={icon} alt="icon" style={style} {...props} />;
      } else if (staticIcon) {
        return (
          <img src={staticIcon} alt="icon-static" style={style} {...props} />
        );
      } else {
        return Placeholder;
      }
    }

    // Guard against undefined, null, or not client-side, or invalid lottie data
    if (!icon || !isClient || !LottieLoaded || !isValidLottieData(icon)) {
      return Placeholder;
    }

    return (
      <LottieWrapper
        LottieComponent={LottieLoaded}
        lottieRef={lottieRef}
        animationData={icon}
        style={{ width: size || 24, height: size || 24, ...style }}
        fallback={Placeholder}
        {...props}
      />
    );
  }
);

PlayOnce.displayName = "PlayOnce";

export default PlayOnce;
