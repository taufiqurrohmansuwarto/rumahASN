import { parseMarkdown, uploadFiles } from "@/services/index";
import { createPost } from "@/services/socmed.services";
import { Comment } from "@ant-design/compatible";
import { Stack, Text } from "@mantine/core";
import { MarkdownEditor } from "@primer/react/drafts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, Input, Modal, message } from "antd";
import { useSession } from "next-auth/react";
import { useRef, useState } from "react";

const uploadFile = async (file) => {
  try {
    const formData = new FormData();

    // if file not image png, jpg, jpeg, gif
    const allowedTypes = ["image/png", "image/jpg", "image/jpeg", "image/gif"];

    if (!allowedTypes.includes(file.type)) {
      return;
    } else {
      formData.append("file", file);
      const result = await uploadFiles(formData);
      return {
        url: result?.data,
        file,
      };
    }
  } catch (error) {
    console.log(error);
  }
};

const renderMarkdown = async (markdown) => {
  if (!markdown) return;
  const result = await parseMarkdown(markdown);
  return result?.html;
};

const ModalCreate = ({
  open,
  onCancel,
  value,
  setValue,
  submitMessage,
  isLoading,
}) => {
  return (
    <Modal
      centered
      width={800}
      footer={null}
      title="Buat Postingan"
      open={open}
      onCancel={onCancel}
    >
      <Stack>
        <Text>
          Apabila ingin bertanya tentang kepegawaian gunakan fitur tanya BKD
          ya..
        </Text>
        <MarkdownEditor
          acceptedFileTypes={[
            "image/png",
            "image/jpg",
            "image/jpeg",
            "image/gif",
          ]}
          value={value}
          onChange={setValue}
          onRenderPreview={renderMarkdown}
          onUploadFile={uploadFile}
          emojiSuggestions={null}
          referenceSuggestions={null}
          mentionSuggestions={null}
          savedReplies={null}
        >
          <MarkdownEditor.Actions>
            <MarkdownEditor.ActionButton
              disabled={!value || isLoading}
              variant="primary"
              size="medium"
              onClick={submitMessage}
            >
              {isLoading ? "Loading..." : "Submit"}
            </MarkdownEditor.ActionButton>
          </MarkdownEditor.Actions>
        </MarkdownEditor>
      </Stack>
    </Modal>
  );
};

function SocmedCreatePost() {
  const { data, status } = useSession();
  const queryClient = useQueryClient();
  const [showModalCreate, setShowModalCreate] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null); // Added useRef for input

  const handleOpenModal = () => {
    if (inputValue === "") {
      setShowModalCreate(true);
      setInputValue("");
      if (inputRef.current) {
        inputRef.current.blur(); // Blur the input when modal is opened
      }
    }
  };

  const handleCloseModal = () => {
    setShowModalCreate(false);
  };

  const [value, setValue] = useState();
  const { mutate: create, isLoading } = useMutation(
    (data) => createPost(data),
    {
      onSuccess: () => {
        setValue("");
        handleCloseModal();
        message.success("Berhasil membuat postingan");
      },
      onError: (error) => {
        alert(error.message);
      },
      onSettled: () => {
        queryClient.invalidateQueries("socmed-posts");
      },
    }
  );

  const submitMessage = () => {
    if (!value) {
      return;
    } else {
      create({ content: value });
    }
  };

  return (
    <>
      <ModalCreate
        value={value}
        setValue={setValue}
        open={showModalCreate}
        onCancel={handleCloseModal}
        submitMessage={submitMessage}
        isLoading={isLoading}
      />
      <Comment
        avatar={<Avatar src={data?.user?.image} alt={data?.user?.name} />}
        content={
          <Input.TextArea
            ref={inputRef} // Set the ref to the input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={handleOpenModal}
            placeholder="Berbagi apa yang anda pikirkan"
            autoSize={{ minRows: 1, maxRows: 4 }}
          />
        }
      />
    </>
  );
}

export default SocmedCreatePost;
