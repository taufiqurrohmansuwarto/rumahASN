import { getOpdAdmin } from "@/services/master.services";
import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Checkbox, Form, Input, Select, Space, TreeSelect } from "antd";
import { useRouter } from "next/router";
import { useEffect } from "react";
import QueryFilter from "../QueryFilter";

function PengadaanFilter() {
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
        tahun: router?.query?.tahun,
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
      <Form.Item name="nip" label="NIP">
        <Input />
      </Form.Item>
      <Form.Item name="nama" label="Nama">
        <Input />
      </Form.Item>
      <Form.Item name="no_peserta" label="Nomor Peserta">
        <Input />
      </Form.Item>
      <Form.Item name="jenis_formasi_nama" label="Jenis Formasi">
        <Select showSearch>
          <Select.Option value="PPPK TEKNIS KHUSUS">
            PPPK TEKNIS KHUSUS
          </Select.Option>
          <Select.Option value="PPPK TENAGA KESEHATAN KHUSUS">
            PPPK TENAGA KESEHATAN KHUSUS
          </Select.Option>
          <Select.Option value="STTD">STTD</Select.Option>
          <Select.Option value="PPPK TENAGA KESEHATAN">
            PPPK TENAGA KESEHATAN
          </Select.Option>
          <Select.Option value="STAN">STAN</Select.Option>
          <Select.Option value="PPPK TEKNIS">PPPK TEKNIS</Select.Option>
          <Select.Option value="PPPK GURU">PPPK GURU</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item
        valuePropName="checked"
        name="belum_cetak_sk"
        label="Belum Cetak SK"
      >
        <Checkbox />
      </Form.Item>
    </QueryFilter>
  );
}

export default PengadaanFilter;
