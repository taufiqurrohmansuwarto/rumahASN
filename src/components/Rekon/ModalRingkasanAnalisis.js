import { ringkasanAnalisisPangkat } from "@/services/rekon.services";
import {
  Badge,
  Text,
  Title,
} from "@mantine/core";
import {
  IconChartBar,
  IconChevronDown,
  IconChevronUp,
  IconFile,
  IconFileText,
  IconRobot,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Modal,
  Skeleton,
  Table,
} from "antd";
import dayjs from "dayjs";
import React from "react";

const ModalRingkasanAnalisis = ({ open, onClose, periode }) => {
  const { data: ringkasan, isLoading } = useQuery({
    queryKey: ["ringkasanAnalisisPangkat", periode],
    queryFn: () => ringkasanAnalisisPangkat({ tmtKp: periode }),
  });



  return (
    <Modal
      width={900}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <IconFileText size={18} style={{ color: "#6366f1" }} />
          <div>
            <Text fw={600} size="md">
              Ringkasan Analisis
            </Text>
            <Text c="dimmed" size="xs">
              {dayjs(periode, "DD-MM-YYYY").format("MMM YYYY")}
            </Text>
          </div>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      styles={{ body: { padding: "12px" } }}
    >
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : ringkasan?.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <IconChartBar size={32} style={{ color: "#d1d5db", marginBottom: "8px" }} />
          <Text c="dimmed" size="sm">Belum ada data analisis</Text>
          <Text c="dimmed" size="xs">Generate ringkasan terlebih dahulu</Text>
        </div>
      ) : (
        <>
          {/* Compact Header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 12px",
            backgroundColor: "#f8fafc",
            borderRadius: "6px",
            marginBottom: "12px",
            border: "1px solid #e2e8f0"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <IconRobot size={14} style={{ color: "#8b5cf6" }} />
              <Text size="xs" c="dimmed">AI Generated</Text>
            </div>
            <Badge color="blue" variant="light" size="sm">
              {ringkasan?.length || 0} kategori
            </Badge>
          </div>

          {/* Compact Table */}
          <Table
            dataSource={ringkasan}
            columns={[
              {
                title: "Kategori",
                dataIndex: "kategori",
                key: "kategori",
                width: 180,
                render: (text) => (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "#6366f1"
                    }} />
                    <Text size="sm" fw={500}>{text}</Text>
                  </div>
                ),
              },
              {
                title: "Jumlah",
                dataIndex: "jumlah_alasan",
                key: "jumlah_alasan",
                width: 80,
                align: "center",
                render: (value) => (
                  <Badge color="green" variant="light" size="sm">
                    {value}
                  </Badge>
                ),
              },
              {
                title: "Ringkasan",
                dataIndex: "ringkasan",
                key: "ringkasan",
                render: (text) => (
                  <Text size="sm" lineClamp={2}>
                    {text}
                  </Text>
                ),
              },
            ]}
            rowKey="id"
            pagination={false}
            scroll={{ y: 400 }}
            size="small"
            expandable={{
              expandedRowRender: (record) => (
                <div style={{
                  padding: "12px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "6px",
                  margin: "4px 0",
                  border: "1px solid #e2e8f0"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                    <IconFile size={14} style={{ color: "#6366f1" }} />
                    <Text size="sm" fw={500}>Detail ({record.jumlah_alasan} item)</Text>
                  </div>
                  <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                    {record.daftar_alasan?.map((alasan, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          gap: "8px",
                          padding: "6px 8px",
                          marginBottom: "4px",
                          backgroundColor: "white",
                          borderRadius: "4px",
                          border: "1px solid #e5e7eb",
                          alignItems: "flex-start"
                        }}
                      >
                        <Badge color="blue" variant="filled" size="xs">
                          {index + 1}
                        </Badge>
                        <Text size="xs" style={{ flex: 1 }}>{alasan}</Text>
                      </div>
                    ))}
                  </div>
                </div>
              ),
              expandIcon: ({ expanded, onExpand, record }) => (
                <Button
                  type="text"
                  size="small"
                  icon={expanded ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />}
                  onClick={(e) => onExpand(record, e)}
                  style={{ color: "#6366f1" }}
                />
              ),
              rowExpandable: (record) => record.daftar_alasan?.length > 0,
            }}
            style={{
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid #e5e7eb"
            }}
          />
        </>
      )}
    </Modal>
  );
};

export default ModalRingkasanAnalisis;