import {
  asnConnectClearNotifications,
  asnConnectGetNotifications,
} from "@/services/socmed.services";
import { serializeCommentText } from "@/utils/client-utils";
import {
  CheckOutlined,
  CheckSquareOutlined,
  CommentOutlined,
  LikeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  List,
  Space,
  Tooltip,
  Badge,
  Avatar,
  Typography,
  Tag,
  message,
  Row,
  Col,
} from "antd";
import React, { useState } from "react";
import AvatarUser from "../Users/AvatarUser";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { readNotifactionsAsnConnect } from "@/services/notifications.services";

dayjs.extend(relativeTime);

const { Text, Link } = Typography;

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getNotificationContent = (item, currentUserId) => {
  const username = item?.user?.username?.split(" ")[0]; // Ambil nama depan saja
  const userPost = item?.data?.user?.username?.split(" ")[0]; // Ambil nama depan saja

  let whoAmI = currentUserId === item?.target_user_id ? "Anda" : userPost;

  switch (item?.type) {
    case "like_asn_update":
      return `${username} menyukai postingan ${whoAmI}`;
    case "comment_asn_update":
      return `${username} mengomentari postingan ${whoAmI}`;
    case "comment_asn_discussion":
      return `${username} mengomentari diskusi dengan judul ${item?.data?.title}`;
    default:
      return `${username} berinteraksi dengan Anda`;
  }
};

const NotificationIcon = ({ type }) => {
  switch (type) {
    case "like_asn_update":
      return <LikeOutlined style={{ color: "#FA8C16" }} />;
    case "comment_asn_update":
      return <CommentOutlined style={{ color: "#FA8C16" }} />;
    default:
      return <UserOutlined style={{ color: "#FA8C16" }} />;
  }
};

function SocmedNotifications() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: userData } = useSession();
  const [query, setQuery] = useState({ page: 1 });

  const { data, isLoading } = useQuery(
    ["asn-connect-notifications", query],
    () => asnConnectGetNotifications(query),
    {
      keepPreviousData: true,
      enabled: !!query,
    }
  );

  const { mutate: clearChat, isLoading: loadingClearChat } = useMutation(
    (data) => asnConnectClearNotifications(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["asn-connect-notifications"]);
        message.success("Berhasil menandai semua notifikasi dibaca");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["asn-connect-notifications"]);
      },
    }
  );

  const { mutateAsync: markAsRead, isLoading: loadingMarkAsRead } = useMutation(
    (id) => readNotifactionsAsnConnect(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["asn-connect-notifications"]);
      },
    }
  );

  const gotoDetail = async (item) => {
    const id = item?.reference_id;
    const isAsnUpdate =
      item?.type === "comment_asn_update" || item?.type === "like_asn_update";
    const isAsnDiscussion = item?.type === "comment_asn_discussion";

    await markAsRead(item?.id);

    if (isAsnDiscussion) {
      router.push(`/asn-connect/asn-discussions/${id}/detail`);
    } else if (isAsnUpdate) {
      router.push(`/asn-connect/asn-updates/all/${id}`);
    }
  };

  return (
    <Row justify={"center"}>
      <Col md={14} xs={24}>
        <Card
          title={
            <Space>
              <UserOutlined style={{ color: "#FA8C16" }} />
              <span>Notifikasi</span>
            </Space>
          }
          extra={
            <Button
              loading={loadingClearChat}
              type="link"
              icon={<CheckSquareOutlined />}
              onClick={() => clearChat()}
            >
              Tandai Semua Dibaca
            </Button>
          }
        >
          <List
            pagination={{
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
              total: data?.total,
              onChange: (page, pageSize) => {
                setQuery({ ...query, page, pageSize });
              },
              pageSize: data?.per_page,
              current: data?.page,
            }}
            itemLayout="horizontal"
            dataSource={data?.results}
            loading={isLoading}
            size="small"
            renderItem={(item) => (
              <List.Item
                actions={[item?.is_read ? null : <Badge key="is_read" dot />]}
              >
                <List.Item.Meta
                  avatar={
                    <AvatarUser src={item?.user?.image} userId={item.user_id} />
                  }
                  title={
                    <Space size="small">
                      <Link onClick={() => gotoDetail(item)}>
                        {getNotificationContent(
                          item,
                          userData?.user?.custom_id
                        )}
                      </Link>
                    </Space>
                  }
                  description={
                    <Tooltip title={formatTime(item.created_at)}>
                      <Text type="secondary">
                        {dayjs(item.created_at).fromNow()}
                      </Text>
                    </Tooltip>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>
    </Row>
  );
}

export default SocmedNotifications;
