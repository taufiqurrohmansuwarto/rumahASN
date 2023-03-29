import Layout from "@/components/Layout";
import { renderMarkdown, uploadFile } from "@/utils/client-utils";
import { Alert, Grid, Stack, Text } from "@mantine/core";
import { MarkdownEditor } from "@primer/react/drafts";
import { IconAlertCircle } from "@tabler/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, Input, message } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";
import { createTickets } from "../../services/users.services";
import PageContainer from "../../src/components/PageContainer";

const CreateTicket = () => {
  const router = useRouter();
  const [title, setTitle] = useState();
  const [content, setContent] = useState();

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

    console.log(title, content);
  };

  return (
    <PageContainer title="Helpdesk" subTitle="Buat Tiket Baru">
      <Grid>
        <Grid.Col span={8}>
          <Alert
            icon={<IconAlertCircle />}
            color="yellow"
            title="Perhatian"
            mb={8}
          >
            <Text>
              Jika Anda pegawai Pemerintah Provinsi Jawa Timur, gunakan akun
              SIMASTER dan PTTPK untuk mempermudah kami dalam menangani tiket
              Anda. Buatlah deskripsi dengan baik dan jelas serta gunakan tata
              bahasa yang baik, agar kami dapat membantu anda dengan cepat.
              Gunakan gambar atau link file sebagai bukti di bagian deskripsi
              jika ada. Terima Kasih.
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
