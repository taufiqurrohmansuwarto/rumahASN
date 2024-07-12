import React, { useState } from "react";
import { Card, Typography, List, Space, Button, Avatar, Tooltip } from "antd";
import {
  MessageOutlined,
  LikeOutlined,
  DislikeOutlined,
  FireOutlined,
  DownOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";

const { Title, Text } = Typography;

dayjs.extend(relativeTime);
dayjs.locale("id");

const allDiscussions = [
  {
    id: 1,
    title: "Cara meningkatkan produktivitas ASN di era digital",
    author: "Budi Santoso",
    avatar: "https://xsgames.co/randomusers/avatar.php?g=male&key=1",
    date: "2024-07-18T10:30:00",
    comments: 23,
    upvotes: 45,
    downvotes: 3,
  },
  {
    id: 2,
    title: "Diskusi tentang perubahan sistem penilaian kinerja ASN",
    author: "Siti Rahayu",
    avatar: "https://xsgames.co/randomusers/avatar.php?g=female&key=2",
    date: "2024-07-17T14:15:00",
    comments: 17,
    upvotes: 38,
    downvotes: 5,
  },
  {
    id: 3,
    title: "Peluang dan tantangan Work From Home bagi ASN",
    author: "Ahmad Yani",
    avatar: "https://xsgames.co/randomusers/avatar.php?g=male&key=3",
    date: "2024-07-16T09:45:00",
    comments: 31,
    upvotes: 52,
    downvotes: 2,
  },
  {
    id: 4,
    title: "Inovasi pelayanan publik: Berbagi pengalaman sukses",
    author: "Dewi Lestari",
    avatar: "https://xsgames.co/randomusers/avatar.php?g=female&key=4",
    date: "2024-07-15T11:20:00",
    comments: 28,
    upvotes: 41,
    downvotes: 4,
  },
  {
    id: 5,
    title: "Pengembangan kompetensi digital untuk ASN",
    author: "Rudi Hartono",
    avatar: "https://xsgames.co/randomusers/avatar.php?g=male&key=5",
    date: "2024-07-14T16:00:00",
    comments: 19,
    upvotes: 33,
    downvotes: 1,
  },
];

const DiskusiTerhangat = () => {
  const [visibleDiscussions, setVisibleDiscussions] = useState(3);

  const handleViewMore = () => {
    setVisibleDiscussions((prevVisible) => prevVisible + 3);
  };

  return (
    <Card
      size="small"
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
        dataSource={allDiscussions.slice(0, visibleDiscussions)}
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
                  <Text strong style={{ fontSize: "14px" }}>
                    {item.title}
                  </Text>
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
      {visibleDiscussions < allDiscussions.length && (
        <Button
          type="link"
          block
          onClick={handleViewMore}
          icon={<DownOutlined />}
          style={{ marginTop: 8 }}
        >
          Lihat lebih banyak
        </Button>
      )}
    </Card>
  );
};

export default DiskusiTerhangat;
