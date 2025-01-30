import { uploadFile } from "@/utils/client-utils";
import { CloudUploadOutlined, LinkOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { Badge, Button } from "antd";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Attachments from "../Attachments";
import Sender from "../Sender";
import SenderHeader from "../SenderHeader";

function AntdChatSenderNew({
  style,
  status,
  submitMessage,
  stop,
  setInput,
  input,
  append,
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");

  //attachment
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const senderRef = useRef(null);

  const handleBeforeUpload = async (file) => {
    try {
      return false;
    } catch (error) {
      console.error("Upload error:", error);
      return false;
    }
  };

  const handleOnChange = async ({ fileList, file }) => {
    if (fileList.length >= 1) {
      const result = await uploadFile(file);

      const payload = {
        url: result.url,
        name: file.name,
        status: "done",
        uid: file.uid,
      };

      setItems([payload]);
    } else {
      setItems(fileList);
    }
  };

  const senderHeader = (
    <SenderHeader
      title="Lampiran"
      open={open}
      onOpenChange={setOpen}
      styles={{
        content: {
          padding: 0,
        },
      }}
    >
      <Attachments
        beforeUpload={handleBeforeUpload}
        items={items}
        multiple={false}
        maxCount={1}
        accept="image/*"
        onChange={handleOnChange}
        placeholder={(type) =>
          type === "drop"
            ? {
                title: "Letakkan file disini",
              }
            : {
                icon: <CloudUploadOutlined />,
                title: "Unggah file",
                description: "Hanya mendukung file gambar",
              }
        }
        getDropContainer={() => senderRef.current?.nativeElement}
      />
    </SenderHeader>
  );
  useEffect(() => {
    if (status === "awaiting_message") {
      queryClient.invalidateQueries({
        queryKey: ["chat-messages", router?.query?.threadId],
      });
    }
  }, [status, router?.query?.threadId, queryClient]);

  const handleChangeText = (e) => {
    setText(e);
  };

  const handleSubmit = async () => {
    const payload = {
      role: "user",
      content: text,
    };

    if (items.length > 0) {
      const imageUrl = {
        data: {
          imageUrl: items[0].url,
        },
      };

      append(payload, imageUrl);
      // reset attachment
      setItems([]);
      setOpen(false);

      await submitMessage();

      setText("");
    } else {
      append(payload);
      await submitMessage();
      setText("");
    }
  };

  return (
    <Sender
      ref={senderRef}
      header={senderHeader}
      prefix={
        <Badge dot={items.length > 0 && !open}>
          <Button onClick={() => setOpen(!open)} icon={<LinkOutlined />} />
        </Badge>
      }
      loading={status !== "awaiting_message"}
      placeholder="Tanya BestieAI"
      onSubmit={handleSubmit}
      value={text}
      onChange={handleChangeText}
      onCancel={stop}
    />
  );
}

export default AntdChatSenderNew;
