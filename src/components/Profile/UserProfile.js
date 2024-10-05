import { useState } from "react";

import {
  BookOutlined,
  FireOutlined,
  MessageOutlined,
  RiseOutlined,
  StarOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Col,
  Grid,
  Modal,
  Rate,
  Row,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import BKDRating from "./BKDRating";
import { round } from "lodash";
import { useRouter } from "next/router";

const { Title, Text } = Typography;

const RatingModal = ({ open, onClose, ratingData = [] }) => {
  return (
    <Modal
      style={{ height: "calc(100vh - 200px)" }}
      bodyStyle={{ overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}
      width={850}
      footer={null}
      open={open}
      onCancel={onClose}
      title="Rating Pegawai BKD"
    >
      <BKDRating data={ratingData} />
    </Modal>
  );
};

const BadgeIcon = ({ type }) => {
  switch (type) {
    case "Pemula Bersemangat":
      return <FireOutlined />;
    case "Kontributor Aktif":
      return <TeamOutlined />;
    case "Pembelajar Tekun":
      return <BookOutlined />;
    default:
      return <StarOutlined />;
  }
};

const ProfileHeader = ({ user, isAdmin = false, isPegawaiBKD = false }) => {
  const [showModalRating, setShowModalRating] = useState(false);
  const openModal = () => setShowModalRating(true);
  const closeModal = () => setShowModalRating(false);

  const router = useRouter();

  const gotoDetailInformation = () => {
    router.push(`/apps-managements/integrasi/siasn/${user?.employee_number}`);
  };

  const userData = {
    name: "LISTYA WIDIANINGRUM S.Kom",
    jabatan: "Pranata Komputer Ahli Pertama",
    avatar:
      "https://master.bkd.jatimprov.go.id/files_jatimprov/75235-file_foto-20231113-175-sharpen_FOTO_MASTER-removebg-preview.jpg", // Ganti dengan URL avatar yang sesuai
    perangkatDaerah: "DINAS KESEHATAN - RSUD DR. SOETOMO",
    followers: 150,
    following: 0,
    level: 5,
    points: 1250,
    rank: 23,
    badges: [
      {
        name: "Pemula Bersemangat",
        color: "volcano",
        description: "Login 7 hari berturut-turut",
      },
      {
        name: "Kontributor Aktif",
        color: "geekblue",
        description: "Berkontribusi dalam 50 diskusi",
      },
      {
        name: "Pembelajar Tekun",
        color: "purple",
        description: "Menyelesaikan 10 kursus online",
      },
    ],
  };

  const breakPoint = Grid.useBreakpoint();

  return (
    <Card
      style={{ width: "100%", borderRadius: "12px", overflow: "hidden" }}
      bodyStyle={{ padding: 0 }}
    >
      <RatingModal
        open={showModalRating}
        onClose={closeModal}
        ratingData={user?.rating}
      />
      <div
        style={{
          backgroundColor: "#f0f2f5",
          height: "120px",
          position: "relative",
        }}
      >
        <Avatar
          src={user?.image}
          size={{ xs: 120, sm: 120, md: 120, lg: 120, xl: 120, xxl: 120 }}
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "24px",
            border: "4px solid white",
          }}
        />
      </div>
      <div style={{ padding: "50px 24px 24px", backgroundColor: "white" }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Space direction="vertical" size={2}>
              <Space>
                <Title level={4} style={{ marginBottom: 0 }}>
                  {user?.username}
                </Title>
              </Space>
              <Text type="secondary" style={{ fontSize: "14px" }}>
                {user?.info?.perangkat_daerah?.detail}
              </Text>
              <Text type="secondary" style={{ fontSize: "14px" }}>
                {user?.info?.jabatan?.jabatan}
              </Text>
            </Space>
          </Col>
          {isPegawaiBKD && (
            <Col md={16}>
              <Space
                size={8}
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid #f0f2f5",
                  cursor: "pointer",
                }}
                onClick={openModal}
              >
                <Rate disabled defaultValue={4.5} />
                <Text>{round(user?.tickets?.[0]?.avg_rating, 2)} out of 5</Text>
              </Space>
            </Col>
          )}
          <Col
            xs={24}
            md={8}
            style={{ textAlign: breakPoint.xs ? "left" : "right" }}
          >
            <Space size={0}>
              <Tooltip title="Level">
                <Tag color="gold" icon={<TrophyOutlined />}>
                  {userData.level}
                </Tag>
              </Tooltip>
              <Tooltip title="Poin">
                <Tag color="cyan" icon={<StarOutlined />}>
                  {userData.points}
                </Tag>
              </Tooltip>
              <Tooltip title="Peringkat">
                <Tag color="green" icon={<RiseOutlined />}>
                  {userData.rank}
                </Tag>
              </Tooltip>
            </Space>
          </Col>
          <Col xs={24} md={16}>
            <Space
              size={0}
              direction={breakPoint.xs ? "vertical" : "horizontal"}
              wrap
            >
              {userData.badges.map((badge, index) => (
                <Tooltip key={index} title={badge.description}>
                  <Tag
                    color={badge.color}
                    icon={<BadgeIcon type={badge.name} />}
                  >
                    {badge.name}
                  </Tag>
                </Tooltip>
              ))}
            </Space>
          </Col>
        </Row>

        <Space wrap style={{ marginTop: "16px" }}>
          <Button icon={<MessageOutlined />}>Pesan Pribadi</Button>
          {isAdmin && user?.group === "MASTER" && (
            <Button
              onClick={gotoDetailInformation}
              type="primary"
              icon={<UserAddOutlined />}
            >
              Informasi
            </Button>
          )}
        </Space>
      </div>
    </Card>
  );
};

export default ProfileHeader;
