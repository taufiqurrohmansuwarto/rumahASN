import { Button, DatePicker, Form, Input, Upload, message } from "antd";
import { IconUpload } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { uploadRekamanVerbatim } from "@/services/assesor-ai.services";

function UploadVerbatim() {
  const [form] = Form.useForm();

  const { mutate, isLoading } = useMutation({
    mutationFn: uploadRekamanVerbatim,
    onSuccess: (data) => {
      message.success("Berhasil mengupload rekaman");
    },
    onError: (error) => {
      message.error("Gagal mengupload rekaman");
    },
  });

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload = {
      nama_asesor: values.nama_asesor,
      nama_asesi: values.nama_asesi,
      tgl_wawancara: values.tgl_wawancara.format("YYYY-MM-DD"),
      file: values?.file?.fileList[0]?.originFileObj,
    };
    mutate(payload);
  };

  return (
    <div>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="file" label="File">
          <Upload accept=".mp3,.wav" maxCount={1}>
            <Button icon={<IconUpload />}>Upload</Button>
          </Upload>
        </Form.Item>
        <Form.Item name="nama_asesor" label="Nama Asesor">
          <Input />
        </Form.Item>
        <Form.Item name="nama_asesi" label="Nama Asesi">
          <Input />
        </Form.Item>
        <Form.Item name="tgl_wawancara" label="Tanggal Wawancara">
          <DatePicker />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default UploadVerbatim;
