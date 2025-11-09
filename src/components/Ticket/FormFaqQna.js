import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Switch,
  Typography,
  Collapse,
  Space,
} from "antd";
import {
  QuestionCircleOutlined,
  InfoCircleOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

import { subCategories } from "@/services/index";
import { renderMarkdown, uploadFile } from "@/utils/client-utils";
import { MarkdownEditor } from "@primer/react/drafts";

const { TextArea } = Input;
const { Text, Paragraph } = Typography;
const { Panel } = Collapse;

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
      {/* Panduan - Collapsible */}
      <Collapse
        ghost
        style={{ marginBottom: 16 }}
        items={[
          {
            key: "1",
            label: (
              <Space>
                <BulbOutlined style={{ color: "#1890ff" }} />
                <Text strong style={{ color: "#1890ff" }}>
                  Panduan Membuat FAQ Berkualitas
                </Text>
              </Space>
            ),
            children: (
              <div
                style={{
                  background: "#e6f7ff",
                  padding: "12px 16px",
                  borderRadius: "6px",
                  border: "1px solid #91d5ff",
                }}
              >
                <Paragraph style={{ marginBottom: 8, fontSize: 12 }}>
                  FAQ yang baik akan membantu AI menjawab pertanyaan user dengan
                  lebih akurat. Pastikan:
                </Paragraph>
                <ul style={{ marginBottom: 0, paddingLeft: 20, fontSize: 12 }}>
                  <li>Pertanyaan spesifik dan mudah dipahami</li>
                  <li>Jawaban lengkap, terstruktur, dan to the point</li>
                  <li>Gunakan format markdown untuk tampilan lebih rapi</li>
                  <li>Sertakan referensi peraturan yang jelas</li>
                </ul>
              </div>
            ),
          },
        ]}
      />

      <Form.Item
        name="question"
        label={
          <Space size={4}>
            <span>Pertanyaan</span>
            <Text type="secondary" style={{ fontSize: 11, fontWeight: 400 }}>
              (Spesifik & jelas seperti yang ditanyakan user)
            </Text>
          </Space>
        }
        rules={[{ required: true, message: "Wajib diisi" }]}
        style={{ marginBottom: 12 }}
        tooltip={{
          title: (
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                ✅ Contoh BAIK:
              </div>
              <div style={{ marginBottom: 8 }}>
                • "Bagaimana cara mengajukan kenaikan pangkat?"
                <br />
                • "Apa persyaratan CPNS untuk lulusan S1?"
                <br />• "Berapa lama proses pencantuman gelar?"
              </div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                ❌ Contoh KURANG BAIK:
              </div>
              <div>
                • "Kenaikan pangkat" (terlalu singkat)
                <br />
                • "Bagaimana caranya?" (tidak spesifik)
                <br />• "Tentang CPNS" (terlalu umum)
              </div>
            </div>
          ),
          icon: <QuestionCircleOutlined />,
        }}
      >
        <TextArea
          rows={2}
          placeholder="Contoh: Bagaimana cara reset password MyASN jika lupa email terdaftar?"
        />
      </Form.Item>

      <Form.Item
        label={
          <Space size={4}>
            <span>Jawaban</span>
            <Text type="secondary" style={{ fontSize: 11, fontWeight: 400 }}>
              (Lengkap, terstruktur, dan mudah dipahami)
            </Text>
          </Space>
        }
        required
        style={{ marginBottom: 12 }}
        tooltip={{
          title: (
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                ✅ Tips Jawaban Berkualitas:
              </div>
              <div style={{ marginBottom: 8 }}>
                • Gunakan <strong>**bold**</strong> untuk poin penting
                <br />
                • Gunakan numbered list (1., 2., 3.) untuk langkah-langkah
                <br />
                • Gunakan bullet points untuk daftar items
                <br />
                • Gunakan &gt; blockquote untuk catatan penting
                <br />• Pisahkan paragraf dengan jelas
              </div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                📝 Contoh Format BAIK:
              </div>
              <div
                style={{
                  background: "#f5f5f5",
                  padding: 8,
                  borderRadius: 4,
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
              >
                **Pencantuman gelar dilakukan melalui SIMASTER.**
                <br />
                <br />
                Langkah-langkahnya:
                <br />
                1. Login ke aplikasi `SIMASTER`
                <br />
                2. Pilih menu Layanan Gelar
                <br />
                3. Upload dokumen ijazah
                <br />
                <br />
                &gt; **Catatan**: Proses verifikasi 5-7 hari kerja
              </div>
            </div>
          ),
          icon: <InfoCircleOutlined />,
        }}
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
            placeholder={`Contoh jawaban yang baik:

**Reset password MyASN dapat dilakukan dengan cara berikut:**

Jika Anda masih ingat email terdaftar:
1. Buka aplikasi MyASN atau website myasn.bkn.go.id
2. Klik "Lupa Password"
3. Masukkan email terdaftar
4. Cek inbox/spam email untuk link reset

Jika lupa email terdaftar:
- Hubungi admin kepegawaian instansi Anda
- Bawa dokumen identitas (KTP/KPE)
- Minta bantuan reset melalui SIMASTER

> **Penting**: Pastikan email yang terdaftar masih aktif untuk menerima link reset password.

*Referensi: Panduan Teknis MyASN BKN 2024*`}
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
            label={
              <Space size={4}>
                <span>Referensi Peraturan</span>
                <Text type="secondary" style={{ fontSize: 11, fontWeight: 400 }}>
                  (Dasar hukum/peraturan yang berlaku)
                </Text>
              </Space>
            }
            rules={[{ required: true, message: "Wajib diisi" }]}
            style={{ marginBottom: 12 }}
            tooltip={{
              title: (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    ✅ Contoh Format BAIK:
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    • "PP No. 11 Tahun 2017"
                    <br />
                    • "Permenpan RB No. 25 Tahun 2021"
                    <br />
                    • "Surat Edaran BKN No. 15 Tahun 2024"
                    <br />• "Panduan Teknis SIASN 2024"
                  </div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    💡 Tips:
                  </div>
                  <div>
                    Gunakan "-" jika tidak ada referensi peraturan spesifik,
                    tapi sebaiknya selalu ada dasar yang jelas
                  </div>
                </div>
              ),
              icon: <InfoCircleOutlined />,
            }}
          >
            <Input placeholder='Contoh: "PP No. 11 Tahun 2017" atau "Panduan MyASN BKN 2024"' />
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
        label={
          <Space size={4}>
            <span>Kategori</span>
            <Text type="secondary" style={{ fontSize: 11, fontWeight: 400 }}>
              (Pilih kategori yang paling relevan - bisa lebih dari 1)
            </Text>
          </Space>
        }
        rules={[{ required: true, message: "Wajib pilih kategori" }]}
        style={{ marginBottom: 12 }}
        tooltip={{
          title: (
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                💡 Tips Memilih Kategori:
              </div>
              <div>
                • Pilih kategori yang paling sesuai dengan topik pertanyaan
                <br />
                • Bisa pilih lebih dari 1 kategori jika relevan
                <br />• Kategori membantu AI mencari jawaban yang tepat
              </div>
            </div>
          ),
          icon: <InfoCircleOutlined />,
        }}
      >
        <Select
          placeholder="Cari dan pilih kategori yang sesuai..."
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

      <Form.Item
        name="tags"
        label={
          <Space size={4}>
            <span>Tags</span>
            <Text type="secondary" style={{ fontSize: 11, fontWeight: 400 }}>
              (Kata kunci untuk pencarian - opsional)
            </Text>
          </Space>
        }
        style={{ marginBottom: 12 }}
        tooltip={{
          title: (
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                📌 Contoh Tags yang Baik:
              </div>
              <div style={{ marginBottom: 8 }}>
                • "reset password", "myasn", "lupa email"
                <br />
                • "kenaikan pangkat", "syarat", "dokumen"
                <br />• "cpns 2024", "pendaftaran", "jadwal"
              </div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                💡 Tips:
              </div>
              <div>
                Tags membantu user menemukan FAQ dengan mudah. Gunakan kata
                kunci yang sering dicari.
              </div>
            </div>
          ),
          icon: <InfoCircleOutlined />,
        }}
      >
        <Select
          mode="tags"
          placeholder='Ketik tag (contoh: "myasn", "reset", "password"), tekan Enter'
          tokenSeparators={[","]}
        />
      </Form.Item>

      <Row gutter={12}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            name="effective_date"
            label={
              <Space size={4}>
                <span>Mulai Berlaku</span>
              </Space>
            }
            rules={[{ required: true, message: "Wajib diisi" }]}
            style={{ marginBottom: 12 }}
            tooltip={{
              title: (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    📅 Tanggal Mulai Berlaku
                  </div>
                  <div>
                    Tanggal sejak kapan informasi/peraturan ini mulai
                    diberlakukan. AI akan menggunakan info ini untuk filter
                    jawaban yang masih valid.
                  </div>
                </div>
              ),
              icon: <InfoCircleOutlined />,
            }}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD-MM-YYYY"
              placeholder="Pilih tanggal"
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Form.Item
            name="expired_date"
            label={
              <Space size={4}>
                <span>Berakhir</span>
                <Text type="secondary" style={{ fontSize: 11, fontWeight: 400 }}>
                  (Opsional)
                </Text>
              </Space>
            }
            style={{ marginBottom: 12 }}
            tooltip={{
              title: (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    📅 Tanggal Berakhir
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    Tanggal hingga kapan informasi ini berlaku. Kosongkan jika
                    tidak ada masa kadaluarsa.
                  </div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    💡 Contoh:
                  </div>
                  <div>
                    • FAQ tentang CPNS 2024: berakhir 31 Des 2024
                    <br />• FAQ umum (reset password): kosongkan
                  </div>
                </div>
              ),
              icon: <InfoCircleOutlined />,
            }}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD-MM-YYYY"
              placeholder="Kosongkan jika tidak ada"
            />
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
