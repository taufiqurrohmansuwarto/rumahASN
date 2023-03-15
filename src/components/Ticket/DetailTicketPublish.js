import {
  createCommentCustomer,
  detailPublishTickets,
  hapusCommentCustomer,
  updateCommentCustomer,
} from "@/services/index";
import { formatDateFromNow } from "@/utils/client-utils";
import { formatDate } from "@/utils/index";
import { CustomerTicket, Comment as UserComment } from "@/utils/subject-model";
import {
  BellOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  LockOutlined,
  PushpinOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Affix,
  Avatar,
  BackTop,
  Button,
  Card,
  Col,
  Comment,
  Divider,
  Popconfirm,
  Row,
  Skeleton,
  Space,
  Tooltip,
  Typography,
  message,
} from "antd";
import { useRouter } from "next/router";
import { useState } from "react";
import { Can } from "src/context/Can";
import LockConversation from "../TicketProps/LockConversation";
import Pin from "../TicketProps/Pin";
import Publish from "../TicketProps/Publish";
import RemoveTicket from "../TicketProps/Remove";
import UnlockConversation from "../TicketProps/UnlockConversation";
import UnpinTicket from "../TicketProps/UnPin";
import Unpublish from "../TicketProps/UnPublish";
import NewTicket from "./NewTicket";

const CommentDescription = ({ item }) => {
  return <Comment content={item?.content} />;
};

const CommentTicket = ({ item }) => {
  const queryClient = useQueryClient();
  const [comment, setComment] = useState(null);
  const [id, setId] = useState(null);

  const handleAccEdit = () => {
    setId(item?.id);
    setComment(item?.commentMarkdown);
  };

  const handleCancelEdit = () => {
    setId(null);
  };

  const router = useRouter();

  const { mutate: hapus, isLoading: isLoadingHapus } = useMutation(
    (data) => hapusCommentCustomer(data),
    {
      onSuccess: () => {
        const id = router.query?.id;
        queryClient.invalidateQueries(["publish-ticket", id]);
        message.success("Berhasil menghapus komentar");
      },
    }
  );

  const { mutate: editData, isLoading: isLoadingEdit } = useMutation(
    (data) => updateCommentCustomer(data),
    {
      onSuccess: () => {
        const id = router.query?.id;
        queryClient.invalidateQueries(["publish-ticket", id]);
        setId(null);
        setComment(null);
        message.success("Berhasil mengubah komentar");
      },
    }
  );

  const handleHapus = () => {
    const data = {
      ticketId: router.query?.id,
      commentId: item?.id,
    };

    hapus(data);
  };

  const handleUpdate = async () => {
    const data = {
      ticketId: router.query?.id,
      commentId: item?.id,
      data: {
        comment,
      },
    };

    editData(data);
  };

  return (
    <>
      {item?.id === id ? (
        <NewTicket
          handleCancel={handleCancelEdit}
          setValue={setComment}
          value={comment}
          submitMessage={handleUpdate}
          withCancel={true}
        />
      ) : (
        <Comment
          style={{
            border: "1px solid #cecece",
            padding: 10,
            borderRadius: 10,
            marginTop: 10,
            marginBottom: 10,
          }}
          actions={[
            <Can key="edit" I="update" on={new UserComment(item)}>
              <span onClick={handleAccEdit}>Edit</span>
            </Can>,
            <Can key="hapus" I="update" on={new UserComment(item)}>
              <Popconfirm
                onConfirm={handleHapus}
                title="Apakah kamu yakin ingin menghapus?"
              >
                <span>Hapus</span>
              </Popconfirm>
            </Can>,
          ]}
          author={item?.user?.username}
          datetime={
            <Tooltip title={formatDate(item?.created_at)}>
              <span>{formatDateFromNow(item?.created_at)}</span>
            </Tooltip>
          }
          avatar={<Avatar src={item?.user?.image} />}
          content={<div dangerouslySetInnerHTML={{ __html: item?.comment }} />}
        />
      )}
    </>
  );
};

