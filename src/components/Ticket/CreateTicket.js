import { recommendationFaq } from "@/services/index";
import { createTickets } from "@/services/users.services";
import { renderMarkdown, uploadFile } from "@/utils/client-utils";
import {
  BookOutlined,
  EditOutlined,
  QuestionCircleFilled,
} from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { MarkdownEditor } from "@primer/react/drafts";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Flex,
  Form,
  Grid,
  Input,
  List,
  Modal,
  Row,
  Space,
  Typography,
  message,
} from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import PopularSubcategories from "./PopularSubcategories";

const { Title, Text: AntText } = Typography;
const { useBreakpoint } = Grid;

const Faqs = ({ data, isMobile }) => {
  return (
    <Card
      style={{
        width: "100%",
        borderRadius: isMobile ? "8px" : "12px",
        border: "1px solid #EDEFF1",
      }}
      bodyStyle={{ padding: 0 }}
    >
      <Flex>
        {/* Icon Section - Hide on mobile */}
        {!isMobile && (
          <div
            style={{
              width: "40px",
              backgroundColor: "#F8F9FA",
              borderRight: "1px solid #EDEFF1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "350px",
            }}
          >
            <BookOutlined style={{ color: "#FF4500", fontSize: "18px" }} />
          </div>
        )}

        {/* Content Section */}
        <div style={{ flex: 1 }}>
          <div
            id="scrollableDiv"
            style={{
              height: 350,
              overflow: "auto",
              padding: isMobile ? "12px" : "16px",
            }}
          >
            <List
              header={
                <Title
                  level={5}
                  style={{
                    margin: 0,
                    marginBottom: "12px",
                    color: "#1A1A1B",
                    fontSize: isMobile ? "14px" : "16px",
                  }}
                >
                  📋 Pertanyaan yang sering diajukan
                </Title>
              }
              dataSource={data}
              rowKey={(row) => row?.faq_id}
              renderItem={(item) => {
                return (
                  <List.Item
                    style={{
                      padding: isMobile ? "8px 0" : "12px 0",
                      borderBottom: "1px solid #F0F0F0",
                    }}
                  >
                    <Stack>
                      <AntText
                        strong
                        style={{
                          fontSize: isMobile ? "12px" : "14px",
                          color: "#1A1A1B",
                          marginBottom: "6px",
                        }}
                      >
                        {item?.question}
                      </AntText>
                      <div
                        style={{
                          fontSize: isMobile ? "11px" : "13px",
                          color: "#787C7E",
                          lineHeight: "1.4",
                        }}
                        dangerouslySetInnerHTML={{
                          __html: item?.html,
                        }}
                      />
                    </Stack>
                  </List.Item>
                );
              }}
            />
          </div>
        </div>
      </Flex>
    </Card>
  );
};

const Bantuan = ({ open, onCancel, isMobile }) => {
  const html = `
<p>Contoh Permasalahan:</p>
<ul>
<li><p><strong>Judul:</strong></p>
<ul>
<li>&quot;Kesulitan Mengakses Portal Absensi Karyawan&quot;</li>
</ul>
</li>
<li><p><strong>Deskripsi:</strong></p>
<ul>
<li>Saya, sebagai karyawan bagian pemasaran, mengalami kesulitan saat mencoba mengakses portal absensi karyawan. Setiap kali mencoba untuk login, sistem selalu mengeluarkan pesan error &quot;Username atau Password Salah&quot;, meskipun saya sudah memasukkan informasi akun dengan benar.</li>
<li>Saya sudah mencoba untuk mereset password dan membersihkan cache browser, namun masalah ini tetap terjadi. </li>
<li>Mohon bantuan untuk mengatasi permasalahan ini agar saya dapat melaporkan kehadiran dengan tepat waktu.</li>
</ul>
</li>
</ul>
<p>Di contoh di atas, judul dan deskripsi dibuat dengan jelas dan informatif sehingga tim helpdesk dapat dengan cepat memahami dan menangani permasalahan yang dialami oleh karyawan.</p>`;

  return (
    <Modal
      footer={null}
      title="Bantuan"
      open={open}
      centered
      onCancel={onCancel}
      width={isMobile ? "95%" : "80vh"}
    >
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </Modal>
  );
};

