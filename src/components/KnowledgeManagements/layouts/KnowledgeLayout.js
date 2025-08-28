import { KnowledgeNavigationSegmented, XPNotification } from "../components";
import { Button, Row, Col } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import PageContainer from "@/components/PageContainer";

const KnowledgeLayout = ({
  children,
  currentPath,
  showCreateButton = false,
  title = null,
  showPageContainer = false,
}) => {
  const router = useRouter();

  const renderNavigation = () => {
    return (
      <Row gutter={[16, 12]} style={{ marginBottom: "16px" }} align="middle">
        {/* Tab Navigation */}
        <Col
          xs={24} // Full width pada mobile (xs) - baris terpisah
          sm={showCreateButton ? 18 : 24} // 18/24 jika ada button, full jika tidak ada
          md={showCreateButton ? 18 : 24} // 17/24 jika ada button, full jika tidak ada
        >
          <KnowledgeNavigationSegmented currentPath={currentPath} />
        </Col>

        {/* Create Button */}
        {showCreateButton && (
          <Col
            xs={24} // Full width pada mobile (xs) - baris baru
            sm={6} // 6/24 pada small screens ke atas - sama baris
            md={6} // 4/24 pada medium screens ke atas
          >
            <Button
              shape="round"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push("/asn-connect/asn-knowledge/create")}
              style={{
                width: "100%",
              }}
            >
              Buat Pengetahuan
            </Button>
          </Col>
        )}
      </Row>
    );
  };

  const renderContent = () => {
    if (showPageContainer) {
      return (
        <>
          {renderNavigation()}
          <PageContainer title={title}>{children}</PageContainer>
        </>
      );
    }

    return (
      <>
        {renderNavigation()}
        {children}
      </>
    );
  };

  return (
    <>
      {renderContent()}
      <XPNotification />
    </>
  );
};

export default KnowledgeLayout;
