import {
  createScheduleVisit,
  deleteScheduleVisit,
  getEmployeesBKD,
  getScheduleVisits,
  updateScheduleVisit,
} from "@/services/guests-books.services";
import {
  EditOutlined,
  PlusOutlined,
  QrcodeOutlined,
  DeleteOutlined,
  CaretDownOutlined,
  CaretUpOutlined,
} from "@ant-design/icons";
import { Text } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { toUpper } from "lodash";
import { useEffect, useState } from "react";
import QueryFilter from "../QueryFilter";
import { QRCodeCanvas } from "qrcode.react";
import "dayjs/locale/id";

dayjs.locale("id");

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

const FormEmployees = ({ name, data }) => {
  return (
    <div>
      {data && (
        <Form.Item
          rules={[{ required: true, message: "Pilih Pegawai yang dikunjungi" }]}
          name={name}
          label="Pegawai yang dikunjungi"
        >
          <Select
            mode="multiple"
            labelInValue
            showSearch
            allowClear
            optionFilterProp="name"
          >
            {data?.map((item) => (
              <Select.Option name={item?.name} key={item?.id} value={item?.id}>
                <Space>
                  <Avatar size="small" src={item?.avatar} />
                  <Typography.Text>{item?.name}</Typography.Text>
                </Space>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      )}
    </div>
  );
};

const kategoriKunjungan = [
  "konsultasi",
  "layanan",
  "lainnya",
  "koordinasi",
  "kunjungan",
  "penawaran",
  "peminjaman aset",
];

const FormModalCreate = ({
  open,
  onCancel,
  submit,
  loading,
  action = "create",
  data,
  edit,
  editLoading,
}) => {
  const [form] = Form.useForm();

  const { data: dataEmployees, isLoading: isLoadingEmployees } = useQuery(
    ["pegawai_bkd"],
    () => getEmployeesBKD(),
    {
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (action === "edit" && data) {
      form.setFieldsValue({
        visit_date: data.visit_date ? dayjs(data.visit_date) : null,
        category: data.category || null,
        purpose: data.purpose || "",
        employee_visited: data.employee_visited?.map((item) => item?.id),
        description: data.description || "",
      });
    } else {
      form.resetFields();
    }
  }, [action, form, data]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const employeeVisited = dataEmployees?.filter((item) => {
      const val = values?.employee_visited?.map((v) => v?.value);
      return val.includes(item?.id);
    });

    const payload = {
      ...values,
      employee_visited: JSON.stringify(employeeVisited),
      visit_date: dayjs(values?.visit_date).format("YYYY-MM-DD HH:mm:ss"),
    };

    if (action === "edit") {
      const employeeVisitedEdit = dataEmployees?.filter((item) => {
        const val = form.getFieldValue("employee_visited");

        // if every val has property label
        if (val.every((v) => v.label)) {
          const currentValue = val.map((v) => v.value);
          return currentValue.includes(item?.id);
        } else {
          return val.includes(item?.id);
        }
      });

      const dataEdit = {
        id: data?.id,
        data: {
          ...payload,
          employee_visited: JSON.stringify(employeeVisitedEdit),
        },
      };

      edit(dataEdit);
    } else {
      submit(payload);
    }
  };

  return (
    <Modal
      width={800}
      confirmLoading={loading || editLoading}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      title="Tambah Jadwal Kunjungan"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          rules={[{ required: true, message: "Pilih Tanggal Kunjungan" }]}
          name="visit_date"
          label="Tanggal Rencana Kunjungan"
        >
          <DatePicker showTime />
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: "Pilih Kategori Kunjungan" }]}
          name="category"
          label="Kategori"
        >
          <Select showSearch allowClear optionFilterProp="name">
            {kategoriKunjungan.map((item) => (
              <Select.Option name={item} key={item} value={item}>
                {toUpper(item)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <FormEmployees
          name="employee_visited"
          data={dataEmployees}
          isLoading={isLoadingEmployees}
        />
        <Form.Item
          rules={[{ required: true, message: "Masukkan Alasan Kunjungan" }]}
          name="purpose"
          label="Alasan Kunjungan"
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item name="description" label="Keterangan">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const DetailModal = ({ open, onCancel, data }) => {
  const columns = [
    {
      title: "Status",
      dataIndex: "status",
      render: (value) => {
        if (value === "checkin") {
          return <Tag color="green">Check In</Tag>;
        }
      },
    },
  ];
  return (
    <Modal
      width={800}
      open={open}
      onCancel={onCancel}
      title="Detail Jadwal Kunjungan"
      footer={null}
    >
      <Card bordered={false}>
        <Row justify="center" align="middle">
          <Col>
            <h3 style={{ textAlign: "center", color: "#1890ff" }}>
              Kode QR Kunjungan
            </h3>
            <Space
              direction="vertical"
              align="center"
              style={{ marginTop: "10px" }}
            >
              <QRCodeCanvas
                level="H"
                size={300}
                value={data?.qrCode?.qr_code}
              />
            </Space>
          </Col>
        </Row>
      </Card>
    </Modal>
  );
};

function GuestBookScheduleVisit({ edit }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const [showDetail, setShowDetail] = useState(false);
  const [dataDetail, setDataDetail] = useState(null);
  const [action, setAction] = useState("create");
  const [dataEdit, setDataEdit] = useState(null);

  const handleOpenEdit = (data) => {
    setAction("edit");
    setDataEdit(data);
    setOpen(true);
  };

  const handleOpenDetail = (data) => {
    setDataDetail(data);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setDataDetail(null);
    setShowDetail(false);
    setAction("create");
    setDataEdit(null);
  };

  const handleOpen = () => {
    setAction("create");
    setOpen(true);
    setDataEdit(null);
  };

  const handleClose = () => {
    setAction("create");
    setDataEdit(null);
    setOpen(false);
  };

  const { mutate: create, isLoading: isLoadingCreate } = useMutation(
    (data) => createScheduleVisit(data),
    {
      onSettled: () => {
        queryClient.invalidateQueries(["guest-book-schedule-visits"]);
      },
      onSuccess: () => {
        message.success("Berhasil menambahkan jadwal kunjungan");
        handleClose();
      },
      onError: (error) => {
        message.error("Gagal menambahkan jadwal kunjungan");
        console.log(error);
      },
    }
  );

  const { mutate: editSchedule, isLoading: isLoadingUpdate } = useMutation(
    (data) => updateScheduleVisit(data),
    {
      onSettled: () => {
        queryClient.invalidateQueries(["guest-book-schedule-visits"]);
      },
      onSuccess: () => {
        message.success("Berhasil mengubah jadwal kunjungan");
        handleClose();
      },
      onError: (error) => {
        message.error("Gagal mengubah jadwal kunjungan");
        console.log(error);
      },
    }
  );

  const { mutateAsync: deleteSchedule, isLoading: isLoadingDelete } =
    useMutation((data) => deleteScheduleVisit(data), {
      onSettled: () => {
        queryClient.invalidateQueries(["guest-book-schedule-visits"]);
      },
      onSuccess: () => {
        message.success("Berhasil menghapus jadwal kunjungan");
        handleClose();
      },
      onError: (error) => {
        message.error("Gagal menghapus jadwal kunjungan");
        console.log(error);
      },
    });

  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
  });
  const { data, isLoading, isFetching } = useQuery(
    ["guest-book-schedule-visits", query],
    () => getScheduleVisits(query),
    {
      refetchOnWindowFocus: false,
      enabled: !!query,
      keepPreviousData: true,
    }
  );

  const handleDelete = async (id) => {
    await deleteSchedule(id);
  };

  const columns = [
    {
      title: "Kunjungan",
      key: "kunjungan",
      render: (_, row) => (
        <>
          <Descriptions layout="vertical" size="small">
            <Descriptions.Item label="Rencana Tanggal Kunjungan">
              {dayjs(row?.visit_date).format("DD MMMM YYYY HH:mm:ss")}
            </Descriptions.Item>
            <Descriptions.Item label="Kategori">
              {toUpper(row?.category)}
            </Descriptions.Item>
            <Descriptions.Item label="Pegawai yang dikunjungi">
              <Space direction="vertical">
                {row?.employee_visited?.map((item) => (
                  <Tag color="geekblue" key={item?.id}>
                    <Space>
                      <Avatar size="small" src={item?.avatar} />
                      <Text color="black">{item?.name}</Text>
                    </Space>
                  </Tag>
                ))}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Alasan Kunjungan">
              {row?.purpose}
            </Descriptions.Item>
            <Descriptions.Item label="Keterangan">
              {row?.description}
            </Descriptions.Item>
            <Descriptions.Item label="Dibuat pada">
              {dayjs(row?.created_at).format("DD MMMM YYYY HH:mm:ss")}
            </Descriptions.Item>
          </Descriptions>
          <Space style={{ marginTop: 10 }}>
            <a onClick={() => handleOpenDetail(row)}>QR Code</a>
            <Divider type="vertical" />
            <a onClick={() => handleOpenEdit(row)}>Edit</a>
            <Divider type="vertical" />
            <Popconfirm
              title="Apakah anda yakin ingin menghapus jadwal kunjungan ini?"
              onConfirm={() => handleDelete(row?.id)}
              okText="Hapus"
              cancelText="Batal"
            >
              <a>Hapus</a>
            </Popconfirm>
          </Space>
        </>
      ),
      responsive: ["xs"],
    },
    {
      title: "Rencana Tanggal Kunjungan",
      dataIndex: "visit_date",
      render: (value) => dayjs(value).format("DD MMMM YYYY HH:mm:ss"),
      responsive: ["sm"],
    },
    {
      title: "Kategori",
      dataIndex: "category",
      render: (value) => toUpper(value),
      responsive: ["sm"],
    },
    {
      title: "Pegawai yang dikunjungi",
      dataIndex: "employee_visited",
      render: (value) => (
        <Avatar.Group>
          {value?.map((v) => (
            <Tooltip key={v?.id} title={v?.name}>
              <Avatar size="large" src={v?.avatar} />
            </Tooltip>
          ))}
        </Avatar.Group>
      ),
      responsive: ["sm"],
    },
    {
      title: "Alasan Kunjungan",
      dataIndex: "purpose",
      responsive: ["sm"],
    },
    {
      title: "Keterangan",
      dataIndex: "description",
      responsive: ["sm"],
    },
    {
      title: "Dibuat pada",
      dataIndex: "created_at",
      render: (value) => dayjs(value).format("DD MMMM YYYY HH:mm:ss"),
      responsive: ["sm"],
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, row) => (
        <Space>
          <a onClick={() => handleOpenDetail(row)}>
            <QrcodeOutlined />
          </a>
          <Divider type="vertical" />
          <a onClick={() => handleOpenEdit(row)}>
            <EditOutlined />
          </a>
          <Divider type="vertical" />
          <Popconfirm
            title="Apakah anda yakin ingin menghapus jadwal kunjungan ini?"
            onConfirm={() => handleDelete(row?.id)}
            okText="Hapus"
            cancelText="Batal"
          >
            <a>
              <DeleteOutlined />
            </a>
          </Popconfirm>
        </Space>
      ),
      responsive: ["sm"],
    },
  ];

  const [form] = Form.useForm();

  const onReset = () => {
    form.resetFields();
    setQuery({
      page: 1,
      limit: 10,
    });
  };

  const onSubmit = (values) => {
    setQuery({
      ...values,
      page: 1,
      limit: 10,
    });
  };

  return (
    <Row gutter={[16, 16]}>
      <DetailModal
        data={dataDetail}
        open={showDetail}
        onCancel={handleCloseDetail}
      />
      <FormModalCreate
        open={open}
        onCancel={handleClose}
        submit={create}
        loading={isLoadingCreate}
        action={action}
        data={dataEdit}
        edit={editSchedule}
        editLoading={isLoadingUpdate}
      />
      <Col md={24} xs={24}>
        <Card>
          <Filter onFinish={onSubmit} onReset={onReset} form={form} />
        </Card>
      </Col>
      <Col md={24} xs={24}>
        <Card extra={<a onClick={edit}>Edit Profile</a>}>
          <Button
            style={{
              marginBottom: 16,
            }}
            icon={<PlusOutlined />}
            type="primary"
            onClick={handleOpen}
          >
            Kunjungan
          </Button>

          <Table
            expandable={{
              expandedRowRender: (record) => (
                <Table
                  columns={[
                    {
                      title: "Status",
                      dataIndex: "status",
                      render: (value) => {
                        if (value === "check-in") {
                          return <Tag color="green">CHECK IN</Tag>;
                        }
                        if (value === "check-out") {
                          return <Tag color="red">CHECK OUT</Tag>;
                        }
                      },
                    },
                    {
                      title: "Waktu",
                      key: "waktu",
                      render: (_, row) => {
                        if (row?.status === "check-in") {
                          return dayjs(row?.checkin_date).format(
                            "DD MMMM YYYY HH:mm:ss"
                          );
                        }
                        if (row?.status === "check-out") {
                          return dayjs(row?.checkout_date).format(
                            "DD MMMM YYYY HH:mm:ss"
                          );
                        }
                      },
                    },
                  ]}
                  dataSource={record?.visits}
                  rowKey={(row) => row?.id}
                />
              ),
              rowExpandable: (record) => record.name !== "Not Expandable",
            }}
            loading={isLoading || isFetching}
            columns={columns}
            dataSource={data?.data}
            rowKey={(row) => row?.id}
            pagination={{
              total: data?.total,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
              onChange: (page, pageSize) => {
                setQuery({
                  ...query,
                  page,
                  limit: pageSize,
                });
              },
              pageSize: data?.limit,
              current: data?.page,
            }}
          />
        </Card>
      </Col>
    </Row>
  );
}

export default GuestBookScheduleVisit;
