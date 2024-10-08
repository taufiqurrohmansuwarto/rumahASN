import QueryFilter from "@/components/QueryFilter";
import { refAgents, refCategories } from "@/services/index";
import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Checkbox, Form, Input, Radio, Rate, Select, Space } from "antd";
import { useRouter } from "next/router";
import { useEffect } from "react";

function AllTaskFilter() {
  const router = useRouter();
  const query = router?.query;

  const { data, isLoading } = useQuery(
    ["ref-sub-categories"],
    () => refCategories(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: agents, isLoading: isLoadingAgents } = useQuery(
    ["refs-agents"],
    () => refAgents(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const handleReset = () => {
    router.push({
      pathname: "/beranda-bkd",
      query: { tab: "all-task" },
    });
  };

  const [form] = Form.useForm();

  const handleFinish = (values) => {
    // check every property of values if empty
    const emptyQuery = (obj) => {
      return Object.values(obj).every((x) => x === "");
    };

    if (emptyQuery(values)) {
      return;
    } else {
      // remove empty property
      Object.keys(values).forEach(
        (key) => values[key] === "" && delete values[key]
      );

      router.push({
        pathname: "/beranda-bkd",
        query: { ...router?.query, ...values },
      });
    }
  };

  useEffect(() => {
    form.setFieldsValue({
      search: query?.search || "",
      status: query?.status || "",
      star: query?.star || "",
      sub_category_id: parseInt(query?.sub_category_id) || "",
      group: query?.group || "",
      assignee: query?.assignee || "",
    });
  }, [form, query]);

  return (
    <div>
      <QueryFilter
        span={{
          sm: 24,
          md: 24,
          xl: 24,
          lg: 24,
          xxl: 8,
          xs: 24,
        }}
        layout="vertical"
        form={form}
        collapseRender={(collapsed) =>
          collapsed ? (
            <Space>
              <span>More</span>
              <CaretDownOutlined />
            </Space>
          ) : (
            <Space>
              <span>Collapse</span>
              <CaretUpOutlined />
            </Space>
          )
        }
        onReset={handleReset}
        onFinish={handleFinish}
        submitter={{
          searchConfig: {
            resetText: "Reset",
            submitText: "Cari",
          },
        }}
      >
        <Form.Item name="search" label="Judul">
          <Input />
        </Form.Item>
        <Form.Item name="status" label="Status">
          <Radio.Group optionType="button" buttonStyle="solid">
            <Radio.Button value="DIAJUKAN">Diajukan</Radio.Button>
            <Radio.Button value="DIKERJAKAN">Dikerjakan</Radio.Button>
            <Radio.Button value="SELESAI">Selesai</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="star" label="Bintang">
          <Rate />
        </Form.Item>
        <Form.Item name="sub_category_id" label="Sub Kategori">
          {data && (
            <Select showSearch optionFilterProp="name">
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
          )}
        </Form.Item>
        <Form.Item name="group" label="Asal">
          <Radio.Group optionType="button" buttonStyle="solid">
            <Radio.Button value="MASTER">SIMASTER</Radio.Button>
            <Radio.Button value="GOOGLE">GOOGLE</Radio.Button>
            <Radio.Button value="PTTPK">PTTPK</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="assignee" label="Penerima Tugas">
          <Select showSearch optionFilterProp="name">
            {agents?.map((agent) => (
              <Select.Option
                key={agent.custom_id}
                name={agent?.username}
                value={agent.custom_id}
              >
                {agent.username}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="uncategorized"
          label="Belum Dikategorisasikan"
          valuePropName="checked"
        >
          <Checkbox />
        </Form.Item>
      </QueryFilter>
    </div>
  );
}

export default AllTaskFilter;
