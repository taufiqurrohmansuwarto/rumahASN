import { Card, Col, Grid, Row, Typography } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import SinkronMaster from "./SinkronMaster";
import SinkronUnorMaster from "./SinkronUnorMaster";
import SyncPendidikan from "./SyncPendidikan";
import SinkronJfu from "./SinkronJfu";
import SinkronJft from "./SinkronJft";
import SinkronSKP from "./SinkronSKP";
import SyncUnorSiasn from "./SyncUnorSiasn";
import SyncLembagaSertifikasi from "./SyncLembagaSertifikasi";
import SyncRumpunJF from "./SyncRumpunJF";
import SyncRumpunJabatan from "./SyncRumpunJabatan";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

function DaftarTombolSinkron() {
  const screens = useBreakpoint();
  const isXs = !screens?.sm;

  return (
    <Card
      style={{
        borderRadius: "12px",
        border: "1px solid #f0f0f0",
        marginTop: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
          paddingBottom: 16,
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SyncOutlined style={{ color: "white", fontSize: "16px" }} />
        </div>
        <div>
          <Title level={5} style={{ margin: 0, color: "#1a1a1a" }}>
            Tombol Sinkronisasi
          </Title>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Klik tombol untuk sinkronisasi data
          </Text>
        </div>
      </div>

      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <SinkronMaster />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <SinkronUnorMaster />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <SyncPendidikan />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <SinkronJfu />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <SinkronJft />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <SinkronSKP />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <SyncUnorSiasn />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <SyncLembagaSertifikasi />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <SyncRumpunJF />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <SyncRumpunJabatan />
        </Col>
      </Row>
    </Card>
  );
}

export default DaftarTombolSinkron;
