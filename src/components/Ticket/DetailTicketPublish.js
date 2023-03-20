import {
  createCommentCustomer,
  detailPublishTickets,
  hapusCommentCustomer,
  markAnswerTicket,
  unmarkAnswerTicket,
  updateCommentCustomer,
} from "@/services/index";
import {
  formatDateFromNow,
  setColorPrioritas,
  setColorStatus,
} from "@/utils/client-utils";
import { formatDate } from "@/utils/index";
import { EllipsisOutlined, LockOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Affix,
  Avatar,
  BackTop,
  Card,
  Col,
  Comment,
  Divider,
  message,
  Popconfirm,
  Row,
  Skeleton,
  Space,
  Tag,
  Timeline,
  Tooltip,
  Menu,
  Typography,
  Popover,
  Dropdown,
} from "antd";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import RestrictedContent from "../RestrictedContent";
import SimpleEmojiPicker from "../SimpleEmojiPicker";
import ChangeSubCategory from "../TicketProps/ChageSubCategory";
import ChangeAssignee from "../TicketProps/ChangeAssignee";
import ChangeStatus from "../TicketProps/ChangeStatus";
import LockConversation from "../TicketProps/LockConversation";
import Pin from "../TicketProps/Pin";
import Publish from "../TicketProps/Publish";
import RemoveTicket from "../TicketProps/Remove";
import Subscribe from "../TicketProps/Subscribe";
import UnlockConversation from "../TicketProps/UnlockConversation";
import UnpinTicket from "../TicketProps/UnPin";
import Unpublish from "../TicketProps/UnPublish";
import Unsubscribe from "../TicketProps/Unsubscribe";
import NewTicket from "./NewTicket";

const renderOptionsMenu = () => (
  <Menu>
    <Menu.Item key="1">Option 1</Menu.Item>
    <Menu.Item key="2">Option 2</Menu.Item>
    <Menu.Item key="3">Option 3</Menu.Item>
  </Menu>
);

const ActionWrapper = ({ attributes, name, ...props }) => {
  return (
    <RestrictedContent attributes={attributes} name={name} {...props}>
      <Menu.Item {...props}>{props.children}</Menu.Item>
    </RestrictedContent>
  );
};

const CommentTicket = ({ item, agent, customer, admin }) => {
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

  const { mutate: markAnswer, isLoading: isLoadingMarkAnswer } = useMutation(
    (data) => markAnswerTicket(data),
    {
      onSuccess: () => {
        const id = router.query?.id;
        queryClient.invalidateQueries(["publish-ticket", id]);
        message.success("Berhasil menandai jawaban");
      },
      onError: () => message.error("Gagal menandai jawaban"),
    }
  );

  const { mutate: unmarkAnswer, isLoading: isLoadingUnmarkAnswer } =
    useMutation((data) => unmarkAnswerTicket(data), {
      onSuccess: () => {
        const id = router.query?.id;
        queryClient.invalidateQueries(["publish-ticket", id]);
        message.success("Berhasil membatalkan tanda jawaban");
      },
      onError: () => message.error("Gagal membatalkan tanda jawaban"),
    });

  const handleMarkAnswer = () => {
    const data = {
      id: router.query?.id,
      commentId: item?.id,
    };
    markAnswer(data);
  };

  const handleUnmarkAnswer = () => {
    const data = {
      id: router.query?.id,
      commentId: item?.id,
    };
    unmarkAnswer(data);
  };

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
          loadingSubmit={isLoadingEdit}
          value={comment}
          submitMessage={handleUpdate}
          withCancel={true}
        />
      ) : (
        <>
          <Row
            style={{
              border: "1px solid",
              borderColor: item?.is_answer ? "#52c41a" : "#d9d9d9",
              padding: 10,
              borderRadius: 10,
              marginTop: 10,
              marginBottom: 10,
            }}
          >
            <Col flex="auto">
              <Comment
                actions={[<SimpleEmojiPicker key="emoji" />]}
                author={item?.user?.username}
                datetime={
                  <Tooltip title={formatDate(item?.created_at)}>
                    <Space>
                      <span>
                        {item?.is_edited
                          ? formatDateFromNow(item?.updated_at)
                          : formatDateFromNow(item?.created_at)}
                      </span>
                      {item?.is_edited && <span>&#8226; diedit</span>}
                    </Space>
                  </Tooltip>
                }
                avatar={<Avatar src={item?.user?.image} />}
                content={
                  <div dangerouslySetInnerHTML={{ __html: item?.comment }} />
                }
              />
            </Col>
            <Col>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  height: "100%",
                }}
              >
                <Dropdown
                  trigger={["click"]}
                  overlay={
                    <Menu>
                      <ActionWrapper
                        key="2"
                        name="mark-answer"
                        attributes={{ agent }}
                      >
                        {item?.is_answer ? (
                          <span onClick={handleUnmarkAnswer}>
                            Hapus Tanda Jawaban
                          </span>
                        ) : (
                          <span onClick={handleMarkAnswer}>
                            Tandai Sebagai Jawaban
                          </span>
                        )}
                      </ActionWrapper>
                      <ActionWrapper
                        key="1"
                        name="edit-comment"
                        attributes={{ comment: item }}
                      >
                        <span onClick={handleAccEdit}>Edit</span>
                      </ActionWrapper>
                      <ActionWrapper
                        style={{ color: "red" }}
                        key="3"
                        name="remove-comment"
                        attributes={{ comment: item }}
                      >
                        <span onClick={handleHapus}>Hapus</span>
                      </ActionWrapper>
                    </Menu>
                  }
                >
                  <EllipsisOutlined />
                </Dropdown>
              </div>
            </Col>
          </Row>

          {item?.timelineItems?.length > 0 && (
            <Timeline>
              {item?.timelineItems?.map((timeline) => (
                <Timeline.Item dot={<LockOutlined />} key={timeline.custom_id}>
                  <Space>
                    <Avatar size="small" src={timeline?.user?.image} />
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                      {timeline?.user?.username} {timeline?.comment}{" "}
                      {formatDateFromNow(timeline?.created_at)}
                    </Typography.Text>
                  </Space>
                </Timeline.Item>
              ))}
            </Timeline>
          )}
        </>
      )}
    </>
  );
};

