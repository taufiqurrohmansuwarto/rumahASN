import {
  Tooltip,
  Avatar,
  Col,
  Divider,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import Link from "next/link";
import React from "react";
import ChangeAssignee from "@/components/TicketProps/ChangeAssignee";
import ChangeFeedback from "@/components/TicketProps/ChangeFeedback";
import ChangeStatus from "@/components/TicketProps/ChangeStatus";
import ChangeSubCategory from "@/components/TicketProps/ChageSubCategory";
import LockConversation from "@/components/TicketProps/LockConversation";
import Participants from "@/components/TicketProps/Participants";
import Pin from "@/components/TicketProps/Pin";
import Publish from "@/components/TicketProps/Publish";
import ReminderTicket from "@/components/TicketProps/ReminderTicket";
import RemoveTicket from "@/components/TicketProps/Remove";
import RestrictedContent from "@/components/RestrictedContent";
import Subscribe from "@/components/TicketProps/Subscribe";
import UnpinTicket from "@/components/TicketProps/UnPin";
import Unpublish from "@/components/TicketProps/UnPublish";
import UnlockConversation from "@/components/TicketProps/UnlockConversation";
import Unsubscribe from "@/components/TicketProps/Unsubscribe";
import {
  setColorPrioritas,
  setColorStatus,
  setStatusIcon,
} from "@/utils/client-utils";

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
              {/* <Link href={`/users/${item?.agent?.custom_id}`}> */}
              <Tooltip title={item?.agent?.username}>
                <Avatar
                  style={{ cursor: "pointer" }}
                  size="small"
                  src={item?.agent?.image}
                />
              </Tooltip>
              {/* </Link> */}
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
              {/* <Link href={`/users/${item?.admin?.custom_id}`}> */}
              <Tooltip title={item?.admin?.username}>
                <Avatar
                  style={{ cursor: "pointer" }}
                  size="small"
                  src={item?.admin?.image}
                />
              </Tooltip>
              {/* </Link> */}
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

export default SideRight;