const CreateTicket = ({ siteKey }) => {
  const router = useRouter();
  const { data, status } = useSession();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [title, setTitle] = useState(null);
  const [content, setContent] = useState();
  const [isAgree, setIsAgree] = useState(false);
  const [subCategoryId, setSubCategoryId] = useState(null);

  // Responsive breakpoints
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = screens.lg;

  const handleChangeSubCategoryId = (value) => {
    setSubCategoryId(value);
  };

  const [modal] = Modal.useModal();

  const [debounceValue] = useDebouncedValue(title, 500);

  useEffect(() => {
    // clear instance
  }, [data, status, modal]);

  const { data: recommendationsFaqs, isLoading: loadingRecommendationFaq } =
    useQuery(
      ["recommendations", debounceValue],
      () => recommendationFaq(debounceValue),
      {
        enabled: !!debounceValue,
      }
    );

  const { mutate: create, isLoading } = useMutation(
    (data) => createTickets(data),
    {
      retry: false,
      onSuccess: () => {
        message.success("Berhasil membuat tiket");
        router.push("/tickets/semua");
      },
      onError: (error) => {
        const msg = error?.response?.data?.message || "Gagal membuat tiket";
        message.error(msg);
      },
    }
  );

  const handleFinish = async () => {
    if (!title || !content || !isAgree || !subCategoryId) {
      message.error(
        "Judul, deskripsi, kategori dan persetujuan aturan pengajuan pertanyaan harus diisi"
      );
      return;
    }

    if (!executeRecaptcha) {
      message.error("ReCaptcha belum siap, silakan coba lagi");
      return;
    }

    try {
      // Execute reCAPTCHA
      const captchaToken = await executeRecaptcha("create_ticket");

      if (!captchaToken) {
        message.error("Gagal memverifikasi reCAPTCHA, silakan coba lagi");
        return;
      }

      if (!isLoading) {
        const data = {
          title,
          content,
          is_agree: isAgree,
          sub_category_id: subCategoryId || null,
          captcha: captchaToken,
        };
        // console.log(data);
        create(data);
      }
    } catch (error) {
      message.error("Gagal memverifikasi reCAPTCHA, silakan coba lagi");
    }
  };

  const showModalAgreement = () => {
    Modal.info({
      title: "Aturan Pengajuan Pertanyaan",
      width: isMobile ? "95%" : 800,
      content: (
        <div>
          <p>Dengan mengajukan pertanyaan, Anda menyetujui:</p>
          <ol>
            <li>Pertanyaan Anda mungkin akan dijawab secara publik.</li>
            <li>Anda tidak akan membagikan informasi pribadi atau sensitif.</li>
            <li>Anda akan menggunakan bahasa yang sopan dan pantas.</li>
            <li>
              Anda tidak akan menggunakan layanan ini untuk tujuan ilegal atau
              merugikan pihak lain.
            </li>
            <li>
              Kami berhak untuk mengedit atau menghapus pertanyaan yang
              melanggar aturan.
            </li>
          </ol>
          <p>
            Untuk informasi lebih lanjut, silakan baca Perjanjian Penggunaan
            Lengkap.
          </p>
        </div>
      ),
    });
  };

  return (
    <div>
      <Bantuan open={open} onCancel={handleClose} isMobile={isMobile} />
      <Row gutter={[isMobile ? 12 : 16, isMobile ? 12 : 16]}>
        <Col md={16} xs={24}>
          <Card
            style={{
              width: "100%",
              borderRadius: isMobile ? "8px" : "12px",
              border: "1px solid #EDEFF1",
              marginBottom: isMobile ? "12px" : "16px",
            }}
            bodyStyle={{ padding: 0 }}
          >
            <Flex>
              {/* Icon Section - Hide on mobile */}
              {!isMobile && (
                <div
                  style={{
                    width: "40px",
                    backgroundColor: "#F8F9FA",
                    borderRight: "1px solid #EDEFF1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "600px",
                  }}
                >
                  <EditOutlined
                    style={{ color: "#FF4500", fontSize: "18px" }}
                  />
                </div>
              )}

              {/* Content Section */}
              <div style={{ flex: 1, padding: isMobile ? "12px" : "16px" }}>
                <Flex
                  justify="space-between"
                  align={isMobile ? "flex-start" : "center"}
                  vertical={isMobile}
                  style={{ marginBottom: isMobile ? "16px" : "20px" }}
                >
                  <div style={{ marginBottom: isMobile ? "12px" : 0 }}>
                    <Title
                      level={isMobile ? 5 : 4}
                      style={{
                        margin: 0,
                        color: "#1A1A1B",
                        lineHeight: isMobile ? "1.3" : "1.4",
                      }}
                    >
                      📝 Form Pertanyaan
                    </Title>
                    <AntText
                      style={{
                        color: "#787C7E",
                        fontSize: isMobile ? "12px" : "14px",
                        lineHeight: isMobile ? "1.3" : "1.4",
                      }}
                    >
                      Ajukan pertanyaan dan dapatkan bantuan dari tim helpdesk
                    </AntText>
                  </div>
                  <Button
                    onClick={handleOpen}
                    icon={<QuestionCircleFilled />}
                    type="default"
                    size={isMobile ? "small" : "middle"}
                    style={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #FF4500",
                      color: "#FF4500",
                      borderRadius: "6px",
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#FF4500";
                      e.currentTarget.style.color = "#FFFFFF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#FFFFFF";
                      e.currentTarget.style.color = "#FF4500";
                    }}
                  >
                    Bantuan
                  </Button>
                </Flex>

                <Form layout="vertical">
                  <Form.Item
                    label={
                      <AntText
                        strong
                        style={{ fontSize: isMobile ? "13px" : "14px" }}
                      >
                        Judul
                      </AntText>
                    }
                  >
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e?.target?.value)}
                      placeholder="Masukkan judul pertanyaan yang jelas dan spesifik"
                      style={{
                        borderRadius: "6px",
                        fontSize: isMobile ? "13px" : "14px",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#FF4500";
                        e.target.style.boxShadow =
                          "0 0 0 2px rgba(255, 69, 0, 0.2)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#d9d9d9";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </Form.Item>

                  <PopularSubcategories
                    value={subCategoryId}
                    onChange={handleChangeSubCategoryId}
                  />

                  <Form.Item
                    label={
                      <AntText
                        strong
                        style={{ fontSize: isMobile ? "13px" : "14px" }}
                      >
                        Deskripsi
                      </AntText>
                    }
                  >
                    <div
                      style={{
                        border: "1px solid #d9d9d9",
                        borderRadius: "6px",
                        overflow: "hidden",
                      }}
                    >
                      <MarkdownEditor
                        value={content}
                        fullHeight
                        acceptedFileTypes={[
                          "image/*",
                          // word, excel, txt, pdf
                          ".doc",
                          ".docx",
                          ".xls",
                          ".xlsx",
                          ".txt",
                          ".pdf",
                        ]}
                        onChange={setContent}
                        placeholder="Untuk memudahkan kami dalam memahami pertanyaan anda, mohon jelaskan secara detail, serta lampirkan file pendukung jika diperlukan."
                        onRenderPreview={renderMarkdown}
                        onUploadFile={uploadFile}
                        mentionSuggestions={null}
                      />
                    </div>
                  </Form.Item>

                  <Form.Item
                    valuePropName="checked"
                    rules={[
                      {
                        validator: (_, value) =>
                          value
                            ? Promise.resolve()
                            : Promise.reject(
                                new Error(
                                  "Anda harus menyetujui aturan pengajuan pertanyaan"
                                )
                              ),
                      },
                    ]}
                  >
                    <Checkbox
                      value={isAgree}
                      onChange={(e) => setIsAgree(e?.target?.checked)}
                      style={{ fontSize: isMobile ? "12px" : "14px" }}
                    >
                      Saya menyetujui{" "}
                      <a
                        onClick={showModalAgreement}
                        style={{
                          color: "#FF4500",
                          textDecoration: "underline",
                        }}
                      >
                        aturan pengajuan pertanyaan
                      </a>
                    </Checkbox>
                  </Form.Item>

                  <Space align="center">
                    <Button
                      style={{
                        marginTop: 10,
                        backgroundColor: "#FF4500",
                        borderColor: "#FF4500",
                        borderRadius: "6px",
                        fontWeight: 500,
                        minWidth: isMobile ? "120px" : "140px",
                      }}
                      disabled={isLoading}
                      loading={isLoading}
                      onClick={handleFinish}
                      type="primary"
                      size={isMobile ? "middle" : "large"}
                    >
                      {isLoading ? "Mengirim..." : "Submit Pertanyaan"}
                    </Button>
                  </Space>
                </Form>
              </div>
            </Flex>
          </Card>
        </Col>

        <Col md={8} xs={24}>
          {recommendationsFaqs?.length > 0 && (
            <Faqs data={recommendationsFaqs} isMobile={isMobile} />
          )}
        </Col>
      </Row>

      <style jsx global>{`
        .ant-card {
          transition: all 0.3s ease !important;
          overflow: hidden !important;
          border-radius: 8px !important;
        }

        .ant-card:hover {
          border-color: #ff4500 !important;
          box-shadow: 0 2px 8px rgba(255, 69, 0, 0.15) !important;
        }

        .ant-card .ant-card-body {
          padding: 0 !important;
          border-radius: inherit !important;
        }

        /* Fix untuk icon section agar border radius konsisten */
        .ant-card .ant-card-body > div:first-child {
          border-top-left-radius: inherit !important;
          border-bottom-left-radius: inherit !important;
        }

        /* Fix untuk content section agar border radius konsisten */
        .ant-card .ant-card-body > div:first-child > div:last-child {
          border-top-right-radius: inherit !important;
          border-bottom-right-radius: inherit !important;
        }

        .ant-input:focus,
        .ant-input-focused {
          border-color: #ff4500 !important;
          box-shadow: 0 0 0 2px rgba(255, 69, 0, 0.2) !important;
        }

        .ant-checkbox-wrapper:hover .ant-checkbox-inner,
        .ant-checkbox:hover .ant-checkbox-inner,
        .ant-checkbox-input:focus + .ant-checkbox-inner {
          border-color: #ff4500 !important;
        }

        .ant-checkbox-checked .ant-checkbox-inner {
          background-color: #ff4500 !important;
          border-color: #ff4500 !important;
        }

        .ant-btn-primary {
          background: linear-gradient(
            135deg,
            #ff4500 0%,
            #ff6b35 100%
          ) !important;
          border-color: #ff4500 !important;
          box-shadow: 0 2px 4px rgba(255, 69, 0, 0.3) !important;
        }

        .ant-btn-primary:hover {
          background: linear-gradient(
            135deg,
            #e53e00 0%,
            #ff4500 100%
          ) !important;
          border-color: #e53e00 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 8px rgba(255, 69, 0, 0.4) !important;
          transition: all 0.2s ease !important;
        }

        .ant-form-item-label > label {
          font-weight: 500 !important;
          color: #1a1a1b !important;
        }

        @media (max-width: 768px) {
          .ant-col {
            margin-bottom: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CreateTicket;
