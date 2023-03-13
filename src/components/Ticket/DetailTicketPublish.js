import { detailPublishTickets } from "@/services/index";
import { formatDateFromNow } from "@/utils/client-utils";
import { useQuery } from "@tanstack/react-query";
import { Col, Row, Typography, Divider, Comment, Button, Space } from "antd";

const CommentDescription = ({ item }) => {
  return <Comment content={item?.content} />;
};

const CommentTicket = ({ item }) => {};

const SideRight = ({ item }) => {
  return (
    <Row>
      <Col span={24}>
        <Typography.Text style={{ fontSize: 12 }}>Assignee</Typography.Text>
        <Divider />
      </Col>
      <Col span={24}>
        <Typography.Text style={{ fontSize: 12 }}>Comments</Typography.Text>
        <Divider />
      </Col>
      <Col span={24}>
        <Space>
          <Typography.Text style={{ fontSize: 12 }}>Notifikasi</Typography.Text>
          <Button>Langganan</Button>
        </Space>
      </Col>
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

function DetailTicketPublish({ id }) {
  const { data, isLoading } = useQuery(
    ["publish-ticket", id],
    () => detailPublishTickets(id),
    {}
  );
  return (
    <div>
      <Row>
        <Col span={24}>
          <TicketTitle item={data} />
        </Col>
      </Row>
      <Row>
        <Col span={18}></Col>
        <Col span={6}>
          <SideRight />
        </Col>
      </Row>
    </div>
  );
}

export default DetailTicketPublish;
