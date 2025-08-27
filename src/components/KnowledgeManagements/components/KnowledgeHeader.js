import { SearchOutlined } from "@ant-design/icons";
import { Card, Flex, Grid, Input, Typography } from "antd";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { Search } = Input;

const KnowledgeHeader = ({
  searchQuery,
  onSearchChange,
  onSearch,
}) => {
  // Responsive breakpoints
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <Card
      style={{
        marginBottom: isMobile ? "16px" : "24px",
        borderRadius: isMobile ? "8px" : "12px",
        border: "1px solid #EDEFF1",
      }}
      bodyStyle={{ padding: isMobile ? "16px" : "20px" }}
    >
      <Flex
        justify="space-between"
        align={isMobile ? "flex-start" : "center"}
        vertical={isMobile}
        gap="middle"
      >
        <div>
          <Title
            level={isMobile ? 4 : 3}
            style={{
              margin: 0,
              color: "#1A1A1B",
              marginBottom: "4px",
            }}
          >
            📚 ASNPedia
          </Title>
          <Text
            style={{
              color: "#787C7E",
              fontSize: isMobile ? "13px" : "14px",
            }}
          >
            Jelajahi dan temukan pengetahuan dari komunitas
          </Text>
        </div>

        <Search
          placeholder="Cari konten knowledge..."
          allowClear
          enterButton={<SearchOutlined />}
          size={isMobile ? "middle" : "large"}
          style={{
            width: isMobile ? "100%" : "400px",
          }}
          value={searchQuery}
          onChange={onSearchChange}
          onSearch={onSearch}
        />
      </Flex>
    </Card>
  );
};

export default KnowledgeHeader;