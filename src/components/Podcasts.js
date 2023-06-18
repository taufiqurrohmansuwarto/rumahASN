import ReactPlayer from "@/components/ReactPlayer";
import {
  PauseCircleOutlined,
  PlayCircleFilled,
  StepBackwardFilled,
  StepForwardFilled,
} from "@ant-design/icons";
import { Button, Col, Row, Space } from "antd";
import { useRef, useState } from "react";

function Podcasts({ url }) {
  const ref = useRef(null);
  const [data, setData] = useState({
    played: 0,
    loaded: 0,
    url,
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
      setData({
        ...data,
        ...state,
      });
    }
  };

  const handlePlayPause = () => {
    setData({ ...data, playing: !data.playing });
  };

  const handleEnded = () => {
    setData({ ...data, playing: data.loop });
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
    <Row justify="center" align="center">
      <Col md={24}>
        <Space>
          <ReactPlayer
            ref={ref}
            playing={data.playing}
            onEnded={handleEnded}
            url={url}
            style={{
              display: "none",
            }}
          />
          <Button shape="circle" size="small" icon={<StepBackwardFilled />} />
          <Button
            onClick={handlePlayPause}
            shape="circle"
            size="large"
            icon={
              data?.playing ? <PauseCircleOutlined /> : <PlayCircleFilled />
            }
          />
          <Button shape="circle" size="small" icon={<StepForwardFilled />} />
        </Space>
      </Col>
    </Row>
  );
}

export default Podcasts;
