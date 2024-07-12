import TableUsulan from "@/components/RiwayatUsulan/TableUsulan";
import {
  trackingPencantumanGelarByNipFasilitator,
  trackingPerbaikanNamaByNipFasilitator,
} from "@/services/siasn-services";
import { ActionIcon } from "@mantine/core";
import { IconSchool } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { Modal, Tooltip } from "antd";
import { useState } from "react";

const ModalUsulan = ({ open, onClose, nip }) => {
  const { data, isLoading } = useQuery(
    ["usulan-pencantuman-gelar-by-nip", nip],
    () => trackingPencantumanGelarByNipFasilitator(nip),
    {
      enabled: !!nip,
      refetchOnWindowFocus: false,
    }
  );

  return (
    <Modal
      width={850}
      open={open}
      onCancel={onClose}
      title={"Usulan Pencantuman Gelar"}
      footer={null}
    >
      <TableUsulan data={data} isLoading={isLoading} />
    </Modal>
  );
};

const TrackingPencantumanGelarByNip = ({ nip }) => {
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
      <Tooltip title="Usulan Pencantuman Gelar">
        <ActionIcon onClick={handleOpen} variant="light" color="indigo">
          <IconSchool size="1rem" />
        </ActionIcon>
      </Tooltip>
    </>
  );
};

export default TrackingPencantumanGelarByNip;
