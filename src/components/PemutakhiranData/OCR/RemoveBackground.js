import { Button, Modal, message, Skeleton } from "antd";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { IconPhotoOff, IconDownload } from "@tabler/icons-react";

import { ocrRemoveBackground } from "@/services/microservices.services";

const ModalRemoveBackground = ({ open, onCancel, data, loading }) => {
  const handleDownload = () => {
    const imageSource = data?.result || data?.url || data?.image_url;
    if (!imageSource) return message.error("Tidak ada gambar untuk diunduh");

    const link = document.createElement("a");
    link.href = imageSource;
    link.download = `background-removed-${Date.now()}.${
      data?.format?.toLowerCase() || "png"
    }`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("Gambar berhasil diunduh");
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
      title="Hasil Hapus Background"
    >
      {loading && (
        <div style={{ padding: "20px 0" }}>
          <Skeleton active />
        </div>
      )}

      {data && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <img
              src={data.result || data.url || data.image_url}
              alt="Background Removed"
              style={{
                maxWidth: "100%",
                maxHeight: "400px",
                objectFit: "contain",
                borderRadius: 8,
              }}
            />
          </div>
          <Button
            type="primary"
            icon={<IconDownload size={16} />}
            onClick={handleDownload}
            block
          >
            Unduh Gambar
          </Button>
        </>
      )}
    </Modal>
  );
};

function RemoveBackground({ url }) {
  const [openModal, setOpenModal] = useState(false);
  const [data, setData] = useState(null);

  const handleCloseModal = () => {
    setOpenModal(false);
    setData(null);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => ocrRemoveBackground(data),
    onSuccess: (response) => {
      if (response?.success && response?.data) {
        setData(response.data);
        setOpenModal(true);
      }
    },
    onMutate: () => {
      setData(null);
      setOpenModal(true);
    },
    onError: (error) => {
      message.error(
        error?.response?.data?.message || "Gagal menghapus background"
      );
      setOpenModal(false);
    },
  });

  const handleRemoveBackground = () => {
    mutate({ url });
  };

  return (
    <>
      <ModalRemoveBackground
        open={openModal}
        onCancel={handleCloseModal}
        data={data}
        loading={isPending}
      />
      <Button
        loading={isPending}
        onClick={handleRemoveBackground}
        icon={<IconPhotoOff size={16} />}
      >
        Hapus Background
      </Button>
    </>
  );
}

export default RemoveBackground;
