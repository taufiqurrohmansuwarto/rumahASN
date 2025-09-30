import { Card, Descriptions, Avatar, Space } from "antd";
import {
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Text, Badge } from "@mantine/core";
import { SignatureRequestStatusBadge } from "./shared";
import { IconUser, IconUsers, IconArrowRight, IconEqual } from "@tabler/icons-react";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

const DocumentInfoCard = ({ signatureRequest }) => {
  if (!signatureRequest) return null;

  const document = signatureRequest.document;
  const creator = signatureRequest.creator;
  const fileSize = document?.file_size || 0;
  const fileSizeKB = fileSize > 0 ? (fileSize / 1024).toFixed(0) : 0;
  const fileSizeMB = fileSize > 1024 * 1024 ? (fileSize / (1024 * 1024)).toFixed(2) : null;
  const displaySize = fileSizeMB ? `${fileSizeMB} MB` : `${fileSizeKB} KB`;

  const totalSigners = signatureRequest.signature_details?.length || 0;
  const signedCount =
    signatureRequest.signature_details?.filter((d) => d.status === "signed").length || 0;

  return (
    <Card
      style={{
        marginBottom: 24,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <Space size="middle" align="center">
          <Avatar
            size={48}
            icon={<FileTextOutlined />}
            style={{
              backgroundColor: "#e6f7ff",
              color: "#1890ff",
            }}
          />
          <div>
            <Text style={{ fontSize: 18, fontWeight: 600, color: "#262626" }}>
              {document?.title || "Untitled Document"}
            </Text>
            <div style={{ marginTop: 4, display: "flex", gap: 6, alignItems: "center" }}>
              <Text style={{ fontSize: 12, color: "#8c8c8c" }}>
                {document?.document_code || "-"}
              </Text>
              <Text style={{ fontSize: 12, color: "#8c8c8c" }}>•</Text>
              <Text style={{ fontSize: 12, color: "#8c8c8c" }}>.pdf</Text>
              {fileSize > 0 && (
                <>
                  <Text style={{ fontSize: 12, color: "#8c8c8c" }}>•</Text>
                  <Text style={{ fontSize: 12, color: "#595959", fontWeight: 500 }}>
                    {displaySize}
                  </Text>
                </>
              )}
            </div>
          </div>
        </Space>
      </div>

      <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered size="small">
        <Descriptions.Item label="Status">
          <SignatureRequestStatusBadge status={signatureRequest.status} />
        </Descriptions.Item>

        <Descriptions.Item label="Tipe Permintaan">
          <Badge
            color={signatureRequest.type === "self_sign" ? "blue" : "green"}
            size="sm"
            leftSection={
              <div style={{ display: "flex", alignItems: "center" }}>
                {signatureRequest.type === "self_sign" ? (
                  <IconUser size={12} />
                ) : (
                  <IconUsers size={12} />
                )}
              </div>
            }
            styles={{
              section: {
                display: "flex",
                alignItems: "center",
              },
            }}
          >
            {signatureRequest.type === "self_sign" ? "Sendiri" : "Permintaan"}
          </Badge>
        </Descriptions.Item>

        <Descriptions.Item label="Alur Kerja">
          <Badge
            color={signatureRequest.request_type === "sequential" ? "orange" : "violet"}
            size="sm"
            leftSection={
              <div style={{ display: "flex", alignItems: "center" }}>
                {signatureRequest.request_type === "sequential" ? (
                  <IconArrowRight size={12} />
                ) : (
                  <IconEqual size={12} />
                )}
              </div>
            }
            styles={{
              section: {
                display: "flex",
                alignItems: "center",
              },
            }}
          >
            {signatureRequest.request_type === "sequential" ? "Berurutan" : "Paralel"}
          </Badge>
        </Descriptions.Item>

        <Descriptions.Item label="Pembuat">
          <Space size="small">
            <Avatar size={24} src={creator?.image}>
              {!creator?.image && <UserOutlined />}
            </Avatar>
            <div>
              <Text style={{ fontSize: 12, fontWeight: 500 }}>
                {creator?.username || "-"}
              </Text>
              {creator?.nama_jabatan && (
                <div>
                  <Text style={{ fontSize: 11, color: "#8c8c8c" }}>
                    {creator.nama_jabatan}
                  </Text>
                </div>
              )}
            </div>
          </Space>
        </Descriptions.Item>

        <Descriptions.Item label="Dibuat">
          <Space size={4}>
            <CalendarOutlined style={{ fontSize: 12, color: "#8c8c8c" }} />
            <Text style={{ fontSize: 12 }}>
              {dayjs(signatureRequest.created_at).format("DD MMMM YYYY, HH:mm")}
            </Text>
          </Space>
        </Descriptions.Item>

        <Descriptions.Item label="Progress">
          <Space size={4}>
            <TeamOutlined style={{ fontSize: 12, color: "#1890ff" }} />
            <Text
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: signedCount === totalSigners ? "#52c41a" : "#1890ff",
              }}
            >
              {signedCount}/{totalSigners} Selesai
            </Text>
          </Space>
        </Descriptions.Item>

        {document?.description && (
          <Descriptions.Item label="Deskripsi" span={3}>
            <Text style={{ fontSize: 12, color: "#595959" }}>
              {document.description}
            </Text>
          </Descriptions.Item>
        )}

        {signatureRequest.notes && (
          <Descriptions.Item label="Catatan" span={3}>
            <Text style={{ fontSize: 12, color: "#595959" }}>
              {signatureRequest.notes}
            </Text>
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );
};

export default DocumentInfoCard;