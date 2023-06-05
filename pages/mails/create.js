import { renderMarkdown, uploadFile } from "@/utils/client-utils";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { sendPrivateMessage } from "@/services/index";
import { Stack } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, Col, Input, Row, Select } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { MarkdownEditor } from "@primer/react/drafts";

const CreatePrivateMessage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [content, setContent] = useState(); // [content, setContent
  const [title, setTitle] = useState(null);
  const [search, setSearch] = useState(null);
  const [debounceSearch] = useDebouncedValue(search, 500);

  const handleBack = () => router.back();

  const { mutate: send, isLoading } = useMutation(
    (data) => sendPrivateMessage(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["private-messages"]);
        router.push("/mails");
      },
    }
  );

  const handleFinish = async () => {
    const result = await form.validateFields();
    console.log(result);
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Buat Pesan Pribadi</title>
      </Head>
      <PageContainer
        onBack={handleBack}
        title="Pesan Pribadi"
        subTitle="Kirim Pesan"
      >
        <Row>
          <Col md={18} xs={24}>
            <Card>
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
                  placeholder="Isi Pesan"
                  onRenderPreview={renderMarkdown}
                  onUploadFile={uploadFile}
                  mentionSuggestions={null}
                />
              </Stack>
            </Card>
          </Col>
        </Row>
      </PageContainer>
    </>
  );
};

CreatePrivateMessage.getLayout = function getLayout(page) {
  return <Layout active="/mails">{page}</Layout>;
};

CreatePrivateMessage.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default CreatePrivateMessage;
