import { Col, Row } from "antd";
import HeroSection from "./HeroSection";
import RecentHelpRequests from "./RecentHelpRequests";
import AvailableHelpers from "./AvailableHelpers";
import MyImpact from "./MyImpact";

const ASNHelperDashboard = ({ pageData }) => {
  return (
    <div
      style={{
        backgroundColor: "#DAE0E6",
        minHeight: "100vh",
        padding: "20px 0",
      }}
    >
      <Row justify="center">
        <Col xs={24} sm={22} md={20} lg={18} xl={16}>
          {/* Hero Section */}
          <HeroSection user={pageData?.user} stats={pageData?.quickStats} />

          {/* My Impact */}
          <MyImpact impact={pageData?.myImpact} />

          {/* Recent Help Requests */}
          <RecentHelpRequests requests={pageData?.recentHelpRequests} />

          {/* Available Helpers */}
          <AvailableHelpers helpers={pageData?.availableHelpers} />
        </Col>
      </Row>
    </div>
  );
};

export default ASNHelperDashboard;
