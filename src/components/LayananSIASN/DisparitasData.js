import { getDisparitas } from "@/services/master.services";
import { ActionIcon, Badge, Indicator, Text, Tooltip } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { Modal } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";

const ModalDisparitasData = ({ open, onCancel, onOk }) => {
  const router = useRouter();

  const { data, isLoading } = useQuery(
    ["disparitas-personal"],
    () => getDisparitas(),
    {}
  );

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
      {JSON.stringify(data)}
    </Modal>
  );
};

const disparitasButton = (
  <ActionIcon radius="xs" onClick={null} variant="light" size="xs" color="red">
    <IconAlertTriangle />
  </ActionIcon>
);
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
      <Tooltip label="Anda memiliki data yang tidak sesuai dengan SIASN">
        <div>
          <Indicator label="6" size={16} color="red">
            <Badge
              onClick={handleShowModal}
              sx={{
                cursor: "pointer",
              }}
              color="red"
              variant="outline"
              pr={3}
              leftSection={disparitasButton}
            >
              <Text mr="sm">Disparitas Data </Text>
            </Badge>
          </Indicator>
        </div>
      </Tooltip>
    </>
  );
}

export default DisparitasData;
