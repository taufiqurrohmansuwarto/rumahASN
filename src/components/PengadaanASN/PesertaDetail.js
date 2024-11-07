import {
  CalendarOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  NumberOutlined,
  TableOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Card,
  Col,
  Descriptions,
  Layout,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from "antd";

const { Title, Text } = Typography;
const { Content } = Layout;

function PesertaDetail({ data }) {
  if (!data) return null;

  const titleStyle = {
    fontSize: "32px",
    margin: "0 0 16px 0",
  };

  const statisticStyle = {
    fontSize: 28,
  };

  const cardTitleStyle = {
    fontSize: 18,
    fontWeight: "bold",
  };

  const descriptionStyle = {
    fontSize: 16,
  };

  const tagStyle = {
    fontSize: 16,
    padding: "4px 12px",
  };

  const iconStyle = {
    fontSize: 20,
  };

  return (
    <Layout>
      <Content style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
        {/* Header Card */}
        <Card style={{ marginBottom: 24 }}>
          <Badge.Ribbon
            text="Terkonfirmasi"
            color="green"
            style={{ fontSize: 16, padding: "8px 16px" }}
          >
            <Title level={2} style={titleStyle}>
              {data.nama}
            </Title>
          </Badge.Ribbon>

          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Space direction="vertical" size="large">
                <Space size="middle" style={{ marginTop: 8 }}>
                  <IdcardOutlined style={iconStyle} />
                  <Text strong style={{ fontSize: 20 }}>
                    {data.nomor_peserta}
                  </Text>
                  <Tag color="blue" style={tagStyle}>
                    No. {data.no}
                  </Tag>
                </Space>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Main Info Card */}
        <Card>
          <Row gutter={[24, 24]}>
            {/* Nomor Meja */}
            <Col xs={24} sm={8}>
              <Card
                type="inner"
                title={<span style={cardTitleStyle}>Nomor Meja</span>}
                headStyle={{ padding: "16px" }}
                bodyStyle={{ padding: "24px" }}
              >
                <Statistic
                  value={data.meja}
                  prefix={<TableOutlined style={iconStyle} />}
                  valueStyle={{ ...statisticStyle, color: "#1890ff" }}
                />
              </Card>
            </Col>

            {/* Sesi */}
            <Col xs={24} sm={8}>
              <Card
                type="inner"
                title={<span style={cardTitleStyle}>Sesi Ujian</span>}
                headStyle={{ padding: "16px" }}
                bodyStyle={{ padding: "24px" }}
              >
                <Statistic
                  value={data.sesi}
                  prefix={<NumberOutlined style={iconStyle} />}
                  suffix={
                    <Text style={{ fontSize: 20 }} type="secondary">
                      / 4
                    </Text>
                  }
                  valueStyle={statisticStyle}
                />
              </Card>
            </Col>

            {/* Waktu */}
            <Col xs={24} sm={8}>
              <Card
                type="inner"
                title={<span style={cardTitleStyle}>Waktu</span>}
                headStyle={{ padding: "16px" }}
                bodyStyle={{ padding: "24px" }}
              >
                <Statistic value={data.jam} valueStyle={statisticStyle} />
              </Card>
            </Col>
          </Row>

          {/* Descriptions */}
          <Descriptions
            bordered
            column={{ xs: 1, sm: 2 }}
            style={{ marginTop: 24 }}
            labelStyle={{
              ...descriptionStyle,
              fontWeight: "bold",
              padding: "16px",
            }}
            contentStyle={{ ...descriptionStyle, padding: "16px" }}
          >
            <Descriptions.Item
              label={
                <Space>
                  <EnvironmentOutlined style={iconStyle} /> Lokasi Ujian
                </Space>
              }
              span={2}
            >
              <Text strong style={descriptionStyle}>
                {data.lokasi_ujian}
              </Text>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <Space>
                  <CalendarOutlined style={iconStyle} /> Tanggal Ujian
                </Space>
              }
              span={2}
            >
              <Text strong style={descriptionStyle}>
                {data.jadwal}
              </Text>
            </Descriptions.Item>

            <Descriptions.Item label="Status">
              <Badge
                status="processing"
                text={<Text style={descriptionStyle}>Siap Ujian</Text>}
              />
            </Descriptions.Item>
          </Descriptions>

          {/* Status Tags */}
          <Row justify="end" style={{ marginTop: 24 }}>
            <Space size="large">
              <Tag
                color="blue"
                icon={<CheckCircleOutlined style={iconStyle} />}
                style={tagStyle}
              >
                Data Terverifikasi
              </Tag>
              <Tag
                color="green"
                icon={<UserOutlined style={iconStyle} />}
                style={tagStyle}
              >
                Peserta Aktif
              </Tag>
            </Space>
          </Row>
        </Card>
      </Content>
    </Layout>
  );
}

export default PesertaDetail;
