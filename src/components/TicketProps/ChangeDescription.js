import { editTicket } from "@/services/index";
import { formatDateFromNow } from "@/utils/client-utils";
import { formatDate } from "@/utils/index";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Tooltip, message, Avatar, Typography, Space } from "antd";
import { Comment } from "@ant-design/compatible";
import { useState } from "react";
import RestrictedContent from "../RestrictedContent";
import NewTicket from "../Ticket/NewTicket";
import Link from "next/link";
import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";
import TicketSummarize from "../Ticket/TicketSummarize";
import { Stack } from "@mantine/core";
import AISummarize from "../Ticket/AISummarize";
import { EditOutlined } from "@ant-design/icons";

function ChangeTicketDescription({ item }) {
  const [isEdit, setIsEdit] = useState();
  const [value, setValue] = useState(item?.content);

  const queryClient = useQueryClient();

  const selectEdit = () => {
    setIsEdit(true);
    setValue(item?.content);
  };

  const closeEdit = () => setIsEdit(false);

  const { mutate: updateDescription, isLoading } = useMutation(
    (data) => editTicket(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["publish-ticket", item?.id]);
        message.success(`Berhasil merubah deskripsi tiket`);
        setIsEdit(false);
        setValue(item?.content);
      },
      onError: () => {
        message.error(`Gagal merubah deskripsi tiket`);
        setIsEdit(false);
      },
    }
  );

  const handleSubmit = () => {
    const data = {
      id: item?.id,
      data: {
        title: null,
        content: value,
      },
    };

    if (!value) {
      return;
    } else {
      updateDescription(data);
    }
  };

  return (
    <>
      {isEdit ? (
        <NewTicket
          value={value}
          setValue={setValue}
          handleCancel={closeEdit}
          loadingSubmit={isLoading}
          withCancel
          submitMessage={handleSubmit}
        />
      ) : (
        <Comment
          style={{
            border: "1px solid #d9d9d9",
            padding: 10,
            borderRadius: 10,
          }}
          actions={[
            <RestrictedContent
              name="edit-ticket-description"
              key="edit-ticket-description"
              attributes={{ ticket: item }}
            >
              <span onClick={selectEdit}>
                <Space>
                  <EditOutlined />
                  Edit
                </Space>
              </span>
            </RestrictedContent>,
          ]}
          author={
            <Link href={`/users/${item?.customer?.custom_id}`}>
              <Typography.Link>{item?.customer?.username}</Typography.Link>
            </Link>
          }
          avatar={
            <Link href={`/users/${item?.customer?.custom_id}`}>
              <Avatar src={item?.customer?.image} />
            </Link>
          }
          datetime={
            <Tooltip title={formatDate(item?.created_at)}>
              <span>{formatDateFromNow(item?.created_at)}</span>
            </Tooltip>
          }
          content={
            <Stack>
              <ReactMarkdownCustom>{item?.content}</ReactMarkdownCustom>
              <TicketSummarize ticket={item} />
              <AISummarize item={item} />
            </Stack>
          }
        />
      )}
    </>
  );
}

export default ChangeTicketDescription;
