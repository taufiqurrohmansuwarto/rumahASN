import { usulanPemberhentian } from "@/services/usulan-siasn.services";
import { useQuery } from "@tanstack/react-query";
import { Card, Typography, Flex, Grid, Button, Tooltip } from "antd";
import { StopOutlined, ReloadOutlined } from "@ant-design/icons";
import TableUsulan from "./TableUsulan";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

function RwUsulanPemberhentian() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const { data, isLoading, refetch, isFetching } = useQuery(
    ["rw-usulan-pemberhentian-personal"],
    () => usulanPemberhentian(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const handleRefresh = () => {
    refetch();
  };

  return (
    <Card
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #EDEFF1",
        borderRadius: "8px",
      }}
      bodyStyle={{ padding: isMobile ? "8px" : "16px" }}
    >
      <Flex
        justify="space-between"
        align="center"
        style={{ marginBottom: "16px" }}
        vertical={isMobile}
        gap={isMobile ? 8 : 0}
      >
        <Flex align="center" gap={8}>
          <StopOutlined style={{ color: "#FF4500", fontSize: "18px" }} />
          <div>
            <Title
              level={5}
              style={{
                margin: 0,
                color: "#1A1A1B",
                fontSize: isMobile ? "14px" : "16px",
              }}
            >
              🚪 Riwayat Usulan Pemberhentian
            </Title>
            <Text
              style={{
                color: "#787C7E",
                fontSize: isMobile ? "11px" : "12px",
              }}
            >
              Daftar usulan pemberhentian yang telah diajukan
            </Text>
          </div>
        </Flex>

        <Tooltip title="Refresh data usulan pemberhentian">
          <Button
            type="text"
            icon={<ReloadOutlined />}
            loading={isLoading || isFetching}
            onClick={handleRefresh}
            size={isMobile ? "small" : "middle"}
            style={{
              color: "#787C7E",
              border: "1px solid #EDEFF1",
              borderRadius: "4px",
              fontSize: isMobile ? "11px" : "14px",
            }}
          >
            {isLoading || isFetching ? "Memuat..." : "Refresh"}
          </Button>
        </Tooltip>
      </Flex>

      <TableUsulan data={data} isLoading={isLoading || isFetching} />

      <style jsx global>{`
        .table-row-light {
          background-color: #fafafa !important;
        }
        .ant-table-thead > tr > th {
          background-color: #f8f9fa !important;
          border-bottom: 2px solid #edeff1 !important;
          color: #1a1a1b !important;
          font-weight: 600 !important;
          font-size: 13px !important;
        }
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f0f0f0 !important;
          padding: 12px 16px !important;
        }
        .ant-table-tbody > tr:hover > td {
          background-color: #f8f9fa !important;
        }
      `}</style>
    </Card>
  );
}

export default RwUsulanPemberhentian;
