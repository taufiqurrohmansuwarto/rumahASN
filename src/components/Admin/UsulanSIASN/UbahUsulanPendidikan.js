import { createUsulanPeremajaanPendidikan } from "@/services/admin.services";
import { useMutation } from "@tanstack/react-query";
import { Button, message } from "antd";
import { IconEdit } from "@tabler/icons-react";
import { useState } from "react";
import ModalUbahPendidikan from "./ModalUbahPendidikan";

const UbahUsulanPendidikan = ({ row }) => {
  const [showModal, setShowModal] = useState(false);
  const [usulanId, setUsulanId] = useState(null);
  const [currentRow, setCurrentRow] = useState(null);

  const { mutate: createUsulanPeremajaan, isLoading: loadingCreateUsulan } =
    useMutation({
      mutationFn: createUsulanPeremajaanPendidikan,
      onSuccess: (data) => {
        setCurrentRow(row);
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
  };

  return (
    <>
      <ModalUbahPendidikan
        open={showModal}
        usulanId={usulanId}
        row={row}
        onCancel={handleCloseModal}
        currentRow={currentRow}
        nip={row?.nipBaru}
      />
      <Button
        loading={loadingCreateUsulan}
        disabled={loadingCreateUsulan}
        size="small"
        icon={<IconEdit size={14} />}
        type="primary"
        onClick={handleShowModal}
      />
    </>
  );
};

export default UbahUsulanPendidikan;
