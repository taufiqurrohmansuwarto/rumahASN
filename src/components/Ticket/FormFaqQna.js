import { useQuery } from "@tanstack/react-query";
import { Button, Col, DatePicker, Form, Input, Row, Select, Switch } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

import { subCategories } from "@/services/index";
import { renderMarkdown, uploadFile } from "@/utils/client-utils";
import { MarkdownEditor } from "@primer/react/drafts";

const { TextArea } = Input;

function FormFaqQna({ type = "create", data, onSubmit, isLoading }) {
  const [form] = Form.useForm();
  const [answerContent, setAnswerContent] = useState("");

  const { data: dataSubCategories, isLoading: isLoadingSubCategories } =
    useQuery(["sub-categories", "all"], () => subCategories({ limit: -1 }), {
      placeholderData: (previousData) => previousData,
    });

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        ...data,
        sub_category_ids: data?.sub_categories?.map((sc) => sc.id) || [],
        effective_date: data?.effective_date
          ? dayjs(data.effective_date)
          : null,
        expired_date: data?.expired_date ? dayjs(data.expired_date) : null,
        is_active: data?.is_active ?? true,
        tags: data?.tags || [],
      });
      setAnswerContent(data?.answer || "");
    }
  }, [data, form]);

  const handleFinish = (values) => {
    const payload = {
      ...values,
      answer: answerContent, // Use markdown content from state
      effective_date: values.effective_date?.format("YYYY-MM-DD"),
      expired_date: values.expired_date?.format("YYYY-MM-DD"),
      create_new_version: data?.create_new_version || false,
    };

    onSubmit(payload);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{ is_active: true, confidence_score: 1.0 }}
      size="small"
    >
      <Form.Item
        name="question"
        label="Pertanyaan"
        rules={[{ required: true, message: "Wajib diisi" }]}
        style={{ marginBottom: 12 }}
      >
        <TextArea rows={2} placeholder="Tulis pertanyaan" />
      </Form.Item>

      <Form.Item
        label="Jawaban"
        required
        style={{ marginBottom: 12 }}
      >
        <div
          style={{
            border: "1px solid #d9d9d9",
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          <MarkdownEditor
            value={answerContent}
            fullHeight
            acceptedFileTypes={[
              "image/*",
              ".doc",
              ".docx",
              ".xls",
              ".xlsx",
              ".txt",
              ".pdf",
            ]}
            onChange={setAnswerContent}
            placeholder="Tulis jawaban dalam format markdown. Gunakan formatting seperti **bold**, *italic*, list, dan lainnya untuk membuat jawaban lebih terstruktur."
            onRenderPreview={renderMarkdown}
            onUploadFile={uploadFile}
            mentionSuggestions={null}
          />
        </div>
      </Form.Item>

      <Row gutter={12}>
        <Col xs={24} md={16}>
      <Form.Item
        name="regulation_ref"
            label="Referensi"
            rules={[{ required: true, message: "Wajib diisi" }]}
            style={{ marginBottom: 12 }}
      >
            <Input placeholder="Misal: PP No. 11 Tahun 2017" />
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item
            name="confidence_score"
            label="Skor"
            style={{ marginBottom: 12 }}
          >
            <Input
              type="number"
              min={0}
              max={1}
              step={0.1}
              placeholder="0.0 - 1.0"
            />
      </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="sub_category_ids"
        label="Kategori"
        rules={[{ required: true, message: "Wajib pilih kategori" }]}
        style={{ marginBottom: 12 }}
      >
        <Select
          placeholder="Pilih kategori"
          showSearch
          mode="multiple"
          filterOption={(input, option) =>
            option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          loading={isLoadingSubCategories}
          options={(dataSubCategories?.data || []).map((item) => ({
            label: `${item.name} (${item.category.name})`,
            value: item.id,
          }))}
        />
      </Form.Item>

      <Form.Item name="tags" label="Tags" style={{ marginBottom: 12 }}>
        <Select
          mode="tags"
          placeholder="Ketik tag, tekan Enter"
          tokenSeparators={[","]}
        />
      </Form.Item>

      <Row gutter={12}>
        <Col xs={24} sm={12} md={8}>
      <Form.Item
        name="effective_date"
            label="Mulai Berlaku"
            rules={[{ required: true, message: "Wajib diisi" }]}
            style={{ marginBottom: 12 }}
      >
        <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
      </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Form.Item
            name="expired_date"
            label="Berakhir"
            style={{ marginBottom: 12 }}
          >
        <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
      </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item
            name="is_active"
            label="Status"
            valuePropName="checked"
            style={{ marginBottom: 12 }}
          >
            <Switch checkedChildren="Aktif" unCheckedChildren="Nonaktif" />
      </Form.Item>
        </Col>
      </Row>

      <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
        <Button type="primary" htmlType="submit" loading={isLoading} block>
          {type === "create" ? "Simpan" : "Perbarui"}
        </Button>
      </Form.Item>
    </Form>
  );
}

export default FormFaqQna;
