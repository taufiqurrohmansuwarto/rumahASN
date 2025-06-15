import { changeFeedbackTicket } from "@/services/index";
import {
  SettingOutlined,
  StarOutlined,
  MessageOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Divider,
  Input,
  message,
  Modal,
  Rate,
  Space,
  Button,
  Typography,
  Grid,
  Card,
  Flex,
} from "antd";
import { useState, useMemo } from "react";
import RestrictedContent from "../RestrictedContent";

const { useBreakpoint } = Grid;
const { Text } = Typography;

const SubmitFeeback = ({ item }) => {
  const screens = useBreakpoint();
  const queryClient = useQueryClient();

  const [value, setValue] = useState(item?.stars);
  const [feedbackComment, setFeedbackComment] = useState(
    item?.requester_comment
  );

  const [open, setOpen] = useState(false);

  // Memoize responsive config
  const responsiveConfig = useMemo(() => {
    const isMobile = !screens.md;

    return {
      isMobile,
      modalWidth: isMobile ? "95%" : 600,
    };
  }, [screens.md]);

  const handleOpen = () => setOpen(true);
  const handleCancel = () => setOpen(false);

  const { mutate: updateFeedback, isLoading } = useMutation(
    (data) => changeFeedbackTicket(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["publish-ticket", item?.id]);
        message.success("✅ Berhasil memberikan umpan balik");
        setOpen(false);
      },
      onError: () => {
        message.error("❌ Gagal memberikan umpan balik");
        setOpen(false);
      },
    }
  );

  const handleSubmit = () => {
    const data = {
      id: item?.id,
      data: {
        stars: value,
        requester_comment: feedbackComment,
      },
    };

    if (!value) {
      message.error("⭐ Harap memberikan rating terlebih dahulu");
      return;
    } else {
      updateFeedback(data);
    }
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 1:
        return "😞 Sangat Tidak Puas";
      case 2:
        return "😐 Tidak Puas";
      case 3:
        return "😊 Cukup Puas";
      case 4:
        return "😄 Puas";
      case 5:
        return "🤩 Sangat Puas";
      default:
        return "Pilih rating Anda";
    }
  };

  return (
    <>
      <Modal
        centered
        confirmLoading={isLoading}
        width={responsiveConfig.modalWidth}
        title={
          <Flex align="center" gap={8}>
            <HeartOutlined style={{ color: "#ff4d4f" }} />
            <span>💬 Berikan Umpan Balik</span>
          </Flex>
        }
        onCancel={handleCancel}
        onOk={handleSubmit}
        open={open}
        okText="✅ Kirim Feedback"
        cancelText="❌ Batal"
        okButtonProps={{
          style: {
            background: "#ff4d4f",
            borderColor: "#ff4d4f",
            fontWeight: 600,
          },
        }}
        cancelButtonProps={{
          style: {
            fontWeight: 600,
          },
        }}
      >
        <Flex vertical gap={24} style={{ padding: "16px 0" }}>
          {/* Info Alert */}
          <Alert
            type="info"
            showIcon
            message="💝 Bagaimana pengalaman Anda?"
            description="Rating dan masukan Anda membantu kami memberikan layanan yang lebih baik."
            style={{
              borderRadius: 8,
              border: "1px solid #91d5ff",
              background: "#e6f7ff",
            }}
          />

          {/* Rating Section */}
          <Flex vertical align="center" gap={16}>
            <Text strong style={{ color: "#faad14", fontSize: 16 }}>
              ⭐ Berikan Rating
            </Text>
            <Rate
              value={value}
              onChange={setValue}
              style={{ fontSize: responsiveConfig.isMobile ? 28 : 36 }}
              character={<StarOutlined />}
            />
            <Text
              style={{
                fontSize: responsiveConfig.isMobile ? 14 : 16,
                fontWeight: 600,
                color: value ? "#faad14" : "#8c8c8c",
              }}
            >
              {getRatingText(value)}
            </Text>
          </Flex>

          {/* Comment Section */}
          <Flex vertical gap={12}>
            <Text strong style={{ color: "#1890ff", fontSize: 16 }}>
              💭 Komentar (Opsional)
            </Text>
            <Input.TextArea
              value={feedbackComment}
              placeholder="Bagikan pengalaman Anda..."
              onChange={(e) => setFeedbackComment(e.target.value)}
              rows={responsiveConfig.isMobile ? 4 : 5}
              style={{
                borderRadius: 8,
                fontSize: 14,
                lineHeight: 1.6,
              }}
              showCount
              maxLength={300}
            />
          </Flex>
        </Flex>
      </Modal>

      <Button
        type="text"
        icon={<SettingOutlined />}
        onClick={handleOpen}
        size="small"
        style={{
          color: "#ff4d4f",
          border: "1px solid #ffccc7",
          background: "#fff2f0",
          borderRadius: 6,
          fontWeight: 500,
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#ff4d4f";
          e.currentTarget.style.color = "white";
          e.currentTarget.style.borderColor = "#ff4d4f";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#fff2f0";
          e.currentTarget.style.color = "#ff4d4f";
          e.currentTarget.style.borderColor = "#ffccc7";
        }}
      >
        {responsiveConfig.isMobile ? "" : "Feedback"}
      </Button>
    </>
  );
};

function ChangeFeedback({ item }) {
  const screens = useBreakpoint();

  // Memoize responsive config
  const responsiveConfig = useMemo(() => {
    const isMobile = !screens.md;

    return {
      isMobile,
    };
  }, [screens.md]);

  return (
    <>
      <Flex
        vertical
        gap={8}
        style={{
          padding: "12px 16px",
          // background: "#fafafa",
          borderRadius: 8,
          // border: "1px solid #f0f0f0",
          marginBottom: 16,
        }}
      >
        <Flex justify="space-between" align="center">
          <Flex align="center" gap={8}>
            <Text strong style={{ color: "#ff4d4f" }}>
              💝 Umpan Balik
            </Text>
          </Flex>
          <RestrictedContent
            name="submit-feedback"
            attributes={{ ticket: item }}
          >
            <SubmitFeeback item={item} />
          </RestrictedContent>
        </Flex>

        {item?.stars ? (
          <Flex
            vertical={responsiveConfig.isMobile}
            align={responsiveConfig.isMobile ? "flex-start" : "center"}
            gap={responsiveConfig.isMobile ? 8 : 16}
            style={{ padding: "8px 0" }}
          >
            <Flex align="center" gap={8}>
              <Rate
                value={item?.stars}
                disabled
                style={{ fontSize: responsiveConfig.isMobile ? 16 : 18 }}
              />
              <Text style={{ fontWeight: 600, color: "#faad14" }}>
                ({item?.stars}/5)
              </Text>
            </Flex>
            {item?.requester_comment && (
              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                  fontStyle: "italic",
                  maxWidth: responsiveConfig.isMobile ? "100%" : "300px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: responsiveConfig.isMobile ? "normal" : "nowrap",
                }}
              >
                &ldquo;{item.requester_comment}&rdquo;
              </Text>
            )}
          </Flex>
        ) : (
          <Flex
            justify="center"
            style={{
              padding: "12px 0",
              color: "#8c8c8c",
            }}
          >
            <Text type="secondary" style={{ fontSize: 12 }}>
              🤔 Belum ada feedback
            </Text>
          </Flex>
        )}
      </Flex>
    </>
  );
}

export default ChangeFeedback;
