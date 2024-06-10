import TableUsulan from "@/components/RiwayatUsulan/TableUsulan";
import { ActionIcon } from "@mantine/core";
import { IconBarrierBlock } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { Modal, Tooltip } from "antd";
import { useState } from "react";

const ModalUsulan = ({ open, onClose, nip }) => {
  const { data, isLoading } = useQuery(
    ["usulan-pemberhentian-by-nip", nip],
    () => trackingPemberhentianByNipFasilitator(nip),
    { enabled: !!nip }
  );

  return (
    <Modal
      width={800}
      open={open}
      onCancel={onClose}
      title={"Usulan Pemberhentian"}
    >
      <TableUsulan data={data} isLoading={isLoading} />
    </Modal>
  );
};

const TrackingPemberhentianByNip = ({ nip }) => {
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
      <Tooltip title="Usulan Pemberhentian">
        <ActionIcon onClick={handleOpen} variant="light" color="indigo">
          <IconBarrierBlock size="1rem" />
        </ActionIcon>
      </Tooltip>
    </>
  );
};

export default TrackingPemberhentianByNip;
