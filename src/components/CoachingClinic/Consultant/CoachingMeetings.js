import {
  findMeeting,
  removeMeeting,
  updateMeeting,
} from "@/services/coaching-clinics.services";
import { setColorStatusCoachingClinic } from "@/utils/client-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  message,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { upperCase } from "lodash";
import { nanoid } from "nanoid";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CreateCoaching from "./CreateCoaching";
import FilterConsultantMeetings from "./FilterConsultantMeetings";
import TextSensor from "@/components/TextSensor";

dayjs.locale("id");

const ModalChangeStatus = ({
  open,
  handleClose,
  row,
  handleChangeStatus,
  loadingChangeStatus,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      status: row?.status,
    });
  }, [form, row]);

  const handleSubmit = async () => {
    const result = await form.validateFields();
    handleChangeStatus(row, result?.status);
  };

  return (
    <Modal
      onOk={handleSubmit}
      confirmLoading={loadingChangeStatus}
      title="Ubah Status Coaching Clinic"
      centered
      open={open}
      onCancel={handleClose}
    >
      <Form form={form}>
        <Form.Item name="status" label="Status">
          <Select>
            <Select.Option value="upcoming">Upcoming</Select.Option>
            <Select.Option value="end">End</Select.Option>
            <Select.Option value="live">Live</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

const ModalUpdate = ({ open, handleClose, data, handleUpdate, loading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      title: data?.title,
      is_private: data?.is_private,
      description: data?.description,
      start_date: data?.start_date ? dayjs(data.start_date) : null,
      start_hours: data?.start_hours
        ? dayjs(data.start_hours, "HH:mm:ss")
        : null,
      end_hours: data?.end_hours ? dayjs(data.end_hours, "HH:mm:ss") : null,
      participants_type: data?.participants_type || [],
      code: data?.code || null,
      max_participants: data?.max_participants,
    });
  }, [data, form]);

  const handleSubmit = async () => {
    const result = await form.validateFields();

    const hasil = {
      ...result,
      code: result?.is_private ? result?.code : null,
      start_date: dayjs(result.start_date).format("YYYY-MM-DD"),
      start_hours: dayjs(result.start_hours).format("HH:mm:ss"),
      end_hours: dayjs(result.end_hours).format("HH:mm:ss"),
    };

    const payload = {
      id: data?.id,
      data: hasil,
    };

    handleUpdate(payload);
  };

  return (
    <Modal
      centered
      confirmLoading={loading}
      onOk={handleSubmit}
      open={open}
      onCancel={handleClose}
      title="Update Data Coaching Clinic"
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          rules={[
            {
              required: true,
              message: "Judul harus diisi",
            },
          ]}
          name="title"
          label="Judul"
        >
          <Input />
        </Form.Item>
        <Form.Item
          rules={[
            {
              required: true,
              message: "Deskripsi harus diisi",
            },
          ]}
          name="description"
          label="Deskripsi"
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          help="Status Privat tidak akan muncul dijadwal coaching clinic secara public"
          valuePropName="checked"
          name="is_private"
          label="Privat?"
        >
          <Checkbox
            onChange={(e) => {
              if (e.target.checked) {
                form.setFieldsValue({ code: nanoid(10) });
              } else {
                form.setFieldsValue({ code: null });
              }
            }}
          />
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => {
            return prevValues.is_private !== currentValues.is_private;
          }}
        >
          {({ getFieldValue }) => {
            if (getFieldValue("is_private")) {
              return (
                <Form.Item name="code" label="Kode">
                  <Input disabled readOnly />
                </Form.Item>
              );
            }
            return null;
          }}
        </Form.Item>
        <Form.Item help="Tipe pengguna" name="participants_type">
          <Select mode="multiple">
            <Select.Option value="PNS">PNS</Select.Option>
            <Select.Option value="PPPK">PPPK</Select.Option>
            <Select.Option value="NON ASN">NON ASN</Select.Option>
            <Select.Option value="CPNS">CPNS</Select.Option>
            <Select.Option value="FASILITATOR">Fasilitator</Select.Option>
            <Select.Option value="UMUM">Masyarakat Umum</Select.Option>
          </Select>
        </Form.Item>
        <Row gutter={[16, 16]}>
          <Col md={8} xs={24}>
            <Form.Item
              rules={[
                {
                  required: true,
                  message: "Tanggal harus diisi",
                },
              ]}
              name="start_date"
              label="Tanggal"
            >
              <DatePicker />
            </Form.Item>
          </Col>
          <Col md={8} xs={24}>
            <Form.Item
              rules={[
                {
                  required: true,
                  message: "Mulai jam harus diisi",
                },
              ]}
              name="start_hours"
              label="Mulai Jam"
            >
              <DatePicker.TimePicker />
            </Form.Item>
          </Col>
          <Col md={8} xs={24}>
            <Form.Item
              rules={[
                {
                  required: true,
                  message: "Berakhir jam harus diisi",
                },
              ]}
              name="end_hours"
              label="Berakhir Jam"
            >
              <DatePicker.TimePicker />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          rules={[
            {
              required: true,
              message: "Jumlah peserta harus diisi",
            },
          ]}
          name="max_participants"
          label="Jumlah Peserta"
        >
          <InputNumber />
        </Form.Item>
      </Form>
    </Modal>
  );
};

