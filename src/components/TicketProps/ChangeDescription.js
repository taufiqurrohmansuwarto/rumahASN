import { editTicket } from "@/services/index";
import { formatDateFromNow } from "@/utils/client-utils";
import { formatDate } from "@/utils/index";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Comment, Tooltip, message, Avatar } from "antd";
import { useState } from "react";
import RestrictedContent from "../RestrictedContent";
import NewTicket from "../Ticket/NewTicket";

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
              <span onClick={selectEdit}>Edit</span>
            </RestrictedContent>,
          ]}
          author={item?.customer?.username}
          avatar={<Avatar src={item?.customer?.image} />}
          datetime={
            <Tooltip title={formatDate(item?.created_at)}>
              <span>{formatDateFromNow(item?.created_at)}</span>
            </Tooltip>
          }
          content={
            <div dangerouslySetInnerHTML={{ __html: item?.content_html }} />
          }
        />
      )}
    </>
  );
}

export default ChangeTicketDescription;