const SideRight = ({ item }) => {
  return (
    <Row>
      <Col span={24}>
        <Space direction="vertical">
          <Space align="start">
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Kategori dan Prioritas
            </Typography.Text>
            <ChangeSubCategory />
          </Space>
          <Space>
            <Typography.Text style={{ fontSize: 13 }}>
              {item?.sub_category_id
                ? item?.sub_category?.category?.name
                : "Tidak ada"}
            </Typography.Text>
            {item?.priority_code && (
              <Tag color={setColorPrioritas(item?.priority_code)}>
                {item?.priority_code}
              </Tag>
            )}
          </Space>
        </Space>
        <Divider />
      </Col>
      <Col span={24}>
        <Space direction="vertical">
          <Space align="start">
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Status
            </Typography.Text>
            <ChangeStatus />
          </Space>
          <Tag color={setColorStatus(item?.status_code)}>
            {item?.status_code}
          </Tag>
        </Space>
        <Divider />
      </Col>
      <Col span={24}>
        <Space direction="vertical">
          <Space>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Penerima Tugas
            </Typography.Text>
            <ChangeAssignee id={item?.id} userId={item?.assignee} />
          </Space>
          {!item?.assignee ? (
            <Typography.Text style={{ fontSize: 13 }}>
              Belum Ada
            </Typography.Text>
          ) : (
            <Space>
              <Tooltip title={item?.agent?.username}>
                <Avatar size="small" src={item?.agent?.image} />
              </Tooltip>
            </Space>
          )}
        </Space>
        <Divider />
      </Col>
      <Col span={24}>
        <Space direction="vertical">
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Pemilih Penerima Tugas
          </Typography.Text>
          {!item?.chooser ? (
            <Typography.Text style={{ fontSize: 13 }}>
              Belum Ada
            </Typography.Text>
          ) : (
            <Space>
              <Tooltip title={item?.admin?.username}>
                <Avatar size="small" src={item?.admin?.image} />
              </Tooltip>
            </Space>
          )}
        </Space>
        <Divider />
      </Col>
      <Col span={24}>
        {item?.is_subscribe ? (
          <Unsubscribe id={item?.id} />
        ) : (
          <Subscribe id={item?.id} />
        )}
      </Col>
      <Divider />
      <Col span={24}>
        <Space direction="vertical">
          <Typography.Text style={{ fontSize: 12 }}>
            {item?.participants?.length}{" "}
            {item?.participants?.length > 1 ? "Peserta" : "Peserta"}
          </Typography.Text>
          {item?.participants?.length > 0 && (
            <Avatar.Group>
              {item?.participants?.map((item) => (
                <Tooltip title={item?.username} key={item?.custom_id}>
                  <Avatar src={item?.image} />
                </Tooltip>
              ))}
            </Avatar.Group>
          )}
        </Space>
        <Divider />
      </Col>
      <RestrictedContent name="options-ticket" attributes={{ ticket: item }}>
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
      </RestrictedContent>
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
    </div>
  );
};

const DetailTicketPublish = ({ id }) => {
  const bottomRef = useRef(null);
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
                  <Affix offsetTop={40}>
                    <TicketTitle item={data} />
                  </Affix>
                  <Divider />
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
                  {data?.data?.map((item, index) => {
                    return (
                      <CommentTicket
                        key={item?.custom_id}
                        customer={data?.customer}
                        agent={data?.agent}
                        admin={data?.admin}
                        item={item}
                      />
                    );
                  })}
                  <RestrictedContent
                    name="create-comment"
                    attributes={{ ticket: data }}
                  >
                    <Divider />
                    <NewTicket
                      submitMessage={handleSubmit}
                      value={value}
                      setValue={setValue}
                      loadingSubmit={isLoadingCreate}
                    />
                    <div ref={bottomRef}></div>
                  </RestrictedContent>
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
