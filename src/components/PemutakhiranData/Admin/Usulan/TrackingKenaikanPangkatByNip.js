import TableUsulan from "@/components/RiwayatUsulan/TableUsulan";
import { trackingKenaikanPangkatByNipFasilitator } from "@/services/siasn-services";
import { ActionIcon } from "@mantine/core";
import { IconBadges } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { Modal, Tooltip } from "antd";
import { useState } from "react";

const ModalUsulan = ({ open, onClose, nip }) => {
  const { data, isLoading } = useQuery(
    ["usulan-kp-by-nip", nip],
    () => trackingKenaikanPangkatByNipFasilitator(nip),
    { enabled: !!nip }
  );

  return (
    <Modal
      width={800}
      open={open}
      onCancel={onClose}
      title={"Usulan Kenaikan Pangkat"}
    >
      <TableUsulan data={data} isLoading={isLoading} />
    </Modal>
  );
};

const TrackingKenaikanPangkatByNip = ({ nip }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <ModalUsulan nip={nip} open={open} onClose={handleClose} />
      <Tooltip title="Usulan Kenaikan Pangkat">
        <ActionIcon onClick={handleOpen} variant="light" color="indigo">
          <IconBadges size="1rem" />
        </ActionIcon>
      </Tooltip>
    </>
  );
};

export default TrackingKenaikanPangkatByNip;
