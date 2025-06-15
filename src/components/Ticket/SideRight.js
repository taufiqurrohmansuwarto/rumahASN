import {
  Tooltip,
  Avatar,
  Col,
  Divider,
  Row,
  Space,
  Tag,
  Typography,
  Grid,
  Card,
} from "antd";
import Link from "next/link";
import React, { useMemo } from "react";
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

const { useBreakpoint } = Grid;
const { Text, Title } = Typography;

const SideRight = ({ item }) => {
  const screens = useBreakpoint();

  // Memoize responsive config
  const responsiveConfig = useMemo(() => {
    const isMobile = !screens.md;

    return {
      isMobile,
      spacing: isMobile ? 12 : 16,
      fontSize: isMobile ? 12 : 13,
      labelFontSize: isMobile ? 11 : 12,
    };
  }, [screens.md]);

  return (
    <div>
      <Space
        direction="vertical"
        size={responsiveConfig.spacing}
        style={{ width: "100%" }}
      >
        {/* Kategori dan Prioritas */}
        <Card size="small" title="🏷️ Kategori & Prioritas">
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: responsiveConfig.fontSize }}>
                {item?.sub_category_id
                  ? item?.sub_category?.name
                  : "Tidak ada kategori"}
              </Text>
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
            </div>
            {item?.priority_code && (
              <Tag
                color={setColorPrioritas(item?.priority_code)}
                style={{ fontWeight: 600, borderRadius: 4 }}
              >
                {item?.priority_code}
              </Tag>
            )}
          </Space>
        </Card>

        {/* Status */}
        <Card size="small" title="📊 Status Ticket">
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Tag
                icon={setStatusIcon(item?.status_code)}
                color={setColorStatus(item?.status_code)}
                style={{ fontWeight: 600, borderRadius: 4 }}
              >
                {item?.status_code}
              </Tag>
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
            </div>
          </Space>
        </Card>

        {/* Penerima Tugas */}
        <Card size="small" title="👤 Penerima Tugas">
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {!item?.assignee ? (
                <Text
                  type="secondary"
                  style={{
                    fontSize: responsiveConfig.fontSize,
                    fontStyle: "italic",
                  }}
                >
                  Belum ada yang ditugaskan
                </Text>
              ) : (
                <Space>
                  <Tooltip title={item?.agent?.username}>
                    <Avatar
                      size={responsiveConfig.isMobile ? 24 : 28}
                      src={item?.agent?.image}
                    >
                      {item?.agent?.username?.charAt(0)?.toUpperCase()}
                    </Avatar>
                  </Tooltip>
                  <Text
                    style={{
                      fontSize: responsiveConfig.fontSize,
                      fontWeight: 500,
                    }}
                  >
                    {item?.agent?.username}
                  </Text>
                </Space>
              )}
              <RestrictedContent name="change-agent">
                <ChangeAssignee ticketId={item?.id} agentId={item?.assignee} />
              </RestrictedContent>
            </div>
          </Space>
        </Card>

        {/* Feedback */}
        <Card size="small" title="💬 Feedback">
          <ChangeFeedback item={item} />
        </Card>

        {/* Pemilih Penerima Tugas */}
        <Card size="small" title="👨‍💼 Pemilih Penerima Tugas">
          {!item?.chooser ? (
            <Text
              type="secondary"
              style={{
                fontSize: responsiveConfig.fontSize,
                fontStyle: "italic",
              }}
            >
              Belum ada yang memilih
            </Text>
          ) : (
            <Space>
              <Tooltip title={item?.admin?.username}>
                <Avatar
                  size={responsiveConfig.isMobile ? 24 : 28}
                  src={item?.admin?.image}
                >
                  {item?.admin?.username?.charAt(0)?.toUpperCase()}
                </Avatar>
              </Tooltip>
              <Text
                style={{ fontSize: responsiveConfig.fontSize, fontWeight: 500 }}
              >
                {item?.admin?.username}
              </Text>
            </Space>
          )}
        </Card>

        {/* Notifikasi */}
        <Card size="small" title="🔔 Notifikasi">
          {item?.is_subscribe ? (
            <Unsubscribe id={item?.id} />
          ) : (
            <Subscribe id={item?.id} />
          )}
        </Card>

        {/* Participants */}
        <Card size="small" title="👥 Partisipan">
          <Participants item={item} />
        </Card>

        {/* Actions - Vertical Layout */}
        <RestrictedContent name="options-ticket" attributes={{ ticket: item }}>
          <Card size="small" title="⚙️ Aksi Ticket">
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
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

              <Divider style={{ margin: "8px 0" }} />

              <RemoveTicket id={item?.id} />
            </Space>
          </Card>
        </RestrictedContent>
      </Space>
    </div>
  );
};

export default SideRight;
