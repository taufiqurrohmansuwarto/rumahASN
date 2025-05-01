import { useQuery } from "@tanstack/react-query";
import { Button, DatePicker, Form, Input, Select, Switch } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

import { subCategories } from "@/services/index";

const { TextArea } = Input;

function FormFaqQna({ type = "create", data, onSubmit, isLoading }) {
  const [form] = Form.useForm();
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
  });

  const { data: dataSubCategories, isLoading: isLoadingSubCategories } =
    useQuery(["sub-categories", query], () => subCategories(query), {
      enabled: !!query,
      keepPreviousData: true,
    });

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        ...data,
        effective_date: data?.effective_date
          ? dayjs(data.effective_date)
          : null,
        expired_date: data?.expired_date ? dayjs(data.expired_date) : null,
        is_active: data?.is_active ?? true,
      });
    }
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
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{ is_active: true }}
    >
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

      <Form.Item
        name="sub_category_id"
        label="Sub Kategori"
        rules={[{ required: true, message: "Sub kategori harus dipilih" }]}
      >
        <Select
          placeholder="Pilih sub kategori"
          showSearch
          filterOption={(input, option) =>
            option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          onSearch={(value) => {
            setQuery({ ...query, search: value });
          }}
          loading={isLoadingSubCategories}
          options={(dataSubCategories?.data || []).map((item) => ({
            label: `${item.name} (${item.category.name})`,
            value: item.id,
          }))}
        />
      </Form.Item>

      <Form.Item
        name="effective_date"
        label="Tanggal Efektif"
        rules={[{ required: true, message: "Tanggal efektif harus diisi" }]}
      >
        <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
      </Form.Item>

      <Form.Item name="expired_date" label="Tanggal Kadaluarsa">
        <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
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
