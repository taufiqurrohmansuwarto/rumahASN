import { sendPrivateMessage } from "@/services/index";
import {
  formatDateFromNow,
  renderMarkdown,
  timeFormat,
  uploadFile,
} from "@/utils/client-utils";
import { Avatar, Group, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { MarkdownEditor } from "@primer/react/drafts";
import { IconPhone } from "@tabler/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input, Modal, Space, message as messageantd } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";
import PageContainer from "../PageContainer";

const SendModal = ({ visible, onCancel, receiver }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState();
  const [message, setMessage] = useState();

  const { mutate: sendMessgae, isLoading } = useMutation(
    (data) => sendPrivateMessage(data),
    {
      onSuccess: () => {
        onCancel();
        queryClient.invalidateQueries(["private-messages"]);
        messageantd.success("Pesan berhasil dikirim");
        router.push("/mails/sent");
      },
    }
  );

  const handleSendMessage = () => {
    if (!title || !message) return message.error("Judul dan pesan harus diisi");
    else {
      const receiverId = receiver?.custom_id;
      const data = {
        title,
        message,
        receiverId,
      };
      sendMessgae(data);
    }
  };

  return (
    <Modal
      centered
      onOk={handleSendMessage}
      width={800}
      title={`Balas Pesan ke ${receiver?.username}`}
      open={visible}
      onCancel={onCancel}
      confirmLoading={isLoading}
    >
      <Stack>
        <Input
          value={title}
          placeholder="Judul"
          onChange={(e) => setTitle(e?.target?.value)}
        />
        <MarkdownEditor
          value={message}
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
          onChange={setMessage}
          placeholder="Pesan"
          onRenderPreview={renderMarkdown}
          onUploadFile={uploadFile}
          mentionSuggestions={null}
        />
      </Stack>
    </Modal>
  );
};

function DetailPrivateMessage({ data }) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const handleCancel = () => setVisible(false);
  const handleOpen = () => setVisible(true);

  return (
    <>
      <PageContainer
        onBack={() => router?.back()}
        subTitle="Detail Pesan Pribadi"
      >
        <SendModal
          receiver={data?.sender}
          onCancel={handleCancel}
          visible={visible}
        />
        <Title mb="lg" order={2}>{`"${data?.title}"`}</Title>
        <Group position="apart">
          <Group spacing="sm">
            <Avatar size="lg" radius={100} src={data?.sender?.image} />
            <Stack spacing="xs">
              <Text>{data?.sender?.username}</Text>
              <Text>Kepada saya :</Text>
            </Stack>
          </Group>
          <Space align="center" size="large">
            <Text fz={12}>
              {timeFormat(data?.created_at)} -{" "}
              {formatDateFromNow(data?.created_at)}
            </Text>
            <ThemeIcon
              onClick={handleOpen}
              size="xl"
              style={{
                cursor: "pointer",
              }}
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan" }}
            >
              <IconPhone size="1.2rem" />
            </ThemeIcon>
          </Space>
        </Group>
        <div
          style={{
            marginBottom: "1rem",
            marginTop: "1rem",
            borderRadius: "5px",
            backgroundColor: "#eee",
            width: "100%",
            minHeight: "200px",
            padding: "1rem",
          }}
        >
          <div
            dangerouslySetInnerHTML={{
              __html: data?.message,
            }}
          />
        </div>
      </PageContainer>
    </>
  );
}

export default DetailPrivateMessage;
