import { Button, Modal, message, Image, Spin, Space, Tag } from "antd";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Stack, Text } from "@mantine/core";
import { IconPhotoEdit } from "@tabler/icons-react";

import { ocrChangeBackground } from "@/services/microservices.services";

const BACKGROUND_COLORS = {
  MADYA: "6a2b2b",
  PRATAMA: "ca3a31",
  ADMINISTRATOR: "161efd",
  PENGAWAS: "2e6a10",
  FUNGSIONAL: "666666",
  PELAKSANA: "fc6b17",
};

const ModalChangeBackground = ({
  open,
  onCancel,
  data,
  loading,
  selectedColor,
  onColorChange,
  onSubmit,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
      closable
      title={data ? "Hasil Ganti Background" : "Pilih Warna Background"}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
          <Text size="sm" style={{ marginTop: 16 }}>
            Memproses foto...
          </Text>
        </div>
      ) : data ? (
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Background berhasil diganti
          </Text>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <img
              src={data.result || data.url || data.image_url}
              alt="Background Changed"
              style={{
                maxWidth: "100%",
                maxHeight: "400px",
                objectFit: "contain",
                borderRadius: 8,
              }}
            />
          </div>
        </Stack>
      ) : (
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div>
            <Text size="sm" fw={500} mb={8}>
              Pilih Jenis Jabatan:
            </Text>
            <Space wrap size="small">
              {Object.entries(BACKGROUND_COLORS).map(([key, color]) => (
                <Tag
                  key={key}
                  color={`#${color}`}
                  style={{
                    cursor: "pointer",
                    border:
                      selectedColor === color ? "3px solid #1890ff" : "none",
                    padding: "6px 12px",
                    fontSize: "13px",
                  }}
                  onClick={() => onColorChange(color)}
                >
                  {key}
                </Tag>
              ))}
            </Space>
          </div>
          <Button type="primary" onClick={onSubmit} block>
            Proses Ganti Background
          </Button>
        </Space>
      )}
    </Modal>
  );
};

function ChangeBackground({ url, jenis_jabatan }) {
  const [openModal, setOpenModal] = useState(false);
  const [data, setData] = useState(null);
  const [selectedColor, setSelectedColor] = useState(
    BACKGROUND_COLORS[jenis_jabatan] || BACKGROUND_COLORS.PELAKSANA
  );

  const handleCloseModal = () => {
    setOpenModal(false);
    setData(null);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
    setData(null);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => ocrChangeBackground(data),
    onSuccess: (response) => {
      if (response?.success && response?.data) {
        setData(response.data);
      }
    },
    onError: (error) => {
      message.error(
        error?.response?.data?.message || "Gagal mengganti background"
      );
      setOpenModal(false);
    },
  });

  const handleSubmit = () => {
    mutate({ url, jenis_jabatan, background_color: selectedColor });
  };

  return (
    <>
      <ModalChangeBackground
        open={openModal}
        onCancel={handleCloseModal}
        data={data}
        loading={isPending}
        selectedColor={selectedColor}
        onColorChange={setSelectedColor}
        onSubmit={handleSubmit}
      />
      <Button
        loading={isPending}
        onClick={handleOpenModal}
        icon={<IconPhotoEdit size={16} />}
      >
        Ganti Background
      </Button>
    </>
  );
}

export default ChangeBackground;
