import Layout from "@/components/Layout";
import { renderMarkdown, uploadFile } from "@/utils/client-utils";
import { Alert, Grid, ScrollArea, Stack, Text } from "@mantine/core";
import { MarkdownEditor } from "@primer/react/drafts";
import { IconAlertCircle } from "@tabler/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Breadcrumb, Button, Input, List, Typography, message } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { createTickets } from "../../services/users.services";
import PageContainer from "../../src/components/PageContainer";
import { recommendationFaq } from "@/services/index";
import { useDebouncedValue } from "@mantine/hooks";
import Head from "next/head";

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

const CreateTicket = () => {
  const router = useRouter();
  const [title, setTitle] = useState(null);
  const [content, setContent] = useState();

  const [debounceValue] = useDebouncedValue(title, 500);

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
    if (!title || !content) {
      message.error("Mohon isi judul dan deskripsi tiket");
      return;
    } else {
      if (!isLoading) {
        const data = {
          title,
          content,
        };
        create(data);
      }
    }
  };

  return (
    <PageContainer
      title="Rumah ASN"
      subTitle="Pertanyaan Baru"
      breadcrumbRender={() => (
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href="/feeds">
              <a>Beranda</a>
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href="/tickets/semua">
              <a>Tiket</a>
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Tiket Baru</Breadcrumb.Item>
        </Breadcrumb>
      )}
    >
      <Grid>
        <Grid.Col md={8} xs={12}>
          <Alert
            icon={<IconAlertCircle />}
            color="yellow"
            title="Perhatian"
            mb={8}
          >
            <Text>
              Deskripsikan masalah Anda dengan jelas dan gunakan tata bahasa
              yang baik. Jangan lupa sertakan gambar atau link file sebagai
              bukti jika diperlukan. Terima kasih.
            </Text>
          </Alert>
          <Stack>
            <Input
              value={title}
              onChange={(e) => setTitle(e?.target?.value)}
              placeholder="Judul"
            />
            <MarkdownEditor
              value={content}
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
              placeholder="Deskripsi"
              onRenderPreview={renderMarkdown}
              onUploadFile={uploadFile}
              mentionSuggestions={null}
            />
          </Stack>
          <Button
            disabled={isLoading}
            loading={isLoading}
            style={{ marginTop: 14 }}
            onClick={handleFinish}
            type="primary"
          >
            Submit
          </Button>
        </Grid.Col>
        <Grid.Col md={4} xs={12}>
          {recommendationsFaqs?.length > 0 && (
            <Faqs data={recommendationsFaqs} />
          )}
        </Grid.Col>
      </Grid>
    </PageContainer>
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
