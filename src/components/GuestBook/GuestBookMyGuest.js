import { getMyGuest } from "@/services/guests-books.services";
import { SyncOutlined } from "@ant-design/icons";
import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import { Stack, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Flex,
  Form,
  Row,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import QueryFilter from "../QueryFilter";

const Filter = ({ onFinish, onReset, form }) => {
  return (
    <QueryFilter
      onFinish={onFinish}
      onReset={onReset}
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
      submitter={{
        searchConfig: {
          resetText: "Reset",
          submitText: "Cari",
        },
      }}
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
    >
      <Form.Item name="visit_date" label="Tanggal Kunjungan">
        <DatePicker.RangePicker />
      </Form.Item>
    </QueryFilter>
  );
};

function GuestBookMyGuest() {
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
  });

  const { data, isLoading, refetch, isRefetching } = useQuery(
    ["guest-book-my-guest", query],
    () => getMyGuest(query),
    {
      keepPreviousData: true,
      enabled: !!query,
    }
  );

  const columns = [
    {
      title: "Nama",
      key: "name",
      render: (_, text) => {
        return <Text>{text?.guest?.name}</Text>;
      },
    },
    {
      title: "Tanggal Kunjungan",
      key: "visit_date",
      render: (_, text) => {
        return (
          <Text>{dayjs(text?.visit_date).format("DD MMM YYYY HH:mm:ss")}</Text>
        );
      },
    },
    {
      title: "Alasan Kunjungan",
      key: "reason",
      render: (_, text) => {
        return <Text>{text?.reason}</Text>;
      },
    },
    {
      title: "Status Kunjungan",
      key: "status",
      render: (_, text) => {
        return <Tag color="green">Diterima</Tag>;
      },
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, text) => {
        return <a>Detail</a>;
      },
    },
  ];

  const [form] = Form.useForm();

  const onFinish = (values) => {
    setQuery({
      ...values,
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

  return (
    <Row gutter={[16, 16]}>
      <Col md={24} xs={24}>
        <Card>
          <Filter form={form} onFinish={onFinish} onReset={onReset} />
        </Card>
      </Col>
      <Col md={24} xs={24}>
        <Card>
          <Stack>
            <Flex align="baseline" justify="space-between">
              <Text size={16}>Tabel Tamu</Text>
              <Space>
                <Tooltip title="Segarkan">
                  <Button
                    type="text"
                    icon={<SyncOutlined />}
                    iconPosition="end"
                    onClick={refetch}
                    loading={isRefetching}
                  />
                </Tooltip>
              </Space>
            </Flex>
            <Table
              dataSource={data?.data}
              pagination={{
                total: data?.total,
                pageSize: data?.limit,
                current: data?.page,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`,
              }}
              columns={columns}
              loading={isLoading || isRefetching}
              rowKey={(row) => row.id}
            />
          </Stack>
        </Card>
      </Col>
    </Row>
  );
}

export default GuestBookMyGuest;