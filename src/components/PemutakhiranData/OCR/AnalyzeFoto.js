import { Button, Modal, Skeleton, Tag, Divider, message, Space } from "antd";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Stack, Text, Group } from "@mantine/core";
import {
  IconPhotoCheck,
  IconShirt,
  IconPalette,
  IconCircleCheck,
  IconAlertCircle,
} from "@tabler/icons-react";

import { ocrAnalyze } from "@/services/microservices.services";

const ShowAnalysisResult = ({ data }) => {
  const { background_color, clothing, image_quality, khaki_pns } = data;

  return (
    <Stack gap="xs">
      {/* Kualitas Gambar */}
      <Group gap="xs" wrap="nowrap">
        <IconPhotoCheck size={16} color="#1890ff" />
        <Text size="sm" fw={600}>
          Kualitas:
        </Text>
        <Tag
          color={image_quality.is_acceptable ? "green" : "red"}
          style={{ padding: "2px 8px", fontSize: 12 }}
        >
          {image_quality.is_acceptable ? "Diterima" : "Tidak Diterima"}
        </Tag>
        <Tag color={image_quality.is_blurry ? "red" : "green"}>
          {image_quality.is_blurry ? "Blur" : "Tidak Blur"}
        </Tag>
      </Group>

      <Divider style={{ margin: "8px 0" }} />

      {/* Pakaian */}
      <Group gap="xs" wrap="nowrap">
        <IconShirt size={16} color="#52c41a" />
        <Text size="sm" fw={600}>
          Pakaian:
        </Text>
        {clothing.detected ? (
          <>
            <div
              style={{
                width: 16,
                height: 16,
                backgroundColor: clothing.hex,
                border: "1px solid #d9d9d9",
                borderRadius: 4,
              }}
            />
            <Text size="sm">{clothing.name}</Text>
            <Tag>{clothing.hex}</Tag>
          </>
        ) : (
          <Text size="sm" c="dimmed">
            Tidak Terdeteksi
          </Text>
        )}
      </Group>

      <Divider style={{ margin: "8px 0" }} />

      {/* Warna Background */}
      <Group gap="xs" wrap="nowrap">
        <IconPalette size={16} color="#722ed1" />
        <Text size="sm" fw={600}>
          Background:
        </Text>
        <div
          style={{
            width: 16,
            height: 16,
            backgroundColor: background_color.hex,
            border: "1px solid #d9d9d9",
            borderRadius: 4,
          }}
        />
        <Text size="sm">{background_color.name}</Text>
        <Tag>{background_color.hex}</Tag>
        <Tag>{background_color.percentage}%</Tag>
      </Group>

      <Divider style={{ margin: "8px 0" }} />

      {/* Status Khaki PNS */}
      <Group gap="xs" wrap="nowrap">
        {khaki_pns.is_khaki_pns ? (
          <IconCircleCheck size={16} color="#52c41a" />
        ) : (
          <IconAlertCircle size={16} color="#fa8c16" />
        )}
        <Text size="sm" fw={600}>
          Khaki PNS:
        </Text>
        <Tag
          color={khaki_pns.is_khaki_pns ? "green" : "orange"}
          style={{ padding: "2px 8px", fontSize: 12 }}
        >
          {khaki_pns.is_khaki_pns ? "Ya" : "Bukan"} ({khaki_pns.confidence}%)
        </Tag>
      </Group>
      <Text size="xs" c="dimmed" style={{ paddingLeft: 24 }}>
        {khaki_pns.reason}
      </Text>
    </Stack>
  );
};

const ModalAnalysisFoto = ({ open, onCancel, data, loading }) => {
  return (
    <Modal open={open} onCancel={onCancel} footer={null} width={800} closable>
      {loading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : data ? (
        <ShowAnalysisResult data={data} />
      ) : null}
    </Modal>
  );
};

function AnalyzeFoto({ url, jenis_jabatan }) {
  const [openModal, setOpenModal] = useState(false);
  const [data, setData] = useState(null);

  const handleCloseModal = () => {
    setOpenModal(false);
    setData(null);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => ocrAnalyze(data),
    onSuccess: (response) => {
      if (response?.success && response?.data) {
        setData(response.data);
        setOpenModal(true);
      }
    },
    onMutate: () => {
      setData(null);
    },
    onError: (error) => {
      message.error(error?.response?.data?.message || "Gagal menganalisis foto");
    },
  });

  const handleAnalyze = () => {
    mutate({ url, jenis_jabatan });
  };

  return (
    <>
      <ModalAnalysisFoto
        open={openModal}
        onCancel={handleCloseModal}
        data={data}
        loading={isPending}
      />
      <Button loading={isPending} onClick={handleAnalyze}>
        Analisis Foto
      </Button>
    </>
  );
}

export default AnalyzeFoto;
