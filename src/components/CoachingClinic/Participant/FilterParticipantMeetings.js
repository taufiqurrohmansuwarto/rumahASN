import QueryFilter from "@/components/QueryFilter";
import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import { DatePicker, Form, Input, Radio, Space } from "antd";
import { useRouter } from "next/router";
import { useEffect } from "react";
import moment from "moment";
import { isArray } from "lodash";

function FilterParticipantMeetings() {
  const router = useRouter();
  const query = router?.query;

  const handleReset = () => {
    router.push({
      pathname: "/coaching-clinic/my-coaching-clinic",
    });
  };

  const [form] = Form.useForm();

  const handleFinish = (values) => {
    // check every property of values if empty
    const emptyQuery = (obj) => {
      return Object.values(obj).every((x) => x === "");
    };

    if (emptyQuery(values)) {
      return handleReset();
    } else {
      // remove empty property
      Object.keys(values).forEach(
        (key) => values[key] === "" && delete values[key]
      );

      // if values has range_date then parse with moment
      if (values?.range_date) {
        values.range_date = values.range_date.map((item) =>
          moment(item).format("YYYY-MM-DD")
        );
      }

      router.push({
        pathname: "/coaching-clinic/my-coaching-clinic",
        query: { ...router?.query, ...values },
      });
    }
  };

  useEffect(() => {
    form.setFieldsValue({
      title: query?.title || "",
      status: query?.status || "",
      range_date: isArray(query?.range_date)
        ? [
            moment(query?.range_date?.[0], "YYYY-MM-DD") || "",
            moment(query?.range_date?.[1], "YYYY-MM-DD") || "",
          ]
        : "",
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
          xxl: 6,
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
        <Form.Item name="title" label="Judul">
          <Input allowClear />
        </Form.Item>
        <Form.Item name="status" label="Status">
          <Radio.Group optionType="button" buttonStyle="solid">
            <Radio.Button value="upcoming">Upcoming</Radio.Button>
            <Radio.Button value="live">Live</Radio.Button>
            <Radio.Button value="end">End</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="range_date" label="Range Tanggal">
          <DatePicker.RangePicker />
        </Form.Item>
      </QueryFilter>
    </div>
  );
}

export default FilterParticipantMeetings;
