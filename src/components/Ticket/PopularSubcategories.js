import { getPopularSubCategories } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { Form, Select } from "antd";
import React from "react";

function PopularSubcategories({ value, onChange }) {
  const { data, isLoading } = useQuery(
    ["popular-sub-categories"],
    () => getPopularSubCategories(),
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <Form.Item
      help="Gunakan kategori untuk memudahkan penjawab"
      name="sub_category_id"
      label="Kategori Pertanyaan"
    >
      <Select
        loading={isLoading}
        showSearch
        optionFilterProp="label"
        options={
          data?.map((item) => ({
            label: item.name,
            value: item.id,
          })) || []
        }
        onChange={onChange}
        value={value}
      />
    </Form.Item>
  );
}

export default PopularSubcategories;
