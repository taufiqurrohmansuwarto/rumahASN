import { formatTime } from "@/utils/client-utils";
import { PauseCircleFilled, PlayCircleFilled } from "@ant-design/icons";
import { ActionIcon, Avatar, Card, Group, Paper, Text } from "@mantine/core";
import { Col, Grid, Image, Row, Slider, Typography } from "antd";
import { useRef, useState } from "react";
import Duration from "./Duration";
import ReactPlayer from "./ReactPlayer";
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons";

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

  const screens = Grid.useBreakpoint();

  return (
    <Paper
      withBorder
      radius="md"
      shadow="xs"
      p="xs"
      sx={{
        width: 700,
      }}
    >
      <Group>
        <Avatar size={120} src={dataPodcast?.image_url} />
        <div
          style={{
            width: "75%",
          }}
        >
          <Text
            color="dimmed"
            size="xs"
            sx={{
              fontWeight: 600,
            }}
          >
            PODCAST RUMAH ASN • EPISODE {dataPodcast?.episode}
          </Text>
          <Text
            size="lg"
            sx={{
              fontWeight: 700,
            }}
            lineClamp={1}
          >
            {dataPodcast?.episode}: {dataPodcast?.title}
          </Text>

          <Group mt={10}>
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
            {data.playing ? (
              <ActionIcon
                onClick={handlePlayPause}
                color="green"
                size={60}
                radius="xl"
                variant="filled"
              >
                <IconPlayerPause size={30} />
              </ActionIcon>
            ) : (
              <ActionIcon
                onClick={handlePlayPause}
                color="green"
                size={60}
                radius="xl"
                variant="filled"
              >
                <IconPlayerPlay size={30} />
              </ActionIcon>
            )}

            <div
              style={{
                width: "80%",
              }}
            >
              <Slider
                value={data.played * 100}
                onChange={handleSeekChange}
                onAfterChange={handleSeekMouseUp}
                step={0.0001}
                tooltip={{
                  formatter: (value) =>
                    formatTime((data.duration * value) / 100),
                }}
                min={0}
                max={100}
              />
              <Group position="apart">
                <div></div>
                <div>
                  <Duration seconds={data?.duration * data?.played} /> :{" "}
                  <Duration seconds={data?.duration} />
                </div>
              </Group>
            </div>
          </Group>
        </div>
      </Group>
    </Paper>
  );

  // return (
  //   <Card>
  //     <Row>
  //       <Col md={16} xs={24}>
  //         <Row gutter={[32, 32]}>
  //           <Col span={6}>
  //             <Image
  //               src={dataPodcast?.image_url}
  //               alt="Podcast Image"
  //               width={"100%"}
  //               height={"100%"}
  //             />
  //           </Col>
  //           <Col span={18}>
  //             <Row>
  //               <Typography.Text>
  //                 {dataPodcast?.title} • Episode {dataPodcast?.episode}
  //               </Typography.Text>
  //             </Row>
  //             <Row>
  //               <Typography.Title level={4}>
  //                 {dataPodcast?.episode}: {dataPodcast?.short_description}
  //               </Typography.Title>
  //             </Row>
  //             <Row gutter={[8, 8]} align="top" justify="space-between">
  //               <ReactPlayer
  //                 ref={ref}
  //                 playing={data.playing}
  //                 muted={data.muted}
  //                 onProgress={handleProgress}
  //                 onEnded={handleEnded}
  //                 onPlay={handlePlay}
  //                 onDuration={handleDuration}
  //                 url={data?.url}
  //                 onReady={(e) => {
  //                   console.log(e["player"]);
  //                   ref.current = e["player"];
  //                   setData({ ...data, ready: true });
  //                 }}
  //                 style={{ display: "none" }}
  //               />
  //               <Col md={3}>
  //                 {data.playing ? (
  //                   <PauseCircleFilled
  //                     onClick={handlePlayPause}
  //                     style={{
  //                       // fontSize full width
  //                       fontSize: screens.md ? 50 : 20,
  //                       cursor: "pointer",
  //                     }}
  //                   />
  //                 ) : (
  //                   <PlayCircleFilled
  //                     onClick={handlePlayPause}
  //                     style={{
  //                       fontSize: screens.md ? 50 : 20,
  //                       cursor: "pointer",
  //                     }}
  //                   />
  //                 )}
  //               </Col>
  //               <Col md={21} xs={21} sm={21}>
  //                 <Row>
  //                   <Col span={24}>
  //                     <Slider
  //                       value={data.played * 100}
  //                       onChange={handleSeekChange}
  //                       onAfterChange={handleSeekMouseUp}
  //                       step={0.0001}
  //                       tooltip={{
  //                         formatter: (value) =>
  //                           formatTime((data.duration * value) / 100),
  //                       }}
  //                       min={0}
  //                       max={100}
  //                     />
  //                   </Col>
  //                   <Col span={24}>
  //                     <Group position="apart">
  //                       <div></div>
  //                       <div>
  //                         <Duration seconds={data?.duration * data?.played} /> :{" "}
  //                         <Duration seconds={data?.duration} />
  //                       </div>
  //                     </Group>
  //                   </Col>
  //                 </Row>
  //               </Col>
  //             </Row>
  //           </Col>
  //         </Row>
  //       </Col>
  //     </Row>
  //   </Card>
  // );
}

export default PodcastPlayer;
