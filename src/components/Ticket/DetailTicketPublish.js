import { createCommentCustomer, detailPublishTickets } from "@/services/index";
import { formatDateFromNow } from "@/utils/client-utils";
import { formatDate } from "@/utils/index";
import { CustomerTicket } from "@/utils/subject-model";
import {
  BellOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  LockOutlined,
  PushpinOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Col,
  Comment,
  Divider,
  Row,
  Skeleton,
  Space,
  Tooltip,
  Typography,
} from "antd";
import { useState } from "react";
import { Can } from "src/context/Can";
import NewTicket from "./NewTicket";

const CommentDescription = ({ item }) => {
  return <Comment content={item?.content} />;
};

const CommentTicket = ({ item }) => {
  return (
    <Comment
      style={{
        border: "1px solid #cecece",
        padding: 10,
        borderRadius: 10,
        marginTop: 10,
        marginBottom: 10,
      }}
      author={item?.user?.username}
      datetime={
        <Tooltip title={formatDate(item?.created_at)}>
          <span>{formatDateFromNow(item?.created_at)}</span>
        </Tooltip>
      }
      avatar={<Avatar src={item?.user?.image} />}
      content={<div dangerouslySetInnerHTML={{ __html: item?.comment }} />}
    />
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
          <div>
            <Space>
              <CheckCircleOutlined />
              <Typography.Text style={{ fontSize: 12 }}>
                Publikasi
              </Typography.Text>
            </Space>
          </div>
          <div>
            <Space>
              <LockOutlined />
              <Typography.Text style={{ fontSize: 12 }}>
                Kunci Percapakan
              </Typography.Text>
            </Space>
          </div>
          <div>
            <Space>
              <PushpinOutlined />
              <Typography.Text style={{ fontSize: 12 }}>Pin</Typography.Text>
            </Space>
          </div>
          <div>
            <Space>
              <DeleteOutlined />
              <Typography.Text style={{ fontSize: 12 }}>Hapus</Typography.Text>
            </Space>
          </div>
        </Col>
      </Can>
    </Row>
  );
};

const TicketTitle = ({ item }) => {
  return (
    <>
      <Typography.Title level={4}>{item?.title}</Typography.Title>
      <Typography.Text style={{ fontSize: 12 }} type="secondary">
        {item?.customer?.username} membuat tiket pada{" "}
        {formatDateFromNow(item?.created_at)}
      </Typography.Text>
      <Divider />
    </>
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
        <Col span={18}>
          <Row gutter={[8, 16]}>
            <Col span={24}>
              <TicketTitle item={data} />
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
                  <div dangerouslySetInnerHTML={{ __html: data?.content }} />
                }
              />
              {/* create vertical line */}
              {data?.data?.map((item, index) => {
                return (
                  <div key={item?.id}>
                    {item?.type === "comment" ? (
                      <CommentTicket item={item} />
                    ) : (
                      <></>
                    )}
                  </div>
                );
              })}
              <NewTicket
                submitMessage={handleSubmit}
                value={value}
                setValue={setValue}
              />
            </Col>
            <Col span={6}>
              <SideRight item={data} />
            </Col>
          </Row>
        </Col>
      </Skeleton>
    </Row>
  );
};

export default DetailTicketPublish;