import TableUsulan from "@/components/RiwayatUsulan/TableUsulan";
import { trackingPerbaikanNamaByNipFasilitator } from "@/services/siasn-services";
import { ActionIcon } from "@mantine/core";
import { IconEyeCheck } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { Modal, Tooltip } from "antd";
import { useState } from "react";

const ModalUsulan = ({ open, onClose, nip }) => {
  const { data, isLoading } = useQuery(
    ["usulan-perbaikan-nama-by-nip", nip],
    () => trackingPerbaikanNamaByNipFasilitator(nip),
    { enabled: !!nip }
  );

  return (
    <Modal open={open} onCancel={onClose} title={"Usulan Perbaikan Nama"}>
      <TableUsulan data={data} isLoading={isLoading} />
    </Modal>
  );
};

const TrackingPerbaikanNamaByNip = ({ nip }) => {
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
      <Tooltip title="Usulan Perbaikan Nama">
        <ActionIcon onClick={handleOpen} variant="light" color="indigo">
          <IconEyeCheck size="1rem" />
        </ActionIcon>
      </Tooltip>
    </>
  );
};

export default TrackingPerbaikanNamaByNip;
