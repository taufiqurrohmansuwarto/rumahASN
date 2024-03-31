import { getOpdAdmin } from "@/services/master.services";
import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Form, Input, Space, TreeSelect } from "antd";
import { useRouter } from "next/router";
import { useEffect } from "react";
import QueryFilter from "../QueryFilter";

function EmployeesTableFilterAdmin() {
  const router = useRouter();
  const [form] = Form.useForm();

  const { data: unor, isLoading: isLoadingUnor } = useQuery(
    ["unor-admin"],
    () => getOpdAdmin(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const handleReset = () => {
    router.push({
      pathname: router?.pathname,
      query: {
        page: 1,
      },
    });
  };

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
        pathname: router?.pathname,
        query: { ...router?.query, ...values, page: 1 },
      });
    }
  };

  useEffect(() => {
    form.setFieldsValue({
      search: router?.query?.search || "",
      opd_id: router?.query?.opd_id || undefined,
    });
  });

  return (
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
      <Form.Item name="search" label="NIP/Nama">
        <Input />
      </Form.Item>
      <Form.Item name="opd_id" label="Perangkat Daerah">
        <TreeSelect treeNodeFilterProp="label" showSearch treeData={unor} />
      </Form.Item>
    </QueryFilter>
  );
}

export default EmployeesTableFilterAdmin;
