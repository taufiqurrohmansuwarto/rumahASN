import { useMutation } from "@tanstack/react-query";
import { checkFotoPersonalMasterWs } from "@/services/master.services";
import { Modal, Button, message, Avatar, Tooltip } from "antd";
import { useState } from "react";
import { Stack, Text, Group, Badge } from "@mantine/core";
import {
  IconPhoto,
  IconColorSwatch,
  IconShirt,
  IconCheck,
  IconDownload,
  IconSparkles,
} from "@tabler/icons-react";

const ShowData = ({ data }) => {
  if (!data?.data) return null;

  const { analysis, ai_insight, corrected_image_url } = data.data;
  const score = ai_insight?.score || 0;

  const getScoreColor = () => {
    if (score >= 80) return "green";
    if (score >= 60) return "blue";
    return "red";
  };

  const getScoreLabel = () => {
    if (score >= 80) return "Sesuai";
    if (score >= 60) return "Cukup";
    return "Perbaiki";
  };

  return (
    <Stack gap="sm">
      {/* Score Section - Compact */}
      <Group
        justify="space-between"
        align="center"
        p={10}
        style={{
          background:
            getScoreColor() === "green"
              ? "#f6ffed"
              : getScoreColor() === "blue"
              ? "#e6f7ff"
              : "#fff1f0",
          borderRadius: 6,
          border: `1px solid ${
            getScoreColor() === "green"
              ? "#b7eb8f"
              : getScoreColor() === "blue"
              ? "#91d5ff"
              : "#ffccc7"
          }`,
        }}
      >
        <Group gap={10}>
          <Text
            size={24}
            fw={700}
            style={{
              color:
                getScoreColor() === "green"
                  ? "#52c41a"
                  : getScoreColor() === "blue"
                  ? "#1890ff"
                  : "#ff4d4f",
            }}
          >
            {score}
          </Text>
          <div>
            <Text size="xs" c="dimmed">
              Skor Kepatuhan
            </Text>
            <Badge color={getScoreColor()} size="sm" radius="sm">
              {getScoreLabel()}
            </Badge>
          </div>
        </Group>
        <IconCheck
          size={28}
          color={
            getScoreColor() === "green"
              ? "#52c41a"
              : getScoreColor() === "blue"
              ? "#1890ff"
              : "#ff4d4f"
          }
          style={{ opacity: 0.15 }}
        />
      </Group>

      {/* Analysis Details - Compact */}
      <Stack gap={6}>
        <Group
          gap={8}
          wrap="nowrap"
          p={8}
          style={{ background: "#fafafa", borderRadius: 6 }}
        >
          <IconPhoto
            size={16}
            color={
              analysis?.kualitas_foto?.is_acceptable ? "#52c41a" : "#ff4d4f"
            }
          />
          <Text size="xs" c="dimmed" style={{ flex: 1 }}>
            Kualitas
          </Text>
          <Badge
            color={analysis?.kualitas_foto?.is_acceptable ? "green" : "red"}
            size="sm"
          >
            {analysis?.kualitas_foto?.is_acceptable ? "Tajam" : "Blur"}
          </Badge>
        </Group>

        <Group
          gap={8}
          wrap="nowrap"
          p={8}
          style={{ background: "#fafafa", borderRadius: 6 }}
        >
          <IconColorSwatch
            size={16}
            color={analysis?.background?.sesuai_standar ? "#52c41a" : "#fa8c16"}
          />
          <Text size="xs" c="dimmed">
            Background
          </Text>
          <Group gap={4} style={{ flex: 1 }} justify="flex-end">
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 2,
                background: analysis?.background?.hex_code || "#8c8c8c",
                border: "1px solid #d9d9d9",
              }}
            />
            <Text size="xs" fw={500}>
              {analysis?.background?.warna_terdeteksi || "-"}
            </Text>
          </Group>
          <Badge
            color={analysis?.background?.sesuai_standar ? "green" : "orange"}
            size="sm"
          >
            {analysis?.background?.sesuai_standar ? "Sesuai" : "Cek"}
          </Badge>
        </Group>

        <Group
          gap={8}
          wrap="nowrap"
          p={8}
          style={{ background: "#fafafa", borderRadius: 6 }}
        >
          <IconShirt
            size={16}
            color={analysis?.seragam?.khaki_pns ? "#52c41a" : "#fa8c16"}
          />
          <Text size="xs" c="dimmed" style={{ flex: 1 }}>
            Seragam
          </Text>
          <Badge
            color={analysis?.seragam?.khaki_pns ? "green" : "orange"}
            size="sm"
          >
            {analysis?.seragam?.khaki_pns ? "Khaki PNS" : "Bukan Khaki"}
          </Badge>
        </Group>
      </Stack>

      {/* Corrected Image */}
      {corrected_image_url && (
        <Group
          gap={8}
          wrap="nowrap"
          p={8}
          style={{ background: "#fafafa", borderRadius: 6 }}
        >
          <Avatar
            src={corrected_image_url}
            size={64}
            shape="square"
            style={{
              border: "2px solid #1890ff",
              borderRadius: 6,
            }}
          />
          <div style={{ flex: 1 }}>
            <Text size="xs" c="dimmed" mb={2}>
              Foto yang Seharusnya
            </Text>
            <Text size="xs" fw={500} c="#1890ff">
              Foto telah diperbaiki
            </Text>
          </div>
          <Button
            type="primary"
            shape="circle"
            icon={<IconDownload size={16} />}
            onClick={() => {
              const link = document.createElement("a");
              link.href = corrected_image_url;
              link.download = "foto-diperbaiki.jpg";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            title="Download Foto"
          />
        </Group>
      )}

      {/* Ringkasan */}
      {ai_insight?.ringkasan && (
        <div
          style={{
            background: "#e6f7ff",
            borderRadius: 6,
            padding: 12,
            border: "1px solid #91d5ff",
          }}
        >
          <Text size="xs" fw={600} c="#0050b3" mb={4}>
            Ringkasan
          </Text>
          <Text size="xs" c="#262626" style={{ lineHeight: 1.5 }}>
            {ai_insight.ringkasan}
          </Text>
        </div>
      )}

      {/* Rekomendasi */}
      {ai_insight?.rekomendasi && ai_insight.rekomendasi.length > 0 && (
        <div
          style={{
            background: "#fff7e6",
            borderRadius: 6,
            padding: 12,
            border: "1px solid #ffd591",
          }}
        >
          <Text size="xs" fw={600} c="#d46b08" mb={6}>
            Rekomendasi Perbaikan
          </Text>
          <Stack gap={6}>
            {ai_insight.rekomendasi.map((item, idx) => (
              <Group key={idx} gap={8} align="flex-start" wrap="nowrap">
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "#fa8c16",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 600,
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {idx + 1}
                </div>
                <Text
                  size="xs"
                  c="#262626"
                  style={{ flex: 1, lineHeight: 1.5 }}
                >
                  {item}
                </Text>
              </Group>
            ))}
          </Stack>
        </div>
      )}
    </Stack>
  );
};

