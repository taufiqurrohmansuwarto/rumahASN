import { getListYoutube } from "@/services/index";
import { formatDateFromNow } from "@/utils/client-utils";
import { useQuery } from "@tanstack/react-query";
import { Badge, Card, Col, List, Row, Tooltip, Typography } from "antd";
const { Title } = Typography;

function VideoYoutube() {
  const { data, isLoading } = useQuery(
    ["video-youtube"],
    () => getListYoutube(),
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <Badge.Ribbon text="Terbaru">
      <Card title="Video BKD">
        <List
          size="small"
          dataSource={data}
          footer={
            <div>
              <a>Lihat Semua</a>
            </div>
          }
          loading={isLoading}
          renderItem={(item) => (
            <List.Item>
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Tooltip title={item?.snippet?.title}>
                    <iframe
                      style={{ width: "100%" }}
                      title={item.snippet.title}
                      src={`https://www.youtube.com/embed/${item.id.videoId}`}
                      frameBorder="0"
                      allowFullScreen
                    />
                  </Tooltip>
                </Col>
                <Col span={12}>
                  <Typography.Paragraph
                    ellipsis={{
                      rows: 2,
                    }}
                  >
                    {item.snippet.title}
                  </Typography.Paragraph>
                  <Typography.Text
                    style={{
                      fontSize: 12,
                    }}
                  >
                    {item?.snippet?.channelTitle} &#x2022;{" "}
                    {formatDateFromNow(item.snippet.publishedAt)}
                  </Typography.Text>
                </Col>
              </Row>
            </List.Item>
          )}
        />
      </Card>
    </Badge.Ribbon>
  );
}

export default VideoYoutube;
