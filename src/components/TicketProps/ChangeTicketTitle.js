import { useRBAC } from "@/context/RBACContext";
import { editTicket } from "@/services/index";
import { formatDateFromNow, setColorStatus } from "@/utils/client-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, message, Space, Tag, Typography } from "antd";
import React from "react";

const StatusTiket = ({ ticket }) => {
  return (
    <Space size="small">
      <Tag color={setColorStatus(ticket?.status_code)}>
        {ticket?.status_code}
      </Tag>
      <Typography.Text style={{ fontSize: 12 }} type="secondary">
        oleh {ticket?.customer?.username}{" "}
        {formatDateFromNow(ticket?.created_at)} &#8226; {ticket?.data?.length}{" "}
        komentar
      </Typography.Text>
    </Space>
  );
};

function ChangeTicketTitle({ name, attributes, ticket }) {
  const { canAccess } = useRBAC();

  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation((data) => editTicket(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["publish-ticket", ticket?.id]);
      message.success("Berhasil mengubah judul tiket");
    },
    onError: () => message.error("Gagal mengubah judul tiket"),
  });

  const handleEditTitle = (value) => {
    const data = {
      id: ticket?.id,
      data: {
        title: value,
        content: null,
      },
    };

    if (value) {
      mutate(data);
    }
  };

  if (!canAccess(name, attributes)) {
    return (
      <>
        <Card>
          <Typography.Title level={4}>{ticket?.title}</Typography.Title>
          <StatusTiket ticket={ticket} />
        </Card>
      </>
    );
  } else {
    return (
      <Card>
        <Typography.Title level={4} editable={{ onChange: handleEditTitle }}>
          {ticket?.title}
        </Typography.Title>
        <StatusTiket ticket={ticket} />
      </Card>
    );
  }
}

export default ChangeTicketTitle;
