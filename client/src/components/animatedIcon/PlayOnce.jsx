import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Player } from "@lordicon/react";

const PlayOnce = forwardRef(
  ({ icon, play, staticIcon, style, size, ...props }, ref) => {
    const playerRef = useRef(null);

    useImperativeHandle(ref, () => ({
      playFromBeginning: () => {
        playerRef.current?.playFromBeginning();
      },
    }));

    useEffect(() => {
      if (play && typeof icon !== "string") {
        playerRef.current?.playFromBeginning();
      }
    }, [play, icon]);

    // If icon is a GIF (string ending with .gif), show staticIcon when not playing
    if (typeof icon === "string" && icon.toLowerCase().endsWith(".gif")) {
      if (play) {
        return <img src={icon} alt="icon" style={style} {...props} />;
      } else if (staticIcon) {
        return (
          <img src={staticIcon} alt="icon-static" style={style} {...props} />
        );
      } else {
        return null;
      }
    }

    return <Player ref={playerRef} icon={icon} size={size || 24} {...props} />;
  }
);

PlayOnce.displayName = "PlayOnce";

export default PlayOnce;
