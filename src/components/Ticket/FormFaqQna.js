import { Button, DatePicker, Form, Input, Select, Switch } from "antd";
import dayjs from "dayjs";
import { useEffect } from "react";

const { TextArea } = Input;

function FormFaqQna({ type = "create", data, onSubmit, isLoading }) {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      ...data,
      effective_date: data?.effective_date ? dayjs(data.effective_date) : null,
      expired_date: data?.expired_date ? dayjs(data.expired_date) : null,
      is_active: data?.is_active ?? true,
    });
  }, [data, form]);

  const handleFinish = (values) => {
    const payload = {
      ...values,
      effective_date: values.effective_date?.format("YYYY-MM-DD"),
      expired_date: values.expired_date?.format("YYYY-MM-DD"),
    };

    onSubmit(payload);
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      <Form.Item
        name="question"
        label="Pertanyaan"
        rules={[{ required: true, message: "Pertanyaan harus diisi" }]}
      >
        <TextArea rows={3} placeholder="Masukkan pertanyaan" />
      </Form.Item>

      <Form.Item
        name="answer"
        label="Jawaban"
        rules={[{ required: true, message: "Jawaban harus diisi" }]}
      >
        <TextArea rows={5} placeholder="Masukkan jawaban" />
      </Form.Item>

      <Form.Item
        name="regulation_ref"
        label="Referensi Peraturan"
        rules={[{ required: true, message: "Referensi peraturan harus diisi" }]}
      >
        <Input placeholder="Masukkan referensi peraturan" />
      </Form.Item>

      {/* <Form.Item
        name="sub_category_id"
        label="Sub Kategori"
        rules={[{ required: true, message: "Sub kategori harus dipilih" }]}
      >
        <Select placeholder="Pilih sub kategori">
        </Select>
      </Form.Item> */}

      <Form.Item
        name="effective_date"
        label="Tanggal Efektif"
        rules={[{ required: true, message: "Tanggal efektif harus diisi" }]}
      >
        <DatePicker style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="expired_date" label="Tanggal Kadaluarsa">
        <DatePicker style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="is_active" label="Status" valuePropName="checked">
        <Switch checkedChildren="Aktif" unCheckedChildren="Tidak Aktif" />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={isLoading}
          style={{ width: "100%" }}
        >
          {type === "create" ? "Simpan" : "Perbarui"}
        </Button>
      </Form.Item>
    </Form>
  );
}

export default FormFaqQna;
