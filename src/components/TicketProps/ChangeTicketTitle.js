import { useRBAC } from "@/context/RBACContext";
import { editTicket } from "@/services/index";
import { formatDateFromNow } from "@/utils/client-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, message, Typography } from "antd";
import React from "react";

function ChangeTicketTitle({ name, attributes, ticket }) {
  const { canAccess } = useRBAC();

  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation((data) => editTicket(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["publish-ticket", ticket?.id]);
      message.success("Berhasil mengubah judul tiket");
    },
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
          <Typography.Text style={{ fontSize: 12 }} type="secondary">
            {ticket?.customer?.username} membuat tiket pada{" "}
            {formatDateFromNow(ticket?.created_at)}
          </Typography.Text>
        </Card>
      </>
    );
  } else {
    return (
      <Card>
        <Typography.Title level={4} editable={{ onChange: handleEditTitle }}>
          {ticket?.title}
        </Typography.Title>
        <Typography.Text style={{ fontSize: 12 }} type="secondary">
          {ticket?.customer?.username} membuat tiket pada{" "}
          {formatDateFromNow(ticket?.created_at)}
        </Typography.Text>
      </Card>
    );
  }
}

export default ChangeTicketTitle;
