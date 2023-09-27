import { refCategories } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { Form, Select, Skeleton } from "antd";

const FormSubCategory = ({ name = "sub_category_id", label = "Kategori" }) => {
  const { data, isLoading } = useQuery(
    ["ref-sub-categories"],
    () => refCategories(),
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <Form.Item name={name} label={label}>
      <Select
        showSearch
        optionFilterProp="name"
        placeholder="Select a option and change input text above"
      >
        {data?.map((category) => {
          return (
            <Select.Option
              key={category.id}
              name={category?.name}
              value={category.id}
            >
              <span>{category?.name}</span>
            </Select.Option>
          );
        })}
      </Select>
    </Form.Item>
  );
};

export default FormSubCategory;
