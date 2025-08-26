import { KnowledgeNavigationSegmented } from "../components";
import { Flex, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import PageContainer from "@/components/PageContainer";

const KnowledgeLayout = ({ 
  children, 
  currentPath, 
  showCreateButton = false,
  title = null,
  showPageContainer = false 
}) => {
  const router = useRouter();

  const renderContent = () => {
    if (showPageContainer) {
      return (
        <>
          <Flex justify="space-between" align="center" style={{ marginBottom: "16px" }}>
            <KnowledgeNavigationSegmented currentPath={currentPath} />
            
            {showCreateButton && (
              <Button
                shape="round"
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => router.push("/asn-connect/asn-knowledge/create")}
              >
                Buat Pengetahuan
              </Button>
            )}
          </Flex>
          
          <PageContainer title={title}>
            {children}
          </PageContainer>
        </>
      );
    }

    return (
      <>
        <Flex justify="space-between" align="center" style={{ marginBottom: "16px" }}>
          <KnowledgeNavigationSegmented currentPath={currentPath} />
          
          {showCreateButton && (
            <Button
              shape="round"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push("/asn-connect/asn-knowledge/create")}
            >
              Buat Pengetahuan
            </Button>
          )}
        </Flex>
        
        {children}
      </>
    );
  };

  return renderContent();
};

export default KnowledgeLayout;