import { ActionIcon, Indicator, Tooltip } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons";
import { Modal, Typography } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";

const ModalDisparitasData = ({ open, onCancel, onOk }) => {
  const router = useRouter();

  const handleLihat = (type) => {
    if (type === "SKP") {
      router.push("/pemutakhiran-data/laporan-kinerja");
    }
  };

  return (
    <Modal
      footer={null}
      width={600}
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      title="Disparitas Data"
    >
      <ol>
        <li onClick={() => handleLihat("SKP")}>
          Anda belum mengisi SKP Tahun 2024 <a>lihat</a>
        </li>

        <li>
          Nama anda tidak sesuai dengan SIASN <a>lihat</a>
        </li>
        <li>
          Jabatan anda tidak sesuai dengan SIASN <a>lihat</a>
        </li>
        <li>
          Pangkat tidak sesuai sesuai dengan SIASN <a>lihat</a>
        </li>
        <li>
          Pendidikan tidak sesuai dengan SIASN <a>lihat</a>
        </li>
        <li>
          Unit Organisasi tidak sesuai dengan SIASN <a>lihat</a>
        </li>
        <li>
          KPPN tidak sesuai <a>lihat</a>
        </li>
      </ol>
    </Modal>
  );
};

function DisparitasData() {
  const [showModal, setShowModal] = useState(false);
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <ModalDisparitasData
        open={showModal}
        onCancel={handleCloseModal}
        onOk={handleCloseModal}
      />
      <Tooltip label="Disparitas Data">
        <div>
          <Indicator label="6" size={16} color="red">
            <ActionIcon
              onClick={handleShowModal}
              variant="light"
              size="sm"
              color="red"
            >
              <IconAlertTriangle />
            </ActionIcon>
          </Indicator>
        </div>
      </Tooltip>
    </>
  );
}

export default DisparitasData;
