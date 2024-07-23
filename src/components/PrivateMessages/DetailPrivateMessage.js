import { sendPrivateMessage } from "@/services/index";
import { renderMarkdown, uploadFile } from "@/utils/client-utils";
import { Stack, Text, Title } from "@mantine/core";
import { MarkdownEditor } from "@primer/react/drafts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input, Modal, message as messageantd } from "antd";
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
      <PageContainer onBack={() => router.back()} title="Detail Pesan">
        <Stack>
          <Title order={3}>{data?.title}</Title>
          <Text>{data?.message}</Text>
        </Stack>
      </PageContainer>
    </>
  );
}

export default DetailPrivateMessage;
