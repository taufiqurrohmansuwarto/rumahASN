import { deleteSavedReplies, getSavedReplies } from "@/services/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  List,
  message,
  Typography,
  theme,
  Empty,
  Modal,
  Button,
  Row,
  Col,
} from "antd";
import {
  MessageOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { truncate } from "lodash";
import { useRouter } from "next/router";
import CreateSavedReplies from "./CreateSavedReplies";

const { Title, Text } = Typography;
const { useToken } = theme;

function ListSavedReplies() {
  const { token } = useToken();
  const queryClient = useQueryClient();
  const router = useRouter();

  const gotoEdit = (id) => {
    router.push(`/settings/profile/saved-replies/${id}/edit`);
  };

  const { mutate: remove, isLoading: isLoadingRemove } = useMutation(
    (data) => deleteSavedReplies(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("saved-replies");
        message.success("Template berhasil dihapus");
      },
      onError: () => {
        message.error("Gagal menghapus template");
      },
    }
  );

  const handleRemove = (id, name) => {
    Modal.confirm({
      title: "Hapus Template",
      icon: <ExclamationCircleOutlined />,
      content: `Hapus template "${name}"?`,
      okText: "Hapus",
      okType: "danger",
      cancelText: "Batal",
      centered: true,
      onOk() {
        if (!isLoadingRemove) {
          remove(id);
        }
      },
    });
  };

  const { data, isLoading } = useQuery(
    ["saved-replies"],
    () => getSavedReplies(),
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <Row gutter={[24, 24]}>
      <Col span={24}>
        {(!data || data?.length === 0) && !isLoading ? (
          <div
            style={{
              padding: "64px 32px",
              textAlign: "center",
            }}
          >
            <Empty
              description={
                <Text style={{ color: "#6B7280", fontSize: "16px" }}>
                  Belum ada template balasan
                </Text>
              }
            />
          </div>
        ) : (
          <List
            dataSource={data}
            size="small"
            rowKey={(row) => row?.id}
            loading={isLoading}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: "16px",
                  borderRadius: "8px",
                  marginBottom: "8px",
                  backgroundColor: "white",
                  transition: "all 0.2s ease",
                }}
              >
                <List.Item.Meta
                  avatar={
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "8px",
                        backgroundColor: "#FEF2F2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #FECACA",
                      }}
                    >
                      <MessageOutlined
                        style={{
                          color: "#EF4444",
                          fontSize: "16px",
                        }}
                      />
                    </div>
                  }
                  title={
                    <Text
                      strong
                      style={{
                        color: "#1F2937",
                        fontSize: "14px",
                        lineHeight: "1.4",
                      }}
                    >
                      {item?.name}
                    </Text>
                  }
                  description={
                    <Text
                      type="secondary"
                      style={{
                        fontSize: "12px",
                        lineHeight: "1.4",
                      }}
                    >
                      {truncate(item?.content, { length: 80 })}
                    </Text>
                  }
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Button
                    type="primary"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => gotoEdit(item?.id)}
                    style={{
                      borderRadius: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    loading={isLoadingRemove}
                    onClick={() => handleRemove(item?.id, item?.name)}
                    style={{
                      borderRadius: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Hapus
                  </Button>
                </div>
              </List.Item>
            )}
          />
        )}
      </Col>
      <Col span={24}>
        <CreateSavedReplies />
      </Col>
    </Row>
  );
}

export default ListSavedReplies;
