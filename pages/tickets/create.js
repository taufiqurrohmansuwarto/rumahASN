import Layout from "@/components/Layout";
import EletterBKD from "@/components/Utils/EletterBKD";
import { recommendationFaq } from "@/services/index";
import { renderMarkdown, uploadFile } from "@/utils/client-utils";
import { QuestionCircleFilled } from "@ant-design/icons";
import { Stack, Text, TypographyStylesProvider } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { MarkdownEditor } from "@primer/react/drafts";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Col,
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
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { createTickets } from "../../services/users.services";
import PageContainer from "../../src/components/PageContainer";
import PopularSubcategories from "@/components/Ticket/PopularSubcategories";
import AlertCASN2024Jatim from "@/components/Ticket/AlertCASN2024Jatim";

// peremajaan data
const TextPeremajaanData = () => {
  return (
    <>
      <Typography.Text>
        Sebelum membuat pertanyaan tentang peremajaan Data SIASN, pastikan anda
        membaca terlebih dahulu membaca tutorial yang telah kami buat{" "}
        <Link href={"/layanan/pemutakhiran-data-siasn"}>
          Tutorial Layanan Peremajaan Data SIASN
        </Link>{" "}
      </Typography.Text>
    </>
  );
};

const Faqs = ({ data }) => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Buat Tiket Baru</title>
      </Head>
      <div
        id="scrollableDiv"
        style={{
          height: 350,
          overflow: "auto",
          padding: "0 16px",
          border: "1px solid rgba(140, 140, 140, 0.35)",
        }}
      >
        <List
          header={<Text variant="h4">Pertanyaan yang sering diajukan</Text>}
          dataSource={data}
          rowKey={(row) => row?.faq_id}
          renderItem={(item) => {
            return (
              <List.Item>
                <Stack>
                  <Typography.Text>{item?.question}</Typography.Text>
                  <Typography.Text>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: item?.html,
                      }}
                    />
                  </Typography.Text>
                </Stack>
              </List.Item>
            );
          }}
        />
      </div>
    </>
  );
};

const Bantuan = ({ open, onCancel }) => {
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
      width="80vh"
    >
      <TypographyStylesProvider>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </TypographyStylesProvider>
    </Modal>
  );
};

const CreateTicket = () => {
  const router = useRouter();
  const { data, status } = useSession();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const breakPoint = Grid.useBreakpoint();

  const [title, setTitle] = useState(null);
  const [content, setContent] = useState();
  const [isAgree, setIsAgree] = useState(false);
  const [subCategoryId, setSubCategoryId] = useState(null);

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
      onError: () => {
        message.error("Gagal membuat tiket");
      },
    }
  );

  const handleFinish = async () => {
    if (!title || !content || !isAgree || !subCategoryId) {
      message.error(
        "Judul, deskripsi, kategori dan persetujuan aturan pengajuan pertanyaan harus diisi"
      );
      return;
    } else {
      if (!isLoading) {
        const data = {
          title,
          content,
          is_agree: isAgree,
          sub_category_id: subCategoryId || null,
        };
        create(data);
      }
    }
  };

  const showModalAgreement = () => {
    Modal.info({
      title: "Aturan Pengajuan Pertanyaan",
      width: 800,
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
    <>
      <Head>
        <title>Rumah ASN - Buat Pertanyaan Baru</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        title="Tanya BKD"
        content="Buat Pertanyaan Baru"
        onBack={() => router.back()}
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">Beranda</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/tickets/semua">Daftar Pertanyaan</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Pertanyaan Baru</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        {/* <EletterBKD /> */}
        <Row gutter={[8, 16]}>
          <Col md={16} xs={24}>
            {/* <AlertCASN2024Jatim /> */}
            <Bantuan open={open} onCancel={handleClose} />
            <Card
              title="Form Pertanyaan"
              extra={
                <Button
                  onClick={handleOpen}
                  icon={<QuestionCircleFilled />}
                  type="link"
                >
                  Bantuan
                </Button>
              }
            >
              <Form layout="vertical">
                <Form.Item label="Judul">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e?.target?.value)}
                  />
                </Form.Item>
                <PopularSubcategories
                  value={subCategoryId}
                  onChange={handleChangeSubCategoryId}
                />
                <Form.Item label="Deskripsi">
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
                  >
                    Saya menyetujui{" "}
                    <a onClick={showModalAgreement}>
                      aturan pengajuan pertanyaan
                    </a>
                  </Checkbox>
                </Form.Item>
                <Space align="center">
                  <Button
                    style={{
                      marginTop: 10,
                    }}
                    disabled={isLoading}
                    loading={isLoading}
                    onClick={handleFinish}
                    type="primary"
                  >
                    Submit
                  </Button>
                </Space>
              </Form>
            </Card>
          </Col>
          <Col md={8} xs={24}>
            {recommendationsFaqs?.length > 0 && (
              <Faqs data={recommendationsFaqs} />
            )}
          </Col>
        </Row>
      </PageContainer>
    </>
  );
};

CreateTicket.Auth = {
  action: "create",
  subject: "Tickets",
};

CreateTicket.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default CreateTicket;
