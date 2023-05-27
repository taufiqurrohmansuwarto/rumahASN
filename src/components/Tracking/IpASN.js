import { getIpasn } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { Button, Form, Input, Modal } from "antd";
import { useState } from "react";

const IPAsnModal = ({ open, handleCancel, data }) => {
  const [form] = Form.useForm();
  return (
    <Modal
      width={800}
      open={open}
      onCancel={handleCancel}
      title="Hasil IP ASN"
      centered
    >
      {data?.length && (
        <>
          <Form layout="vertical" form={form}>
            <Form.Item label="Nama">
              <Input value={data[0].nama} />
            </Form.Item>
            <Form.Item label="Sub Total">
              <Input value={data[0].subtotal} />
            </Form.Item>
            <Form.Item label="Kualifikasi">
              <Input value={data[0].kualifikasi} />
            </Form.Item>
            <Form.Item label="Keterangan Kualifikasi">
              <Input value={data[0].keterangan_kualifikasi} />
            </Form.Item>
            <Form.Item label="Kompetensi">
              <Input value={data[0].kompetensi} />
            </Form.Item>
            <Form.Item label="Keterangan Kualifikasi">
              <Input.TextArea rows={5} value={data[0].keterangan_kompetensi} />
            </Form.Item>
            <Form.Item label="Kinerja">
              <Input value={data[0].kinerja} />
            </Form.Item>
            <Form.Item label="Keterangan Kinerja">
              <Input.TextArea rows={5} value={data[0].keterangan_kinerja} />
            </Form.Item>
            <Form.Item label="Disiplin">
              <Input value={data[0].disiplin} />
            </Form.Item>
            <Form.Item label="Keterangan Disiplin">
              <Input.TextArea rows={5} value={data[0].keterangan_disiplin} />
            </Form.Item>
          </Form>
        </>
      )}
    </Modal>
  );
};

function IpASN() {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleCancelOpen = () => setOpen(false);
  const [nip, setNip] = useState(null);

  const { data, isFetching, refetch } = useQuery(
    ["ip-asn", nip],
    () => getIpasn(nip),
    {
      enabled: !!nip,
      refetchOnWindowFocus: false,
      onSuccess: () => {
        handleOpen();
      },
    }
  );

  const handleFinish = async () => {
    try {
      const value = await form.validateFields();
      setNip(value.nip);
      refetch();
    } catch (error) {
      setNip(null);
    }
  };

  return (
    <>
      <Form onFinish={handleFinish} name="form" form={form} layout="vertical">
        <Form.Item
          name="nip"
          label="NIP Pegawai"
          required
          rules={[{ required: true, message: "NIP tidak boleh kosong" }]}
        >
          <Input
            style={{
              width: "100%",
            }}
          />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" loading={isFetching}>
            Cari
          </Button>
        </Form.Item>
        <IPAsnModal open={open} data={data} handleCancel={handleCancelOpen} />
      </Form>
    </>
  );
}

export default IpASN;
