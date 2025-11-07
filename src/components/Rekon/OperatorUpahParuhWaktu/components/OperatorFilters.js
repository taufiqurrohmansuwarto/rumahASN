import { ReloadOutlined, DownloadOutlined } from "@ant-design/icons";
import { Text } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { Button, Col, Grid, Row, Space, TreeSelect } from "antd";

const { useBreakpoint } = Grid;

export const OperatorFilters = ({
  unor,
  unorId,
  isLoadingUnor,
  isLoadingUnorFasilitator,
  isLoadingOperatorGajiPW,
  isAddingOperator,
  isDeletingOperator,
  isDownloading,
  onUnorChange,
  onRefresh,
  onDownload,
}) => {
  const screens = useBreakpoint();
  const isXs = !screens?.sm;

  return (
    <div
      style={{
        padding: "20px 0 16px 0",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <Row gutter={[12, 12]} align="middle">
        <Col xs={24} md={18}>
          <div
            style={{
              display: "flex",
              flexDirection: isXs ? "column" : "row",
              alignItems: isXs ? "stretch" : "center",
              gap: 8,
            }}
          >
            <Space size="small" align="center" style={{ flexShrink: 0 }}>
              <IconSearch size={16} style={{ color: "#FF4500" }} />
              <Text fw={600} size="sm" c="dimmed">
                Pilih Unit Organisasi:
              </Text>
            </Space>
            <TreeSelect
              style={{
                width: isXs ? "100%" : "100%",
                maxWidth: "100%",
                flex: 1,
              }}
              treeData={unor}
              showSearch
              treeNodeFilterProp="label"
              placeholder="Ketik nama unit organisasi untuk mencari..."
              allowClear
              value={unorId}
              onChange={onUnorChange}
              loading={isLoadingUnor}
              dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
            />
          </div>
        </Col>
        <Col xs={24} md={6}>
          <div
            style={{
              display: "flex",
              justifyContent: isXs ? "flex-start" : "flex-end",
              gap: 8,
            }}
          >
            <Button
              icon={<DownloadOutlined />}
              loading={isDownloading}
              onClick={onDownload}
              style={{ borderRadius: 6, fontWeight: 500 }}
            >
              Download
            </Button>
            <Button
              icon={<ReloadOutlined />}
              loading={
                isLoadingUnor ||
                isLoadingUnorFasilitator ||
                isLoadingOperatorGajiPW ||
                isAddingOperator ||
                isDeletingOperator
              }
              onClick={onRefresh}
              style={{ borderRadius: 6, fontWeight: 500 }}
            >
              Refresh
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

