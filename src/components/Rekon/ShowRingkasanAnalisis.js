import { Button } from "antd";
import React, { useState } from "react";
import ModalRingkasanAnalisis from "./ModalRingkasanAnalisis";

const ShowRingkasanAnalisis = ({ periode }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="default"
        onClick={() => setOpen(true)}
        size="small"
      >
        Ringkasan
      </Button>
      <ModalRingkasanAnalisis
        open={open}
        onClose={() => setOpen(false)}
        periode={periode}
      />
    </>
  );
};

export default ShowRingkasanAnalisis;