import { daftarKenaikanPangkat } from "@/services/siasn-services";
import { FilePdfOutlined, FilePdfTwoTone } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Card, DatePicker, Form, Select, Space, Table, Tooltip } from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import React, { useState } from "react";

const format = "DD-MM-YYYY";

const periodeKenaikanPangkat = [
  { label: "Februari", value: "01-02" },
  { label: "April", value: "01-04" },
  { label: "Juni", value: "01-06" },
  { label: "Agustus", value: "01-08" },
  { label: "Oktober", value: "01-10" },
  { label: "Desember", value: "01-12" },
];

function DaftarKenaikanPangkat() {
  const router = useRouter();
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    periode:
      router.query.periode ||
      `01-${dayjs().format("MM")}-${dayjs().format("YYYY")}`,
  });

  const gotoDetail = (row) => {
    router.push(`/apps-managements/integrasi/siasn/${row.nipBaru}`);
  };

  const columns = [
    {
      title: "File",
      key: "path",
      render: (_, record) => {
        return (
          <Space>
            <div>
              {record?.path_ttd_sk && (
                <Tooltip title="File SK">
                  <a
                    href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path_ttd_sk}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FilePdfTwoTone color="gray" />
                  </a>
                </Tooltip>
              )}
            </div>
            <div>
              {record?.path_ttd_pertek && (
                <Tooltip title="File Pertek">
                  <a
                    href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path_ttd_pertek}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FilePdfTwoTone color="gray" />
                  </a>
                </Tooltip>
              )}
            </div>
          </Space>
        );
      },
      responsive: ["sm"],
    },
    { title: "NIP", dataIndex: "nipBaru" },
    { title: "Nama", dataIndex: "nama" },
    { title: "No. Pertek", dataIndex: "no_pertek" },
    { title: "No. SK", dataIndex: "no_sk" },
    { title: "TMT KP", dataIndex: "tmtKp" },
    { title: "Jenis KP", dataIndex: "jenis_kp" },
    { title: "Status", dataIndex: "statusUsulanNama" },
    {
      title: "Aksi",
      key: "aksi",
      render: (row) => <a onClick={() => gotoDetail(row)}>Detail</a>,
    },
  ];

  const handleChangePeriode = (value) => {
    setQuery({
      ...query,
      periode: value.format(format),
    });
    router.push({
      pathname: "/apps-managements/siasn-services/kenaikan-pangkat",
      query: { periode: value.format(format) },
    });
  };

  const { data, isLoading, isFetching } = useQuery(
    ["kenaikan-pangkat", router?.query],
    () => daftarKenaikanPangkat(router?.query),
    {
      enabled: !!router?.query,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  return (
    <Card>
      <Form.Item label="Periode">
        {/* <Select showSearch optionFilterProp="name" allowClear>
          {periodeKenaikanPangkat.map((item) => (
            <Select.Option
              name={item?.label}
              key={item.value}
              value={item.value}
            >
              {item.label}
            </Select.Option>
          ))}
        </Select> */}
        <DatePicker
          picker="month"
          format={format}
          onChange={handleChangePeriode}
          value={dayjs(query.periode, format)}
        />
      </Form.Item>
      <Table
        size="middle"
        pagination={{
          position: ["bottomRight", "topRight"],
          total: data?.length,
          showTotal: (total) => `Total ${total} data`,
          showSizeChanger: false,
          pageSize: 25,
        }}
        columns={columns}
        rowKey={(row) => row?.id}
        dataSource={data}
        loading={isLoading || isFetching}
      />
    </Card>
  );
}

export default DaftarKenaikanPangkat;
