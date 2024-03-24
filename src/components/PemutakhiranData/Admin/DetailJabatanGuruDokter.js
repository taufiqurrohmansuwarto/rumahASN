import { QuestionCircleOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import { useRouter } from "next/router";
import React, { useState } from "react";
import CompareJabatanDokterByNip from "./CompareJabatanDokterByNip";
import CompareJabatanGuruByNip from "./CompareJabatanGuruByNip";
import { Stack } from "@mantine/core";

const ModalDetailJabatan = ({ open, handleClose, nip }) => {
  return (
    <Modal
      title="Detail Jabatan"
      open={open}
      onCancel={handleClose}
      centered
      width={850}
      footer={null}
    >
      <Stack>
        <CompareJabatanDokterByNip nip={nip} />
        <CompareJabatanGuruByNip nip={nip} />
      </Stack>
    </Modal>
  );
};

function DetailJabatanGuruDokter() {
  const router = useRouter();
  const { nip } = router.query;
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <QuestionCircleOutlined
        size={14}
        style={{
          cursor: "pointer",
        }}
        onClick={handleOpen}
      />
      <ModalDetailJabatan open={open} nip={nip} handleClose={handleClose} />
    </>
  );
}

export default DetailJabatanGuruDokter;
