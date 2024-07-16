import { dashboarAsnConnect } from "@/services/asn-connect-dashboard";
import {
  DislikeOutlined,
  FireOutlined,
  LikeOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Button, Card, List, Space, Tooltip, Typography } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/router";

const { Title, Text, Link } = Typography;

dayjs.extend(relativeTime);
dayjs.locale("id");

const DiskusiTerhangat = () => {
  const { data, isLoading } = useQuery(
    ["asn-connect-dashboard"],
    () => dashboarAsnConnect(),
    {}
  );

  const router = useRouter();

  const gotoDetail = (id) =>
    router.push(`/asn-connect/asn-discussions/${id}/detail`);

  const gotoDiscussions = () => router.push("/asn-connect/asn-discussions");

  return (
    <Card
      size="small"
      extra={
        <Button type="link" size="small" onClick={gotoDiscussions}>
          Lihat Semua
        </Button>
      }
      title={
        <Space>
          <FireOutlined style={{ color: "#fa8c16" }} />
          <Title level={5} style={{ color: "#fa8c16", margin: 0 }}>
            Diskusi Terhangat
          </Title>
        </Space>
      }
    >
      <List
        itemLayout="vertical"
        size="small"
        loading={isLoading}
        dataSource={data?.discussions}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            actions={[
              <Tooltip title="Komentar" key="komentar">
                <Space>
                  <MessageOutlined style={{ fontSize: "14px" }} />
                  <Text style={{ fontSize: "12px" }}>{item.comments}</Text>
                </Space>
              </Tooltip>,
              <Tooltip title="Upvote" key="upvote">
                <Space>
                  <LikeOutlined style={{ fontSize: "14px" }} />
                  <Text style={{ fontSize: "12px" }}>{item.upvotes}</Text>
                </Space>
              </Tooltip>,
              <Tooltip title="Downvote" key="downvote">
                <Space>
                  <DislikeOutlined style={{ fontSize: "14px" }} />
                  <Text style={{ fontSize: "12px" }}>{item.downvotes}</Text>
                </Space>
              </Tooltip>,
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar src={item.avatar} />}
              title={
                <Space direction="vertical" size={0}>
                  <Link
                    onClick={() => gotoDetail(item?.id)}
                    strong
                    style={{ fontSize: "14px" }}
                  >
                    {item.title}
                  </Link>
                  <Space size={4}>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      {item.author}
                    </Text>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      •
                    </Text>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      {dayjs(item.date).format("DD MMM YYYY")}
                    </Text>
                  </Space>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default DiskusiTerhangat;
