import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import { DatePicker, Form, Input, Space } from "antd";
import { useRouter } from "next/router";
import { useEffect } from "react";
import QueryFilter from "../QueryFilter";

function LogSIASNFilter() {
  const router = useRouter();
  const query = router?.query;

  const handleReset = () => {
    router.push({
      pathname: "/logs/siasn",
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
        pathname: "/logs/siasn",
        query: { ...router?.query, ...values },
      });
    }
  };

  useEffect(() => {
    form.setFieldsValue({
      search: query?.search || "",
      status: query?.status || "",
    });
  }, [form, query]);

  return (
    <div>
      <QueryFilter
        span={{
          sm: 24,
          md: 8,
          xl: 8,
          lg: 8,
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
        <Form.Item name="employeeNumber" label="NIP">
          <Input />
        </Form.Item>
        <Form.Item name="bulan" label="Bulan">
          <DatePicker.MonthPicker
            format={{
              format: "YYYY-MM",
              type: "mask",
            }}
          />
        </Form.Item>
        {/* <Form.Item valuePropName="checked" name="mandiri" label="Mandiri">
          <Checkbox />
        </Form.Item> */}
      </QueryFilter>
    </div>
  );
}

export default LogSIASNFilter;
