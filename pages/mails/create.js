import { renderMarkdown, uploadFile } from "@/utils/client-utils";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { sendPrivateMessage } from "@/services/index";
import { Stack } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Card,
  Space,
  Col,
  Input,
  Row,
  Select,
  Spin,
  Typography,
  Button,
  message,
} from "antd";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { MarkdownEditor } from "@primer/react/drafts";
import { searchUser } from "@/services/index";

const CreatePrivateMessage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [content, setContent] = useState(); // [content, setContent
  const [title, setTitle] = useState(null);
  const [search, setSearch] = useState(null);
  const [debounceSearch] = useDebouncedValue(search, 500);

  // user
  const [user, setUser] = useState(undefined);
  const [debounceValue] = useDebouncedValue(user, 500);

  const { data: dataUser, isLoading: isLoadingUser } = useQuery(
    ["data-user", debounceValue],
    () => searchUser(debounceValue),
    {
      enabled: Boolean(debounceValue),
    }
  );

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
    if (!title || !content || !user) {
      message.error("Harap isi semua field");
    } else {
      const data = {
        title,
        message: content,
        receiverId: user,
      };
      send(data);
    }
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
                <Stack spacing="sm">
                  <Typography.Text>Kepada :</Typography.Text>
                  <Select
                    style={{
                      width: "100%",
                    }}
                    showSearch
                    filterOption={false}
                    placeholder="Ketik nama atau NIP"
                    loading={isLoadingUser}
                    notFoundContent={
                      isLoadingUser && debounceValue ? (
                        <Spin size="small" />
                      ) : null
                    }
                    onSearch={(value) => setUser(value)}
                    value={user}
                    onChange={(value) => setUser(value)}
                  >
                    {dataUser?.map((item) => (
                      <Select.Option
                        key={item?.custom_id}
                        value={item?.custom_id}
                      >
                        <Space>
                          <Avatar size="small" src={item?.image} />
                          <Typography.Text>{item?.username}</Typography.Text>
                        </Space>
                      </Select.Option>
                    ))}
                  </Select>
                </Stack>
                <Stack spacing="xs">
                  <Typography.Text>Judul :</Typography.Text>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e?.target?.value)}
                    placeholder="Judul"
                  />
                </Stack>

                <Stack spacing="xs">
                  <Typography.Text>Isi Pesan :</Typography.Text>
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
              </Stack>
              <Button
                style={{
                  marginTop: 16,
                }}
                type="primary"
                onClick={handleFinish}
                disabled={isLoading}
                loading={isLoading}
              >
                Kirim
              </Button>
            </Card>
          </Col>
        </Row>
      </PageContainer>
    </>
  );
};

CreatePrivateMessage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

CreatePrivateMessage.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default CreatePrivateMessage;