function CoachingMeetings() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [openModalStatus, setOpenModalStatus] = useState(false);
  const [status, setStatus] = useState(null);

  const handleOpenModalStatus = (row) => {
    setOpenModalStatus(true);
    setStatus(row);
  };

  const handleCloseModalStatus = () => {
    setOpenModalStatus(false);
    setStatus(null);
  };

  const [row, setRow] = useState(null);

  const handleOpen = (row) => {
    setRow(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setRow(null);
  };

  const queryClient = useQueryClient();
  const { mutateAsync: hapus, isLoading: isLoadingRemove } = useMutation(
    (id) => removeMeeting(id),
    {
      onSuccess: () => {
        message.success("Berhasil menghapus coaching clinic");
        queryClient.invalidateQueries(["meetings"]);
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
    }
  );

  const {
    mutateAsync: update,
    isLoading: isLoadingUpdate,
    mutate: updateData,
  } = useMutation((data) => updateMeeting(data), {
    onSuccess: () => {
      message.success("Coaching clinic berhasil diupdate");
      queryClient.invalidateQueries(["meetings"]);
      handleClose();
      handleCloseModalStatus();
    },
    onSettled: () => {
      queryClient.invalidateQueries(["meetings"]);
    },
  });

  const handleUpdate = (data) => {
    updateData(data);
  };

  const handleChangeStatus = (row, status = "upcoming") => {
    const payload = {
      id: row?.id,
      data: {
        status,
      },
    };

    updateData(payload);
  };

  const { data, isLoading } = useQuery(
    ["meetings", router?.query],
    () => findMeeting(router?.query),
    {
      keepPreviousData: true,
      enabled: !!router?.query,
    }
  );

  const handleChangePage = (page) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        page,
      },
    });
  };

  const gotoDetail = (id) => {
    router.push(`/coaching-clinic-consultant/${id}/detail`);
  };

  const columns = [
    {
      title: "Daftar",
      key: "daftar",
      responsive: ["xs"],
      render: (_, row) => {
        return (
          <Space direction="vertical">
            <Link href={`/coaching-clinic-consultant/${row?.id}/detail`}>
              {row?.title}
            </Link>
            {row?.code && <TextSensor text={row?.code} />}
            <Space direction="vertical">
              {dayjs(row?.start_date).format("DD MMMM YYYY")}
              <div>Pukul. {`${row?.start_hours} - ${row?.end_hours}`}</div>
            </Space>
            <Space size="small">
              {row?.participants_type?.length && (
                <>
                  {row?.participants_type.map((item) => (
                    <Tag color="blue" key={item}>
                      {item}
                    </Tag>
                  ))}
                </>
              )}
            </Space>
            <Tag>
              {row?.participants_count} / {row?.max_participants}
            </Tag>
            <Tag
              onClick={() => handleOpenModalStatus(row)}
              style={{
                cursor: "pointer",
              }}
              color={setColorStatusCoachingClinic(row?.status)}
            >
              {upperCase(row?.status)}
            </Tag>
            <Space
              style={{
                marginTop: 10,
              }}
            >
              <a onClick={() => handleOpen(row)}>Update</a>
              <Divider type="vertical" />
              <Popconfirm
                onConfirm={async () => await hapus(row?.id)}
                title="Apakah anda yakin ingin menghapus coaching clinic?"
              >
                <a>Hapus</a>
              </Popconfirm>
            </Space>
          </Space>
        );
      },
    },
    {
      title: "Deskripsi",
      key: "title",
      width: 500,
      render: (_, row) => (
        <>
          <Space direction="vertical">
            <Link href={`/coaching-clinic-consultant/${row?.id}/detail`}>
              {row?.title}
            </Link>
            {row?.code && <TextSensor text={row?.code} />}
            <Space direction="vertical">
              {dayjs(row?.start_date).format("DD MMMM YYYY")}
              <div>Pukul. {`${row?.start_hours} - ${row?.end_hours}`}</div>
            </Space>
            <Space size="small">
              {row?.participants_type?.length && (
                <>
                  {row?.participants_type.map((item) => (
                    <Tag color="blue" key={item}>
                      {item}
                    </Tag>
                  ))}
                </>
              )}
            </Space>
          </Space>
        </>
      ),
      responsive: ["sm"],
    },
    {
      title: "Maximal Peserta",
      responsive: ["sm"],
      dataIndex: "max_participants",
    },
    {
      title: "Peserta Terdaftar",
      responsive: ["sm"],
      dataIndex: "participants_count",
    },
    {
      title: "Status",
      responsive: ["sm"],
      key: "status",
      render: (_, row) => (
        <Space>
          <Tag
            onClick={() => handleOpenModalStatus(row)}
            style={{
              cursor: "pointer",
            }}
            color={setColorStatusCoachingClinic(row?.status)}
          >
            {upperCase(row?.status)}
          </Tag>
          <Tooltip
            title={
              row?.is_private
                ? "Jadwal coaching clinic tidak terlihat oleh banyak orang"
                : "Jadwal coaching clinic terlihat oleh banyak orang"
            }
          >
            <Tag>{row?.is_private ? "PRIVATE" : "PUBLIC"}</Tag>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "Tgl. Dibuat",
      responsive: ["sm"],
      key: "created_at",
      render: (_, row) => (
        <>{dayjs(row?.created_at).format("DD MMMM YYYY HH:mm:ss")}</>
      ),
    },
    {
      title: "Aksi",
      responsive: ["sm"],
      key: "action",
      render: (_, row) => {
        return (
          <>
            <a onClick={() => gotoDetail(row?.id)}>Detail</a>
            <Divider type="vertical" />
            <a onClick={() => handleOpen(row)}>Update</a>
            <Divider type="vertical" />
            <Popconfirm
              onConfirm={async () => await hapus(row?.id)}
              title="Apakah anda yakin ingin menghapus coaching clinic?"
            >
              <a>Hapus</a>
            </Popconfirm>
          </>
        );
      },
    },
  ];

  return (
    <Card title="Daftar Mentoring Anda">
      <ModalChangeStatus
        open={openModalStatus}
        handleClose={handleCloseModalStatus}
        row={status}
        handleChangeStatus={handleChangeStatus}
        loadingChangeStatus={isLoadingUpdate}
      />
      <ModalUpdate
        open={open}
        handleClose={handleClose}
        data={row}
        handleUpdate={handleUpdate}
        loading={isLoadingUpdate}
      />
      <CreateCoaching />
      <div
        style={{
          border: "1px solid #f0f0f0",
        }}
      >
        <FilterConsultantMeetings />
      </div>
      <Table
        size="small"
        pagination={{
          onChange: handleChangePage,
          current: router?.query?.page || 1,
          total: data?.total,
          showTotal: (total) => `Total ${total} data`,
          position: ["bottomRight", "topRight"],
        }}
        columns={columns}
        loading={isLoading}
        rowKey={(row) => row?.id}
        dataSource={data?.data}
      />
    </Card>
  );
}

export default CoachingMeetings;
