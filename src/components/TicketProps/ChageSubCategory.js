import {
  SettingOutlined,
  TagOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useState, useMemo } from "react";
import {
  Modal,
  Form,
  Select,
  Radio,
  message,
  Button,
  Typography,
  Grid,
  Space,
  Card,
} from "antd";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  refCategories,
  refPriorities,
  changePrioritySubcategory,
} from "@/services/index";

const { useBreakpoint } = Grid;
const { Text, Title } = Typography;

const SubCategoryModal = ({
  open,
  onCancel,
  categories,
  priorities,
  ticketId,
  priorityCode,
  subCategoryId,
}) => {
  const [form] = Form.useForm();
  const screens = useBreakpoint();
  const queryClient = useQueryClient();

  // Memoize responsive config
  const responsiveConfig = useMemo(() => {
    const isMobile = !screens.md;

    return {
      isMobile,
      modalWidth: isMobile ? "95%" : 600,
    };
  }, [screens.md]);

  const { mutate: updateCategory, isLoading } = useMutation(
    (data) => changePrioritySubcategory(data),
    {
      onSuccess: () => {
        message.success("✅ Berhasil mengubah kategori dan prioritas");
        queryClient.invalidateQueries(["publish-ticket", ticketId]);
        onCancel();
      },
      onError: () => {
        message.error("❌ Gagal mengubah kategori dan prioritas");
        onCancel();
      },
    }
  );

  const handleSubmit = async () => {
    try {
      const { sub_category_id, priority_code } = await form.validateFields();
      const data = {
        id: ticketId,
        data: {
          sub_category_id,
          priority_code,
        },
      };
      if (!isLoading) {
        updateCategory(data);
      }
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TagOutlined style={{ color: "#1890ff" }} />
          <span>🏷️ Ubah Kategori & Prioritas</span>
        </div>
      }
      centered
      width={responsiveConfig.modalWidth}
      destroyOnClose
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={isLoading}
      okText="✅ Simpan Perubahan"
      cancelText="❌ Batal"
      okButtonProps={{
        style: {
          background: "#52c41a",
          borderColor: "#52c41a",
          fontWeight: 600,
        },
      }}
      cancelButtonProps={{
        style: {
          fontWeight: 600,
        },
      }}
    >
      <div style={{ padding: "16px 0" }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            sub_category_id: subCategoryId,
            priority_code: priorityCode,
          }}
        >
          {/* Kategori Section */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <TagOutlined style={{ color: "#1890ff" }} />
                <Text strong style={{ color: "#1890ff" }}>
                  📂 Pilih Kategori
                </Text>
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Pilih kategori yang sesuai dengan jenis permasalahan
              </Text>
              <Form.Item
                name="sub_category_id"
                rules={[{ required: true, message: "Silakan pilih kategori" }]}
                style={{ marginBottom: 0 }}
              >
                <Select
                  showSearch
                  optionFilterProp="name"
                  placeholder="🔍 Cari dan pilih kategori..."
                  size="large"
                  style={{ borderRadius: 8 }}
                  dropdownStyle={{
                    borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  {categories?.map((category) => (
                    <Select.Option
                      key={category.id}
                      name={category?.name}
                      value={category.id}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontWeight: 500 }}>
                          {category?.name}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <ClockCircleOutlined
                            style={{ fontSize: 12, color: "#8c8c8c" }}
                          />
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {category?.durasi === null ? 0 : category?.durasi}{" "}
                            menit
                          </Text>
                        </div>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Space>
          </Card>

          {/* Prioritas Section */}
          <Card size="small">
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>⚡</span>
                <Text strong style={{ color: "#fa8c16" }}>
                  🚨 Tingkat Prioritas
                </Text>
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Tentukan tingkat urgensi penanganan ticket ini
              </Text>
              <Form.Item
                name="priority_code"
                rules={[{ required: true, message: "Silakan pilih prioritas" }]}
                style={{ marginBottom: 0 }}
              >
                <Radio.Group style={{ width: "100%" }} buttonStyle="solid">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: responsiveConfig.isMobile
                        ? "1fr"
                        : "repeat(auto-fit, minmax(120px, 1fr))",
                      gap: 8,
                      width: "100%",
                    }}
                  >
                    {priorities?.map((priority) => (
                      <Radio.Button
                        key={priority.name}
                        value={priority.name}
                        style={{
                          textAlign: "center",
                          fontWeight: 500,
                          borderRadius: 6,
                          height: 40,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {priority.name}
                      </Radio.Button>
                    ))}
                  </div>
                </Radio.Group>
              </Form.Item>
            </Space>
          </Card>
        </Form>
      </div>
    </Modal>
  );
};

function ChangeSubCategory({ ticketId, subCategoryId, priorityCode }) {
  const screens = useBreakpoint();

  const { data, isLoading } = useQuery(
    ["ref-sub-categories"],
    () => refCategories(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: priorities, isLoading: isPriorityLoading } = useQuery(
    ["ref-priorities"],
    () => refPriorities(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const [open, setOpen] = useState(false);

  // Memoize responsive config
  const responsiveConfig = useMemo(() => {
    const isMobile = !screens.md;

    return {
      isMobile,
    };
  }, [screens.md]);

  const handleShowModal = () => {
    if (isLoading || isPriorityLoading) return;
    setOpen(true);
  };

  const handleCancelModal = () => setOpen(false);

  return (
    <div>
      <Button
        type="text"
        icon={<SettingOutlined />}
        onClick={handleShowModal}
        loading={isLoading || isPriorityLoading}
        size="small"
        style={{
          color: "#1890ff",
          border: "1px solid #d9f7be",
          background: "#f6ffed",
          borderRadius: 6,
          fontWeight: 500,
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#1890ff";
          e.currentTarget.style.color = "white";
          e.currentTarget.style.borderColor = "#1890ff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#f6ffed";
          e.currentTarget.style.color = "#1890ff";
          e.currentTarget.style.borderColor = "#d9f7be";
        }}
      >
        {responsiveConfig.isMobile ? "" : "Ubah"}
      </Button>
      <SubCategoryModal
        categories={data}
        priorities={priorities}
        subCategoryId={subCategoryId}
        priorityCode={priorityCode}
        ticketId={ticketId}
        open={open}
        onCancel={handleCancelModal}
      />
    </div>
  );
}

export default ChangeSubCategory;
