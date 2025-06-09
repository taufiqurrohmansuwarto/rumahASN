import { inboxUsulan, refJenisRiwayat } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Select, Card, Flex, Typography, Grid, Alert } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { useState } from "react";
import TableUsulan from "./TableUsulan";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

function RwInboxUsulan() {
  const [dataInbox, setDataInbox] = useState(null);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const { data, isLoading } = useQuery(
    ["ref-jenis-riwayat-siasn"],
    refJenisRiwayat,
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: dataUsulan, isFetching: isLoadingUsulan } = useQuery(
    ["inbox-usulan-layanan", dataInbox],
    () => inboxUsulan(dataInbox),
    {
      enabled: Boolean(dataInbox),
      refetchOnWindowFocus: false,
    }
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Filter Card */}
      <Card
        style={{
          backgroundColor: "#F8F9FA",
          border: "1px solid #EDEFF1",
          borderRadius: "8px",
        }}
        bodyStyle={{ padding: isMobile ? "12px" : "16px" }}
      >
        <Flex
          align="center"
          gap={12}
          vertical={isMobile}
          style={{ width: "100%" }}
        >
          <Flex align="center" gap={8}>
            <FilterOutlined style={{ color: "#1890FF", fontSize: "16px" }} />
            <Title
              level={5}
              style={{
                margin: 0,
                color: "#1A1A1B",
                fontSize: isMobile ? "14px" : "16px",
              }}
            >
              Filter Jenis Usulan
            </Title>
          </Flex>

          {data && (
            <Select
              showSearch
              allowClear
              value={dataInbox}
              onChange={setDataInbox}
              style={{
                width: isMobile ? "100%" : "350px",
              }}
              size={isMobile ? "middle" : "large"}
              optionFilterProp="label"
              placeholder="🔍 Pilih Jenis Usulan"
              loading={isLoading}
              options={data?.map((item) => ({
                label: item.nama,
                value: item.id,
              }))}
            />
          )}
        </Flex>
      </Card>

      {/* Info Alert */}
      {!dataInbox && (
        <Alert
          message="📋 Pilih Jenis Usulan"
          description="Silahkan pilih jenis usulan terlebih dahulu untuk melihat data inbox usulan"
          type="info"
          showIcon
          style={{
            backgroundColor: "#E6F7FF",
            border: "1px solid #91D5FF",
            borderRadius: "8px",
          }}
        />
      )}

      {/* Table Card */}
      {dataInbox && (
        <Card
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #EDEFF1",
            borderRadius: "8px",
          }}
          bodyStyle={{ padding: isMobile ? "8px" : "16px" }}
          title={
            <Flex align="center" gap={8}>
              <FilterOutlined style={{ color: "#FF4500", fontSize: "16px" }} />
              <Text
                style={{
                  color: "#1A1A1B",
                  fontSize: isMobile ? "14px" : "16px",
                  fontWeight: 600,
                }}
              >
                📥 Hasil Filter Inbox Usulan
              </Text>
            </Flex>
          }
        >
          <TableUsulan data={dataUsulan} isLoading={isLoadingUsulan} />
        </Card>
      )}

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
    </div>
  );
}

export default RwInboxUsulan;
