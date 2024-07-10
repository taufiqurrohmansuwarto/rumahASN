import {
  CalendarOutlined,
  DownOutlined,
  TeamOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  List,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { useState } from "react";

const { Title, Text } = Typography;

dayjs.extend(localizedFormat);
dayjs.locale("id");

const allEvents = [
  {
    id: 1,
    title: "Webinar: Inovasi Pelayanan Publik",
    date: "2024-07-20T10:00",
    type: "webinar",
    creator: "Budi Santoso",
    avatar: "https://xsgames.co/randomusers/avatar.php?g=male&key=1",
  },
  {
    id: 2,
    title: "Coaching Clinic: Manajemen Kinerja ASN",
    date: "2024-07-22T09:00",
    type: "coaching-clinic",
    creator: "Siti Rahayu",
    avatar: "https://xsgames.co/randomusers/avatar.php?g=female&key=2",
  },
  {
    id: 3,
    title: "Event: Sosialisasi Kebijakan Baru",
    date: "2024-07-25T14:00",
    type: "event-pemda",
    creator: "Ahmad Yani",
    avatar: "https://xsgames.co/randomusers/avatar.php?g=male&key=3",
  },
  {
    id: 4,
    title: "Webinar: Digitalisasi Administrasi ASN",
    date: "2024-07-27T11:00",
    type: "webinar",
    creator: "Dewi Lestari",
    avatar: "https://xsgames.co/randomusers/avatar.php?g=female&key=4",
  },
  {
    id: 5,
    title: "Coaching Clinic: Pengembangan Karir ASN",
    date: "2024-07-29T13:00",
    type: "coaching-clinic",
    creator: "Rudi Hartono",
    avatar: "https://xsgames.co/randomusers/avatar.php?g=male&key=5",
  },
];

const KegiatanMendatang = () => {
  const [visibleEvents, setVisibleEvents] = useState(3);

  const getEventIcon = (type) => {
    switch (type) {
      case "webinar":
        return <VideoCameraOutlined />;
      case "coaching-clinic":
        return <TeamOutlined />;
      case "event-pemda":
        return <CalendarOutlined />;
      default:
        return <CalendarOutlined />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case "webinar":
        return "blue";
      case "coaching-clinic":
        return "green";
      case "event-pemda":
        return "orange";
      default:
        return "default";
    }
  };

  const getEventTypeLabel = (type) => {
    switch (type) {
      case "webinar":
        return "Webinar";
      case "coaching-clinic":
        return "Coaching Clinic";
      case "event-pemda":
        return "Event Pemda";
      default:
        return "Kegiatan";
    }
  };

  const handleViewMore = () => {
    setVisibleEvents((prevVisible) => prevVisible + 3);
  };

  return (
    <Card
      size="small"
      title={
        <Space>
          <CalendarOutlined style={{ color: "#fa8c16" }} />
          <Title level={5} style={{ color: "#fa8c16", margin: 0 }}>
            Kegiatan Mendatang
          </Title>
        </Space>
      }
    >
      <List
        size="small"
        dataSource={allEvents.slice(0, visibleEvents)}
        renderItem={(item) => (
          <List.Item
            extra={
              <Button
                size="small"
                type="primary"
                style={{ backgroundColor: "#fa8c16", borderColor: "#fa8c16" }}
              >
                Daftar
              </Button>
            }
          >
            <List.Item.Meta
              avatar={
                <Avatar src={item.avatar} alt={item.creator} size="small" />
              }
              title={
                <Text strong style={{ fontSize: "14px" }}>
                  {item.title}
                </Text>
              }
              description={
                <Space size={4} wrap>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {dayjs(item.date).format("DD MMM, HH:mm")}
                  </Text>
                  <Tag
                    color={getEventColor(item.type)}
                    icon={getEventIcon(item.type)}
                    style={{ fontSize: "10px" }}
                  >
                    {getEventTypeLabel(item.type)}
                  </Tag>
                  <Tooltip title={item.creator}>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      {item.creator}
                    </Text>
                  </Tooltip>
                </Space>
              }
            />
          </List.Item>
        )}
      />
      {visibleEvents < allEvents.length && (
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

export default KegiatanMendatang;