const SideRight = ({ item }) => {
  return (
    <Row>
      <Col span={24}>
        <Space direction="vertical">
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Agent
          </Typography.Text>
          <Typography.Text style={{ fontSize: 13 }}>
            {item?.assignee ? "Belum ada" : item?.assignee?.username}
          </Typography.Text>
        </Space>
        <Divider />
      </Col>
      <Col span={24}>
        <Space direction="vertical">
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Pemilih Agent
          </Typography.Text>
          <Typography.Text style={{ fontSize: 13 }}>
            {item?.chooser ? "Belum ada" : item?.assignee?.username}
          </Typography.Text>
        </Space>
        <Divider />
      </Col>
      <Col span={24}>
        <Space direction="vertical">
          <Typography.Text style={{ fontSize: 12 }}>Notifikasi</Typography.Text>
          <Button icon={<BellOutlined />}>Langganan</Button>
        </Space>
        <Divider />
      </Col>
      <Col span={24}>
        <Typography.Text style={{ fontSize: 12 }}>
          3 Partisipants
        </Typography.Text>
        <Divider />
      </Col>
      <Can I="update" on={new CustomerTicket(item)}>
        <Col span={24}>
          {item?.is_published ? (
            <Unpublish id={item?.id} />
          ) : (
            <Publish id={item?.id} />
          )}
          {item?.is_locked ? (
            <UnlockConversation id={item?.id} />
          ) : (
            <LockConversation id={item?.id} />
          )}
          {item?.is_pinned ? (
            <UnpinTicket id={item?.id} />
          ) : (
            <Pin id={item?.id} />
          )}
          <RemoveTicket />
        </Col>
      </Can>
    </Row>
  );
};

const TicketTitle = ({ item }) => {
  return (
    <div>
      <Card>
        <Typography.Title level={4}>{item?.title}</Typography.Title>
        <Typography.Text style={{ fontSize: 12 }} type="secondary">
          {item?.customer?.username} membuat tiket pada{" "}
          {formatDateFromNow(item?.created_at)}
        </Typography.Text>
      </Card>
      <Divider />
    </div>
  );
};

// start header
const DetailTicketPublish = ({ id }) => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ["publish-ticket", id],
    () => detailPublishTickets(id),
    {}
  );

  const { mutate: createComment, isLoading: isLoadingCreate } = useMutation(
    (data) => createCommentCustomer(data),
    {
      onSettled: () => queryClient.invalidateQueries(["publish-ticket", id]),
      onSuccess: () => {
        queryClient.invalidateQueries(["publish-ticket", id]);
        setValue("");
      },
    }
  );

  const handleSubmit = () => {
    const data = {
      id,
      data: {
        comment: value,
      },
    };
    createComment(data);
  };

  const [value, setValue] = useState("");

  return (
    <Row justify="center">
      <Skeleton loading={isLoading}>
        {data && (
          <>
            <BackTop />
            <Col span={18}>
              <Row gutter={[8, 16]}>
                <Col span={24}>
                  <Affix>
                    <TicketTitle item={data} />
                  </Affix>
                </Col>
              </Row>
              <Row gutter={[16, 32]}>
                <Col span={18}>
                  <Comment
                    style={{
                      border: "1px solid #cecece",
                      padding: 10,
                      borderRadius: 10,
                    }}
                    author={data?.customer?.username}
                    datetime={
                      <Tooltip title={formatDate(data?.created_at)}>
                        <span>{formatDateFromNow(data?.created_at)}</span>
                      </Tooltip>
                    }
                    avatar={<Avatar src={data?.customer?.image} />}
                    content={
                      <div
                        dangerouslySetInnerHTML={{ __html: data?.content }}
                      />
                    }
                  />
                  {/* create vertical line */}
                  {data?.data?.map((item, index) => {
                    return (
                      <div key={item?.custom_id}>
                        {item?.type === "comment" ? (
                          <CommentTicket item={item} />
                        ) : (
                          <></>
                        )}
                      </div>
                    );
                  })}
                  <Can I="create" a="Comment">
                    <NewTicket
                      submitMessage={handleSubmit}
                      value={value}
                      setValue={setValue}
                    />
                  </Can>
                </Col>
                <Col span={6}>
                  <SideRight item={data} />
                </Col>
              </Row>
            </Col>
          </>
        )}
      </Skeleton>
    </Row>
  );
};

export default DetailTicketPublish;
