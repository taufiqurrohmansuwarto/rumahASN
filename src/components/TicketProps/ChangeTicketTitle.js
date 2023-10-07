import { useRBAC } from "@/context/RBACContext";
import { editTicket } from "@/services/index";
import {
  formatDateFromNow,
  setColorStatus,
  setStatusIcon,
} from "@/utils/client-utils";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, Space, Tag, Typography, message } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";

const StatusTiket = ({ ticket }) => {
  return (
    <Space size="small">
      <Tag
        icon={setStatusIcon(ticket?.status_code)}
        color={setColorStatus(ticket?.status_code)}
      >
        {ticket?.status_code}
      </Tag>
      <Typography.Text style={{ fontSize: 12 }} type="secondary">
        oleh{" "}
        <Link href={`/users/${ticket?.customer?.custom_id}`}>
          <Typography.Link>{ticket?.customer?.username}</Typography.Link>
        </Link>{" "}
        {formatDateFromNow(ticket?.created_at)} &#8226; {ticket?.data?.length}{" "}
        komentar
      </Typography.Text>
    </Space>
  );
};

const BackIcon = () => {
  const router = useRouter();

  return (
    <ArrowLeftOutlined
      onClick={() => router.back()}
      style={{
        cursor: "pointer",
        fontSize: 18,
        marginRight: 6,
      }}
    />
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
          <Space align="baseline">
            <BackIcon />
            <Typography.Title level={4}>{ticket?.title}</Typography.Title>
          </Space>
          <div>
            <StatusTiket ticket={ticket} />
          </div>
        </Card>
      </>
    );
  } else {
    return (
      <Card>
        <Space align="baseline">
          <BackIcon />
          <Typography.Title level={4} editable={{ onChange: handleEditTitle }}>
            {ticket?.title}
          </Typography.Title>
        </Space>
        <div>
          <StatusTiket ticket={ticket} />
        </div>
      </Card>
    );
  }
}

export default ChangeTicketTitle;
