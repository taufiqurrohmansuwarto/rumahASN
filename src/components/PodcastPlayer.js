import { formatTime } from "@/utils/client-utils";
import {
  FastBackwardFilled,
  FastForwardFilled,
  PauseCircleFilled,
  PlayCircleFilled,
} from "@ant-design/icons";
import { Card } from "@mantine/core";
import { Col, Image, Row, Slider, Typography } from "antd";
import { useRef, useState } from "react";
import Duration from "./Duration";
import ReactPlayer from "./ReactPlayer";

function PodcastPlayer({ data: dataPodcast }) {
  const ref = useRef(null);

  const [data, setData] = useState({
    ready: false,
    played: 0,
    loaded: 0,
    url: dataPodcast?.audio_url,
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

  const handleSeekChange = (e) => {
    setData({ ...data, played: parseFloat(e) / 100 });
  };

  const handleSeekMouseUp = (e) => {
    setData({ ...data, seeking: false });
    ref.current.seekTo(parseFloat(e) / 100);
  };

  const handleProgress = (state) => {
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

  const handlePlay = () => {
    setData({ ...data, playing: true });
  };

  const handleDuration = (duration) => {
    setData({ ...data, duration });
  };

  return (
    <Card>
      <Row>
        <Col md={16} xs={24}>
          <Row gutter={[32, 32]}>
            <Col span={6}>
              <Image
                src="https://images.transistor.fm/file/transistor/images/show/13470/thumb_1597943814-artwork.jpg"
                alt="Podcast Image"
                width={160}
              />
            </Col>
            <Col span={18}>
              <Row>
                <Typography.Text>
                  {dataPodcast?.title} • Episode {dataPodcast?.episode}
                </Typography.Text>
              </Row>
              <Row>
                <Typography.Title level={4}>
                  {dataPodcast?.episode}: {dataPodcast?.short_description}
                </Typography.Title>
              </Row>
              <Row gutter={[16, 16]}>
                <ReactPlayer
                  ref={ref}
                  playing={data.playing}
                  muted={data.muted}
                  onProgress={handleProgress}
                  onEnded={handleEnded}
                  onPlay={handlePlay}
                  onDuration={handleDuration}
                  url={data?.url}
                  onReady={(e) => {
                    console.log(e["player"]);
                    ref.current = e["player"];
                    setData({ ...data, ready: true });
                  }}
                  style={{ display: "none" }}
                />
                <Col span={3}>
                  {data.playing ? (
                    <PauseCircleFilled
                      onClick={handlePlayPause}
                      style={{
                        fontSize: 50,
                        cursor: "pointer",
                      }}
                    />
                  ) : (
                    <PlayCircleFilled
                      onClick={handlePlayPause}
                      style={{
                        fontSize: 50,
                        cursor: "pointer",
                      }}
                    />
                  )}
                </Col>
                <Col span={16}>
                  <Row>
                    <Col span={24}>
                      <Slider
                        value={data.played * 100}
                        onChange={handleSeekChange}
                        // onAfterChange={handleSeekMouseUp}
                        onAfterChange={handleSeekMouseUp}
                        step={0.0001}
                        tooltip={{
                          formatter: (value) =>
                            formatTime((data.duration * value) / 100),
                        }}
                        min={0}
                        max={100}
                      />
                    </Col>
                    <Col span={24}>
                      <Row justify="space-evenly" align="middle">
                        <Col span={20}>
                          <FastBackwardFilled
                            style={{
                              fontSize: 24,
                              cursor: "pointer",
                            }}
                          />
                          <FastForwardFilled
                            style={{
                              fontSize: 24,
                              cursor: "pointer",
                            }}
                          />
                        </Col>
                        <Col span={4}>
                          <Duration seconds={data?.duration * data?.played} /> :{" "}
                          <Duration seconds={data?.duration} />
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
}

export default PodcastPlayer;
