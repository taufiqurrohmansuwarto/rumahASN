import { createUsulanPeremajaanPendidikan } from "@/services/admin.services";
import { useMutation } from "@tanstack/react-query";
import { Button, message } from "antd";
import { IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import ModalHapusPendidikan from "./ModalHapusPendidikan";

function HapusUsulanPendidikan({ row }) {
  const [showModal, setShowModal] = useState(false);
  const [usulanId, setUsulanId] = useState(null);

  const { mutate: createUsulanPeremajaan, isLoading: loadingCreateUsulan } =
    useMutation({
      mutationFn: createUsulanPeremajaanPendidikan,
      onSuccess: (data) => {
        setShowModal(true);
        setUsulanId(data?.usulan_pendidikan_id);
      },
      onError: (error) => {
        message.error(error.message);
      },
    });

  const handleShowModal = () => {
    createUsulanPeremajaan({
      nip: row?.nipBaru,
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setUsulanId(null);
  };

  return (
    <>
      <ModalHapusPendidikan
        open={showModal}
        usulanId={usulanId}
        row={row}
        onCancel={handleCloseModal}
      />
      <Button
        loading={loadingCreateUsulan}
        disabled={loadingCreateUsulan}
        size="small"
        icon={<IconTrash size={14} />}
        onClick={handleShowModal}
        type="primary"
        danger
      />
    </>
  );
}

export default HapusUsulanPendidikan;
