import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  message,
  Avatar,
  Card,
  Divider,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getPriorities, subCategories } from "../../services";
import { getAllTickets, updateKategories } from "../../services/admin.services";
import { colorTag, formatDate } from "../../utils";

const EditModal = ({ open, onCancel, data, subCategories, priorities }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { mutate: updateProperties, isLoading } = useMutation(
    (data) => updateKategories(data),
    {
      onSuccess: () => {
        onCancel();
        queryClient.invalidateQueries(["tickets-admins"]);
        message.success("Berhasil memperbarui property tiket");
      },
    }
  );

  const handleFinish = async () => {
    const { priority_code, sub_category_id } = await form.validateFields();
    const currentData = {
      id: data?.id,
      data: {
        sub_category_id,
        priority_code,
      },
    };
    console.log(currentData);
    updateProperties(currentData);
  };

  useEffect(() => {
    form.setFieldsValue({
      sub_category_id: data?.sub_category?.id,
      priority_code: data?.priority_code,
    });
  }, [data, form]);

  return (
    <Modal
      confirmLoading={isLoading}
      onOk={handleFinish}
      destroyOnClose
      title="Set kategori"
      open={open}
      onCancel={onCancel}
      centered
      width={800}
    >
      <Form form={form}>
        <Form.Item
          name="sub_category_id"
          label="Sub kategori"
          rules={[{ required: true, message: "Tidak boleh kosong" }]}
        >
          <Select optionFilterProp="name" showSearch>
            {subCategories?.map((item) => (
              <Select.Option key={item?.id} name={item?.name} value={item.id}>
                {item.name} - {item?.category?.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="priority_code" label="Prioritas">
          <Radio.Group>
            {priorities?.map((item) => (
              <Radio.Button
                key={item?.name}
                name={item?.name}
                value={item.name}
              >
                {item.name}
              </Radio.Button>
            ))}
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

const AdminTickets = ({ status = "all" }) => {
  const [open, setOpen] = useState(false);
  const [row, setRow] = useState(null);

  const { data: subCategory, isLoading: isLoadingSubCategory } = useQuery(
    ["sub-categories"],
    () => subCategories(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: priorityCode, isLoading: isLoadingPriorityCode } = useQuery(
    ["priorities"],
    () => getPriorities(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const handleChangeRow = (row) => {
    setRow(row);
  };

  const handleOpen = () => setOpen(true);
  const handleCancelOpen = () => setOpen(false);

  const columns = [
    {
      title: "Oleh",
      key: "oleh",
      render: (_, record) => (
        <Tooltip title={record?.customer?.username}>
          <Avatar src={record?.customer?.image} />
        </Tooltip>
      ),
    },
    { title: "Judul", key: "title", dataIndex: "title" },
    {
      title: "Nomer Tiket",
      key: "ticket_number",
      render: (_, row) => <Tag color="black">{row?.ticket_number}</Tag>,
    },
    {
      title: "Tgl. dibuat",
      key: "created_at",
      render: (_, record) => {
        return formatDate(record.created_at);
      },
    },
    {
      title: "Tgl. update",
      key: "updated_at",
      render: (_, record) => {
        return formatDate(record.updated_at);
      },
    },
    {
      title: "Status",
      key: "status_code",
      render: (_, record) => {
        return (
          <Tag color={colorTag(record?.status_code)}>{record?.status_code}</Tag>
        );
      },
    },
    {
      title: "Agent",
      key: "agent",
      render: (_, record) => {
        return (
          <>
            {record?.agent ? (
              <Tooltip title={record?.agent?.username}>
                <Avatar shape="square" src={record?.agent?.image} />
              </Tooltip>
            ) : (
              <div>belum ada agent</div>
            )}
          </>
        );
      },
    },
    {
      title: "Prioritas",
      key: "priority_code",
      dataIndex: "priority_code",
    },
    {
      title: "Sub Kategori",
      key: "sub_category",
      render: (_, row) => {
        return (
          <div>
            {row?.sub_category?.name} - {row?.sub_category?.category?.name}
          </div>
        );
      },
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, row) => {
        return (
          <Space>
            <Link href={`/admin/tickets-managements/${row?.id}/detail`}>
              <a>Detail</a>
            </Link>
            <Divider />
            <a
              onClick={() => {
                setOpen(true);
                setRow(row);
              }}
            >
              Set Kategori
            </a>
          </Space>
        );
      },
    },
  ];
  const [query, setQuery] = useState({
    page: 1,
    limit: 50,
    status: status,
  });

  const { data, isLoading } = useQuery(
    ["tickets-admins", query],
    () => getAllTickets(query),
    {
      enabled: !!query,
    }
  );

  const handleSearch = (e) => {
    setQuery({
      ...query,
      page: 1,
      search: e.target.value,
    });
  };

  return (
    <Card title="Daftar Tiket Admin">
      <Table
        title={() => (
          <Input.Search style={{ width: 300 }} onChange={handleSearch} />
        )}
        size="small"
        dataSource={data?.results}
        loading={isLoading}
        rowKey={(row) => row?.id}
        pagination={{
          total: data?.total,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} dari ${total} tiket`,
          current: query.page,
          pageSize: query.limit,
          onChange: (page, limit) => {
            setQuery({
              ...query,
              page,
              limit,
            });
          },
        }}
        columns={columns}
      />
      <EditModal
        subCategories={subCategory}
        priorities={priorityCode}
        open={open}
        onCancel={handleCancelOpen}
        data={row}
      />
    </Card>
  );
};

export default AdminTickets;
