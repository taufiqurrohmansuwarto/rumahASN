import DashboardKomparasiAdmin from "@/components/Fasilitator/DashboardKomparasiAdmin";
import DashboardKompareFasilitator from "@/components/Fasilitator/DashboardKompareFasilitator";
import DashboardDimensiCompleteness from "@/components/Fasilitator/KualitasData/DashboardDimensiCompleteness";
import DashboardDimensiConsistency from "@/components/Fasilitator/KualitasData/DasboardDimenisConsistency";
import DashboardDimensiAccuracy from "@/components/Fasilitator/KualitasData/DashboardDimensiAccuracy";
import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { Grid, Card, Row, Col } from "antd";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import {
  BarChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import DashboardDimensiTimeliness from "@/components/Fasilitator/KualitasData/DashboardDimensiTimeliness";

const RekonAnomali = () => {
  useScrollRestoration();

  const { data: session } = useSession();

  const admin = session?.user?.current_role === "admin";
  const fasilitator = session?.user?.role === "FASILITATOR";

  const breakPoint = Grid.useBreakpoint();

  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Disparitas Data</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        title="Disparitas Data"
        content="Disparitas data antara SIASN dan SIMASTER"
      >
        {admin && <DashboardKomparasiAdmin />}
        {fasilitator && <DashboardKompareFasilitator />}
        <div style={{ padding: "16px" }}>
          <Card
            title="Dimensi Kualitas Data"
            bordered={false}
            style={{
              marginBottom: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
            headStyle={{
              backgroundColor: "#f0f5ff",
              fontWeight: "bold",
              borderBottom: "1px solid #e8e8e8",
            }}
          >
            <Row gutter={[0, 16]}>
              <Col xs={24}>
                <Card
                  hoverable
                  bordered={false}
                  style={{
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                  bodyStyle={{ padding: "16px 24px" }}
                  extra={
                    <BarChartOutlined
                      style={{ fontSize: "24px", color: "#1890ff" }}
                    />
                  }
                >
                  <DashboardDimensiCompleteness />
                </Card>
              </Col>
            </Row>

            <Row gutter={[0, 16]}>
              <Col xs={24}>
                <Card
                  hoverable
                  bordered={false}
                  style={{
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                  bodyStyle={{ padding: "16px 24px" }}
                  extra={
                    <CheckCircleOutlined
                      style={{ fontSize: "24px", color: "#52c41a" }}
                    />
                  }
                >
                  <DashboardDimensiConsistency />
                </Card>
              </Col>
            </Row>

            <Row gutter={[0, 16]}>
              <Col xs={24}>
                <Card
                  hoverable
                  bordered={false}
                  style={{
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                  bodyStyle={{ padding: "16px 24px" }}
                  extra={
                    <ExclamationCircleOutlined
                      style={{ fontSize: "24px", color: "#fa8c16" }}
                    />
                  }
                >
                  <DashboardDimensiAccuracy />
                </Card>
              </Col>
            </Row>

            <Row gutter={[0, 16]}>
              <Col xs={24}>
                <Card
                  hoverable
                  bordered={false}
                  style={{
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                  bodyStyle={{ padding: "16px 24px" }}
                  extra={
                    <ClockCircleOutlined
                      style={{ fontSize: "24px", color: "#13c2c2" }}
                    />
                  }
                >
                  <DashboardDimensiTimeliness />
                </Card>
              </Col>
            </Row>
          </Card>
        </div>
      </PageContainer>
    </>
  );
};

RekonAnomali.getLayout = (page) => {
  return <RekonLayout active="/rekon/anomali">{page}</RekonLayout>;
};

RekonAnomali.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default RekonAnomali;
