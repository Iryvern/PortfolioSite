import { createSignal, onMount, onCleanup } from "solid-js";

// Background 1
import sky1 from "./assets/images/background1/sky.png";
import rocks1_1 from "./assets/images/background1/rocks_1.png";
import rocks1_2 from "./assets/images/background1/rocks_2.png";
import clouds1_1 from "./assets/images/background1/clouds_1.png";
import clouds1_2 from "./assets/images/background1/clouds_2.png";
import clouds1_3 from "./assets/images/background1/clouds_3.png";
import clouds1_4 from "./assets/images/background1/clouds_4.png";

// Background 3
import sky3 from "./assets/images/background3/sky.png";
import ground3_1 from "./assets/images/background3/ground_1.png";
import ground3_2 from "./assets/images/background3/ground_2.png";
import ground3_3 from "./assets/images/background3/ground_3.png";
import plant3 from "./assets/images/background3/plant.png";
import rocks3 from "./assets/images/background3/rocks.png";
import clouds3_1 from "./assets/images/background3/clouds_1.png";
import clouds3_2 from "./assets/images/background3/clouds_2.png";

// Background 4
import sky4 from "./assets/images/background4/sky.png";
import ground4 from "./assets/images/background4/ground.png";
import rocks4 from "./assets/images/background4/rocks.png";
import clouds4_1 from "./assets/images/background4/clouds_1.png";
import clouds4_2 from "./assets/images/background4/clouds_2.png";

const backgrounds = {
  bg1: [
    sky1,       // 0
    rocks1_1,   // 1
    rocks1_2,   // 2
    clouds1_1,  // 3 (static)
    clouds1_2,  // 4
    clouds1_3,  // 5
    clouds1_4   // 6
  ],
  bg3: [
    sky3,
    rocks3,      // 0
    ground3_1,   // 1
    ground3_2,   // 2
    ground3_3,   // 3
    plant3,      // 4
    clouds3_1,   // 6
    clouds3_2    // 7
  ],
  bg4: [
    sky4,        // 0
    ground4,     // 1
    rocks4,      // 2
    clouds4_1,   // 3
    clouds4_2    // 4
  ]
};

function Background(props) {
  const backgroundKey = props.background || "bg1";
  const selected = backgrounds[backgroundKey];

  const [cloudOffsets, setCloudOffsets] = createSignal([0, 0, 0]);
  let animationFrame;

  const speedsMap = {
    bg1: [0.05, 0.1, 0.11],         // clouds at 4, 5, 6
    bg3: [0.1, 0.075],               // clouds at 6, 7
    bg4: [0.1, 0.075]               // clouds at 3, 4
  };

  const animateClouds = () => {
    const speeds = speedsMap[backgroundKey] || [];
    setCloudOffsets((prev) =>
      prev.map((offset, i) => {
        const newOffset = offset + speeds[i];
        return newOffset > window.innerWidth ? -window.innerWidth : newOffset;
      })
    );
    animationFrame = requestAnimationFrame(animateClouds);
  };

  onMount(() => {
    animationFrame = requestAnimationFrame(animateClouds);
  });

  onCleanup(() => {
    cancelAnimationFrame(animationFrame);
  });

  return (
    <div
      className="background-container"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -10,
        overflow: "hidden",
      }}
    >
      {selected.map((layer, index) => {
        const style = {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: index,
        };

        if (
          (backgroundKey === "bg1" && index >= 4 && index <= 6) ||
          (backgroundKey === "bg3" && index >= 6 && index <= 7) ||
          (backgroundKey === "bg4" && index >= 3 && index <= 4)
        ) {
          const offsetIndex =
            backgroundKey === "bg1" ? index - 4 : backgroundKey === "bg3" ? index - 6 : index - 3;
          style.left = `${cloudOffsets()[offsetIndex]}px`;
        }

        return (
          <img
            src={layer}
            className={`bg-layer layer-${index}`}
            style={style}
            alt={`layer-${index}`}
          />
        );
      })}
    </div>
  );
}

export default Background;
