import { getAllScheduleVisits } from "@/services/guests-books.services";
import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import { Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  Space,
  Avatar,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Table,
  Tag,
  Tooltip,
  Descriptions,
} from "antd";
import dayjs from "dayjs";
import { toUpper } from "lodash";
import { useState } from "react";
import QueryFilter from "../QueryFilter";

function GuestBookVisitAll() {
  const [query, setQuery] = useState({});
  const [form] = Form.useForm();

  const { data, isLoading, isFetching } = useQuery(
    ["guest-book-all-visited", query],
    () => getAllScheduleVisits(query),
    {
      enabled: !!query,
      keepPreviousData: true,
    }
  );

  const onFinish = (value) => {
    setQuery({
      ...query,
      ...value,
      range: value?.range?.map((date) => dayjs(date).format("YYYY-MM-DD")),
      page: 1,
      limit: 10,
    });
  };

  const onReset = () => {
    setQuery({
      page: 1,
      limit: 10,
    });
    form.resetFields();
  };

  const columns = [
    {
      title: "Data",
      key: "data",
      render: (_, row) => (
        <Descriptions size="small" layout="vertical">
          <Descriptions.Item label="Nama">
            <Text>{row?.guest?.name}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Tipe">
            <Text>{toUpper(row?.guest?.visitor_type)}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Asal Instansi">
            <Text>{row?.guest?.institution}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Tgl. Rencana Kunjungan">
            <Text>{dayjs(row?.visit_date).format("DD MMM YYYY HH:mm")}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Pegawai yang dikunjungi">
            <Avatar.Group>
              {row?.employee_visited?.map((employee) => (
                <Tooltip key={employee?.id} title={employee?.name}>
                  <Avatar src={employee?.avatar} />
                </Tooltip>
              ))}
            </Avatar.Group>
          </Descriptions.Item>
          <Descriptions.Item label="Kategori">
            <Tag color="yellow">
              <Text>{toUpper(row?.category)}</Text>
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Keterangan">
            <Text>{row?.description}</Text>
          </Descriptions.Item>
        </Descriptions>
      ),
      responsive: ["xs"],
    },
    {
      title: "Nama",
      key: "name",
      render: (_, row) => <Text>{row?.guest?.name}</Text>,
      responsive: ["sm"],
    },
    {
      title: "Tipe",
      key: "visitor_type",
      render: (_, row) => <Text>{toUpper(row?.guest?.visitor_type)}</Text>,
      responsive: ["sm"],
    },
    {
      title: "Asal Instansi",
      key: "institution",
      render: (_, row) => <Text>{row?.guest?.institution}</Text>,
      responsive: ["sm"],
    },
    {
      title: "Tgl. Rencana Kunjungan",
      key: "visit_date",
      render: (_, row) => (
        <Text>{dayjs(row?.visit_date).format("DD MMM YYYY HH:mm")}</Text>
      ),
      responsive: ["sm"],
    },
    {
      title: "Pegawai yang dikunjungi",
      key: "employee_visited",
      render: (_, row) => {
        return (
          <>
            <Avatar.Group>
              {row?.employee_visited?.map((employee) => (
                <Tooltip key={employee?.id} title={employee?.name}>
                  <Avatar src={employee?.avatar} />
                </Tooltip>
              ))}
            </Avatar.Group>
          </>
        );
      },
      responsive: ["sm"],
    },
    {
      title: "Kategori",
      key: "category",
      render: (_, row) => (
        <Tag color="yellow">
          <Text>{toUpper(row?.category)}</Text>
        </Tag>
      ),
      responsive: ["sm"],
    },

    {
      title: "Keterangan",
      dataIndex: "description",
      responsive: ["sm"],
    },

    {
      title: "Dibuat Tanggal",
      key: "created_at",
      render: (_, row) => (
        <Text>{dayjs(row?.created_at).format("DD MMM YYYY HH:mm")}</Text>
      ),
      responsive: ["sm"],
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      <Col md={24} xs={24}>
        <Card>
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
            onReset={onReset}
            onFinish={onFinish}
            submitter={{
              searchConfig: {
                resetText: "Reset",
                submitText: "Cari",
              },
            }}
          >
            <Form.Item name="name" label="Nama">
              <Input />
            </Form.Item>
            <Form.Item name="range" label="Tanggal">
              <DatePicker.RangePicker />
            </Form.Item>
          </QueryFilter>
        </Card>
      </Col>
      <Col md={24} xs={24}>
        <Card>
          <Table
            size="small"
            columns={columns}
            rowKey={(row) => row?.id}
            dataSource={data?.data}
            loading={isLoading || isFetching}
            pagination={{
              total: data?.total,
              pageSize: data?.limit || 10,
              onChange: (page, pageSize) => {
                setQuery({
                  ...query,
                  page,
                  limit: pageSize || 10,
                });
              },
              current: data?.page,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
          />
        </Card>
      </Col>
    </Row>
  );
}

export default GuestBookVisitAll;
