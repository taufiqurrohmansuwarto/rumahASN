import {
  createCommentCustomer,
  detailPublishTickets,
  hapusCommentCustomer,
  markAnswerTicket,
  unmarkAnswerTicket,
  updateCommentCustomer,
} from "@/services/index";
import { formatDateFromNow } from "@/utils/client-utils";
import { formatDate } from "@/utils/index";
import { Comment } from "@ant-design/compatible";
import { EllipsisOutlined, FireOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Affix,
  Avatar,
  FloatButton,
  Col,
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
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import ReactMarkdownCustom from "../MarkdownEditor/ReactMarkdownCustom";
import RestrictedContent from "../RestrictedContent";
import SimpleEmojiPicker from "../SimpleEmojiPicker";
import ChangeTicketDescription from "../TicketProps/ChangeDescription";
import ChangeTicketTitle from "../TicketProps/ChangeTicketTitle";
import ReactionsEmoji from "../TicketProps/ReactionsEmoji";
import TicketsRecommendations from "../TicketProps/TicketsRecommendations";
import TimelineTicket from "../TicketProps/TimelineTicket";
import NewTicket from "./NewTicket";
import SideRight from "./SideRight";

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
                        <ReactMarkdownCustom>
                          {item?.commentMarkdown}
                        </ReactMarkdownCustom>
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
            <FloatButton.BackTop />
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
                      currentStatus={data?.status_code}
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
