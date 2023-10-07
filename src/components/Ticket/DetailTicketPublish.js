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
  setStatusIcon,
} from "@/utils/client-utils";
import { formatDate } from "@/utils/index";
import { EllipsisOutlined, FireOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Affix,
  Avatar,
  BackTop,
  Col,
  Comment,
  Divider,
  Dropdown,
  Menu,
  Row,
  Skeleton,
  Space,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import RestrictedContent from "../RestrictedContent";
import SimpleEmojiPicker from "../SimpleEmojiPicker";
import ChangeSubCategory from "../TicketProps/ChageSubCategory";
import ChangeAssignee from "../TicketProps/ChangeAssignee";
import ChangeTicketDescription from "../TicketProps/ChangeDescription";
import ChangeFeedback from "../TicketProps/ChangeFeedback";
import ChangeStatus from "../TicketProps/ChangeStatus";
import ChangeTicketTitle from "../TicketProps/ChangeTicketTitle";
import LockConversation from "../TicketProps/LockConversation";
import Participants from "../TicketProps/Participants";
import Pin from "../TicketProps/Pin";
import Publish from "../TicketProps/Publish";
import ReactionsEmoji from "../TicketProps/ReactionsEmoji";
import ReminderTicket from "../TicketProps/ReminderTicket";
import RemoveTicket from "../TicketProps/Remove";
import Subscribe from "../TicketProps/Subscribe";
import TimelineTicket from "../TicketProps/TimelineTicket";
import UnpinTicket from "../TicketProps/UnPin";
import Unpublish from "../TicketProps/UnPublish";
import UnlockConversation from "../TicketProps/UnlockConversation";
import Unsubscribe from "../TicketProps/Unsubscribe";
import NewTicket from "./NewTicket";
import TicketsRecommendations from "../TicketProps/TicketsRecommendations";
import Link from "next/link";

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
      {item?.id === id && item?.id !== null ? (
        <div style={{ marginTop: 10 }}>
          <NewTicket
            handleCancel={handleCancelEdit}
            setValue={setComment}
            loadingSubmit={isLoadingEdit}
            value={comment}
            submitMessage={handleUpdate}
            withCancel={true}
          />
        </div>
      ) : (
        <>
          {item?.type === "comment" && item?.id !== null && (
            <Row
              align="top"
              justify="space-between"
              style={{
                border: "1px solid",
                borderColor: item?.is_answer ? "#52c41a" : "#d9d9d9",
                padding: 10,
                borderRadius: 6,
                marginTop: 10,
                marginBottom: 10,
              }}
            >
              <Col span={23}>
                <Comment
                  actions={[
                    <SimpleEmojiPicker
                      ticketId={router?.query?.id}
                      comment={item}
                      key="emoji"
                    />,
                    <ReactionsEmoji
                      key="reaction-emoji"
                      reactions={item?.reactions}
                    />,
                  ]}
                  author={
                    <Link href={`/users/${item?.user?.custom_id}`}>
                      <Space>
                        <Typography.Link>
                          {item?.user?.username}
                        </Typography.Link>
                        {item?.user?.current_role === "agent" ||
                        item?.user?.current_role === "admin" ? (
                          <Tag icon={<FireOutlined />} color="yellow">
                            Staff BKD
                          </Tag>
                        ) : null}
                      </Space>
                    </Link>
                  }
                  datetime={
                    <Tooltip title={formatDate(item?.created_at)}>
                      <Space>
                        <span>
                          &#8226;{" "}
                          {item?.is_edited
                            ? formatDateFromNow(item?.updated_at)
                            : formatDateFromNow(item?.created_at)}
                        </span>
                        {item?.is_edited && <span>&#8226; diedit</span>}
                      </Space>
                    </Tooltip>
                  }
                  avatar={
                    <Link href={`/users/${item?.user?.custom_id}`}>
                      <Avatar src={item?.user?.image} />
                    </Link>
                  }
                  content={
                    <Row>
                      <Col span={22}>
                        <div
                          dangerouslySetInnerHTML={{ __html: item?.comment }}
                        />
                      </Col>
                    </Row>
                  }
                />
              </Col>
              <Col span={1}>
                <div>
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
                    <EllipsisOutlined
                      style={{
                        color: "#262626",
                      }}
                    />
                  </Dropdown>
                </div>
              </Col>
            </Row>
          )}
          <TimelineTicket timelineItems={item?.timelineItems} />
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
            <RestrictedContent
              name="change-priority-kategory"
              attributes={{ ticket: item }}
            >
              <ChangeSubCategory
                ticketId={item?.id}
                subCategoryId={item?.sub_category_id}
                priorityCode={item?.priority_code}
              />
            </RestrictedContent>
          </Space>
          <Space>
            <Typography.Text style={{ fontSize: 13 }}>
              {item?.sub_category_id ? item?.sub_category?.name : "Tidak ada"}
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
            <RestrictedContent
              name="change-status"
              attributes={{ ticket: item }}
            >
              <ChangeStatus
                ticket={item}
                statusId={item?.status_code}
                ticketId={item?.id}
              />
            </RestrictedContent>
          </Space>
          <Tag
            icon={setStatusIcon(item?.status_code)}
            color={setColorStatus(item?.status_code)}
          >
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
            <RestrictedContent name="change-agent">
              <ChangeAssignee ticketId={item?.id} agentId={item?.assignee} />
            </RestrictedContent>
          </Space>
          {!item?.assignee ? (
            <Typography.Text style={{ fontSize: 13 }}>
              Belum Ada
            </Typography.Text>
          ) : (
            <Space>
              <Link href={`/users/${item?.agent?.custom_id}`}>
                <Tooltip title={item?.agent?.username}>
                  <Avatar
                    style={{ cursor: "pointer" }}
                    size="small"
                    src={item?.agent?.image}
                  />
                </Tooltip>
              </Link>
            </Space>
          )}
        </Space>
        <Divider />
      </Col>
      <Col span={24}>
        <ChangeFeedback item={item} />
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
              <Link href={`/users/${item?.admin?.custom_id}`}>
                <Tooltip title={item?.admin?.username}>
                  <Avatar
                    style={{ cursor: "pointer" }}
                    size="small"
                    src={item?.admin?.image}
                  />
                </Tooltip>
              </Link>
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
        <Participants item={item} />
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
          <ReminderTicket id={item?.id} />
          <RemoveTicket id={item?.id} />
        </Col>
      </RestrictedContent>
    </Row>
  );
};

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

  const [value, setValue] = useState(null);

  return (
    <Row justify="center">
      <Skeleton loading={isLoading}>
        <Head>
          <title>{data?.title}</title>
        </Head>
        {data && (
          <>
            <BackTop />
            <Col md={18} xs={24}>
              <Row gutter={[8, 16]}>
                <Col span={24}>
                  <Affix offsetTop={40}>
                    <ChangeTicketTitle
                      name="edit-ticket-title"
                      attributes={{ ticket: data }}
                      ticket={data}
                    />
                  </Affix>
                  <Divider />
                </Col>
              </Row>
              <Row gutter={[32, 64]}>
                <Col md={18} xs={24}>
                  <ChangeTicketDescription item={data} />
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
                  </RestrictedContent>
                  <TicketsRecommendations />
                </Col>
                <Col md={6} xs={24}>
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