const ModalCheckFotoPersonal = ({
  open,
  onCancel,
  data,
  loading,
  onCheckAgain,
}) => {
  return (
    <Modal
      centered
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
      closable
      styles={{
        body: {
          maxHeight: "70vh",
          overflowY: "auto",
          padding: "16px",
        },
      }}
    >
      {loading && <Text ta="center">Memeriksa foto...</Text>}

      {data && !loading && (
        <>
          <ShowData data={data} />
          <div
            style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <Button
              block
              onClick={onCheckAgain}
              icon={
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="1 4 1 10 7 10"></polyline>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                </svg>
              }
            >
              Cek Foto Lagi (Refresh)
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};

function CheckFotoPersonal() {
  const [data, setData] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: (refresh) => checkFotoPersonalMasterWs(refresh),
    onMutate: (refresh) => {
      // Only clear data when refreshing, not on first load
      if (refresh) {
        setData(null);
      }
    },
    onSuccess: (data) => {
      setData(data);
      setOpenModal(true);
    },
    onError: (error) => {
      message.error(error?.response?.data?.message || "Gagal memeriksa foto");
    },
  });

  const handleCheckFotoPersonal = () => {
    mutate(false); // First check without refresh
  };

  const handleCheckAgain = () => {
    mutate(true); // Check again with refresh=true
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setData(null);
  };

  return (
    <div>
      <Tooltip title="Cek Foto dengan AI">
        <Button
          type="primary"
          shape="circle"
          loading={isPending}
          onClick={handleCheckFotoPersonal}
          icon={<IconSparkles size={18} />}
        />
      </Tooltip>
      <ModalCheckFotoPersonal
        open={openModal}
        onCancel={handleCloseModal}
        data={data}
        loading={isPending}
        onCheckAgain={handleCheckAgain}
      />
    </div>
  );
}

export default CheckFotoPersonal;
