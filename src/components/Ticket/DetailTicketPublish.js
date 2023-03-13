import { detailPublishTickets } from "@/services/index";
import { formatDateFromNow } from "@/utils/client-utils";
import { formatDate } from "@/utils/index";
import {
  BellOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  LockOutlined,
  PushpinOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Col,
  Row,
  Typography,
  Divider,
  Comment,
  Button,
  Space,
  Tooltip,
  Avatar,
} from "antd";
import { useState } from "react";
import NewTicket from "./NewTicket";

const CommentDescription = ({ item }) => {
  return <Comment content={item?.content} />;
};

const CommentTicket = ({ item }) => {};

const SideRight = ({ item }) => {
  return (
    <Row>
      <Col span={24}>
        <Typography.Text style={{ fontSize: 12 }}>Agent</Typography.Text>
        <Divider />
      </Col>
      <Col span={24}>
        <Typography.Text style={{ fontSize: 12 }}>
          Pemilih Agent
        </Typography.Text>
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
  const { data, isLoading } = useQuery(
    ["publish-ticket", id],
    () => detailPublishTickets(id),
    {}
  );

  const [value, setValue] = useState();

  return (
    <div>
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
          <NewTicket value={value} setValue={setValue} />
        </Col>
        <Col span={6}>
          <SideRight />
        </Col>
      </Row>
    </div>
  );
};

export default DetailTicketPublish;
