import { getKnowledgeCategories } from "@/services/knowledge-management.services";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Flex, Form, Select, Tooltip, Typography } from "antd";
import { useState } from "react";

const { Option } = Select;
const { Text } = Typography;

const KnowledgeFormCategory = ({ isMobile }) => {
  const [searchValue, setSearchValue] = useState("");

  const { data: categories = [], isLoading: categoriesLoading } = useQuery(
    ["knowledge-categories"],
    () => getKnowledgeCategories(),
    {
      keepPreviousData: true,
    }
  );

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchValue.toLowerCase()))
  );

  return (
    <Form.Item
      name="category_id"
      label={
        <Flex align="center" gap="small">
          <Text
            strong
            style={{ fontSize: isMobile ? "13px" : "14px" }}
          >
            Kategori
          </Text>
          <Tooltip
            title="Pilih kategori yang paling sesuai dengan topik konten Anda. Kategori yang tepat akan memudahkan orang lain menemukan informasi ini saat mereka membutuhkannya."
            placement="top"
          >
            <QuestionCircleOutlined
              style={{
                color: "#FF4500",
                fontSize: "12px",
                cursor: "help",
              }}
            />
          </Tooltip>
        </Flex>
      }
      rules={[
        {
          required: true,
          message: "Kategori harus dipilih!",
        },
      ]}
    >
      <Select
        placeholder="Cari dan pilih kategori..."
        loading={categoriesLoading}
        showSearch
        filterOption={false}
        searchValue={searchValue}
        onSearch={setSearchValue}
        style={{
          borderRadius: "6px",
          fontSize: isMobile ? "13px" : "14px",
        }}
        onFocus={(e) => {
          const selector = e.target.closest(".ant-select");
          if (selector) {
            selector.style.borderColor = "#FF4500";
            selector.style.boxShadow =
              "0 0 0 2px rgba(255, 69, 0, 0.2)";
          }
        }}
        onBlur={(e) => {
          const selector = e.target.closest(".ant-select");
          if (selector) {
            selector.style.borderColor = "#d9d9d9";
            selector.style.boxShadow = "none";
          }
        }}
        optionLabelProp="label"
      >
        {filteredCategories.map((category) => (
          <Option 
            key={category.id} 
            value={category.id}
            label={category.name}
          >
            <div>
              <div style={{ 
                fontWeight: "500", 
                fontSize: isMobile ? "13px" : "14px",
                marginBottom: category.description ? "2px" : "0"
              }}>
                {category.name}
              </div>
              {category.description && (
                <div style={{ 
                  fontSize: isMobile ? "11px" : "12px", 
                  color: "#666",
                  lineHeight: "1.3"
                }}>
                  {category.description}
                </div>
              )}
            </div>
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default KnowledgeFormCategory;