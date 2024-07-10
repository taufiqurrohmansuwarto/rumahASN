import React from "react";
import {
  Card,
  Typography,
  List,
  Space,
  Avatar,
  Button,
  Tag,
  Tooltip,
} from "antd";
import {
  UsergroupAddOutlined,
  FireOutlined,
  RightOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const popularCommunities = [
  {
    id: 1,
    name: "Inovasi Pelayanan Publik",
    members: 1250,
    avatar: "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
    topics: ["Pelayanan", "Inovasi", "Teknologi"],
  },
  {
    id: 2,
    name: "Pengembangan Karir ASN",
    members: 980,
    avatar: "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
    topics: ["Karir", "Pelatihan", "Sertifikasi"],
  },
  {
    id: 3,
    name: "Digitalisasi Administrasi",
    members: 765,
    avatar: "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
    topics: ["E-Government", "Paperless", "Efisiensi"],
  },
  {
    id: 4,
    name: "Manajemen Kinerja ASN",
    members: 650,
    avatar: "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
    topics: ["KPI", "Evaluasi", "Produktivitas"],
  },
  {
    id: 5,
    name: "Etika dan Integritas ASN",
    members: 590,
    avatar: "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
    topics: ["Etika", "Integritas", "Anti-Korupsi"],
  },
];

const KomunitasPopuler = () => {
  return (
    <Card
      size="small"
      title={
        <Space>
          <FireOutlined style={{ color: "#fa8c16" }} />
          <Title level={5} style={{ color: "#fa8c16", margin: 0 }}>
            Komunitas Populer
          </Title>
        </Space>
      }
      extra={
        <Button type="link" size="small">
          Lihat Semua
        </Button>
      }
    >
      <List
        itemLayout="horizontal"
        dataSource={popularCommunities}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar src={item.avatar} size="large" />}
              title={
                <Space>
                  <Text strong>{item.name}</Text>
                  <Tooltip title="Jumlah Anggota">
                    <Tag color="blue" icon={<UsergroupAddOutlined />}>
                      {item.members}
                    </Tag>
                  </Tooltip>
                </Space>
              }
              description={
                <Space size={[0, 4]} wrap>
                  {item.topics.map((topic, index) => (
                    <Tag key={index} color="default">
                      {topic}
                    </Tag>
                  ))}
                </Space>
              }
            />
            <Button type="link" icon={<RightOutlined />} />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default KomunitasPopuler;
