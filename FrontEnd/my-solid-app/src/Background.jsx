import { createSignal, onMount, onCleanup } from "solid-js";
import sky from "./assets/images/background1/sky.png";
import rocks1 from "./assets/images/background1/rocks_1.png";
import rocks2 from "./assets/images/background1/rocks_2.png";
import clouds1 from "./assets/images/background1/clouds_1.png";
import clouds2 from "./assets/images/background1/clouds_2.png";
import clouds3 from "./assets/images/background1/clouds_3.png";
import clouds4 from "./assets/images/background1/clouds_4.png";

const backgrounds = {
  bg1: [
    sky,       // 0: background
    rocks1,    // 1: midground
    rocks2,    // 2: foreground
    clouds1,   // 3: static cloud
    clouds2,   // 4: animated cloud
    clouds3,   // 5: animated cloud
    clouds4    // 6: animated cloud
  ]
};

function Background(props) {
  const [cloudOffsets, setCloudOffsets] = createSignal([0, 0, 0]);
  let animationFrame;

  const speeds = [0.05, 0.1, 0.11]; // speeds for clouds2, clouds3, clouds4

  const animateClouds = () => {
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

  const selected = backgrounds[props.background] || backgrounds.bg1;

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
        let style = {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: index
        };

        if (index === 4) style.left = `${cloudOffsets()[0]}px`;
        if (index === 5) style.left = `${cloudOffsets()[1]}px`;
        if (index === 6) style.left = `${cloudOffsets()[2]}px`;

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
