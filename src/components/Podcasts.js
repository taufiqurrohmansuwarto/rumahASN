import React from "react";
import ReactPlayer from "@/components/ReactPlayer";
import { Slider } from "antd";

function Podcasts() {
  const ref = useRef(null);
  const [played, setPlayed] = useState(0);
  const [data, setData] = useState({
    played: 0,
    loaded: 0,
    url: null,
    pip: false,
    playing: false,
    controls: false,
    light: false,
    volume: 0.8,
    muted: false,
    duration: 0,
    playbackRate: 1.0,
    loop: false,
  });

  const onProgress = (state) => {
    console.log("onProgress", state);
    // We only want to update time slider if we are not currently seeking
    if (!data.seeking) {
      setData(state);
    }
  };

  const handlePlayPause = () => {
    setData({ ...data, playing: !data.playing });
  };

  const handleStop = () => {
    setData({ ...data, url: null, playing: false });
  };

  const handleToggleControls = () => {
    const url = data.url;
    setData({
      ...data,
      controls: !data.controls,
      url: null,
    });
    setTimeout(() => {
      setData({ ...data, controls: !data.controls, url });
    }, 200);
  };

  const handleToggleLight = () => {
    setData({ ...data, light: !data.light });
  };

  const handleSeekChange = (e) => {
    setData({ ...data, played: parseFloat(e.target.value) });
    ref.current.seekTo(parseFloat(e.target.value));
  };

  return (
    <div>
      helloword
      <ReactPlayer
        ref={ref}
        onBuffer={() => console.log("onBuffer")}
        playing={true}
        onProgress={onProgress}
        onSeek={handleSeekChange}
        light={
          <img
            src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
            alt="Thumbnail"
          />
        }
        url={"https://siasn.bkd.jatimprov.go.id:9000/public/regex.mp3"}
      />
      <Slider
        min={0}
        max={1}
        step={0.01}
        value={
          typeof data.played === "number"
            ? data.played
            : parseFloat(data.played)
        }
        onChange={handleSeekChange}
      />
      {played}
    </div>
  );
}

export default Podcasts;
