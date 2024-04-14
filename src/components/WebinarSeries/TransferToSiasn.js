import { Button, Form, Input, Modal } from "antd";
import React, { useEffect } from "react";

import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.locale("id");
dayjs.extend(relativeTime);

const FormModal = ({ open, handleClose, currentWebinar }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (currentWebinar) {
      form.setFieldsValue({
        // tambahan
        instansiId: "",
        jenisDiklatId: "",
        jenisKursus: "",
        jenisKursusSertipikat: "",
        lokasiId: "",
        // akhir dari tambahan
        nama: currentWebinar.nama,
        tahunKursus: dayjs(currentWebinar?.start_date).format("YYYY"),
        tanggalKursus: dayjs(currentWebinar?.start_date).format("DD-MM-YYYY"),
        selesaiKursus: dayjs(currentWebinar?.end_date).format("DD-MM-YYYY"),
        nomorSertipikat: currentWebinar?.certificate_number,
        namaKursus: currentWebinar?.title,
        jumlahJam: currentWebinar?.hour,
        institusiPenyelenggara: currentWebinar?.organizer,
      });
    }
  }, [currentWebinar, form]);

  const handleFinish = async () => {
    const values = await form.validateFields();
    const data = {
      instansi_id: "",
      ...values,
    };
  };

  return (
    <Modal open={open} onCancel={handleClose}>
      <Form form={form} onFinish={handleFinish}>
        <Form.Item>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

function TransferToSiasn({ currentWebinar }) {
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button>Tambahkan ke SIASN</Button>
    </div>
  );
}

export default TransferToSiasn;
