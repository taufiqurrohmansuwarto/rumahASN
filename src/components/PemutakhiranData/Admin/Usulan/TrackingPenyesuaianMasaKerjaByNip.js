import TableUsulan from "@/components/RiwayatUsulan/TableUsulan";
import { trackingPenyesuaianMasaKerjaByNip } from "@/services/siasn-services";
import { ActionIcon } from "@mantine/core";
import { IconCalendar } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { Modal, Tooltip } from "antd";
import { useState } from "react";

const ModalUsulan = ({ open, onClose, nip }) => {
  const { data, isLoading } = useQuery(
    ["usulan-penyesuaian-masa-kerja-by-nip", nip],
    () => trackingPenyesuaianMasaKerjaByNip(nip),
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
      title={"Usulan Penyesuaian Masa Kerja"}
      footer={null}
    >
      <TableUsulan data={data} isLoading={isLoading} />
    </Modal>
  );
};

const TrackingPenyesuaianMasaKerjaByNip = ({ nip }) => {
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
      <Tooltip title="Usulan Penyesuaian Masa Kerja">
        <ActionIcon onClick={handleOpen} variant="light" color="indigo">
          <IconCalendar size="1rem" />
        </ActionIcon>
      </Tooltip>
    </>
  );
};

export default TrackingPenyesuaianMasaKerjaByNip;
