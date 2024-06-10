import RefJenisUsulan from "@/components/RiwayatUsulan/RefJenisUsulan";
import { ActionIcon } from "@mantine/core";
import { IconHistory } from "@tabler/icons";
import { Modal, Tooltip } from "antd";
import { useState } from "react";

const ModalUsulan = ({ open, onClose, nip }) => {
  return (
    <Modal centered open={open} onCancel={onClose} title={"Usulan Lainnya"}>
      <RefJenisUsulan nip={nip} />
    </Modal>
  );
};

const TrackingUsulanLainnyaByNip = ({ nip }) => {
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
      <Tooltip title="Usulan Lainnya">
        <ActionIcon onClick={handleOpen} variant="light" color="indigo">
          <IconHistory size="1rem" />
        </ActionIcon>
      </Tooltip>
    </>
  );
};

export default TrackingUsulanLainnyaByNip;
