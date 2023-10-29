import moment from "moment";
import {
  findMeeting,
  removeMeeting,
  updateMeeting,
} from "@/services/coaching-clinics.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Divider,
  Form,
  Modal,
  Popconfirm,
  Table,
  message,
  DatePicker,
  Input,
  Row,
  Col,
  InputNumber,
} from "antd";
import { useRouter } from "next/router";
import { useState } from "react";
import { useEffect } from "react";

const ModalUpdate = ({ open, handleClose, data, handleUpdate, loading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      title: data?.title,
      description: data?.description,
      start_date: data?.start_date ? moment(data.start_date) : null,
      start_hours: data?.start_hours
        ? moment(data.start_hours, "HH:mm:ss")
        : null,
      end_hours: data?.end_hours ? moment(data.end_hours, "HH:mm:ss") : null,
      max_participants: data?.max_participants,
    });
  }, [data, form]);

  const handleSubmit = async () => {
    const result = await form.validateFields();
    const hasil = {
      ...result,
      start_date: moment(result.start_date).format("YYYY-MM-DD"),
      start_hours: moment(result.start_hours).format("HH:mm:ss"),
      end_hours: moment(result.end_hours).format("HH:mm:ss"),
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
        <Form.Item name="title" label="Judul">
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Deskripsi">
          <Input.TextArea />
        </Form.Item>
        <Row gutter={[16, 16]}>
          <Col md={8} xs={24}>
            <Form.Item name="start_date" label="Tanggal">
              <DatePicker />
            </Form.Item>
          </Col>
          <Col md={8} xs={24}>
            <Form.Item name="start_hours" label="Mulai Jam">
              <DatePicker.TimePicker />
            </Form.Item>
          </Col>
          <Col md={8} xs={24}>
            <Form.Item name="end_hours" label="Berakhir Jam">
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
      message.success("Coaching Clinic telah direset");
      queryClient.invalidateQueries(["meetings"]);
      handleClose();
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

    Modal.confirm({
      title: "Ubah Status Coaching Clinic",
      content: `Apakah anda yakin ingin mengubah status coaching clinic menjadi ${status}?`,
      okText: "Ya",
      cancelText: "Tidak",
      centered: true,
      onOk: async () => {
        await update(payload);
      },
    });
  };

  const { data, isLoading } = useQuery(
    ["meetings", router?.query],
    () => findMeeting(router?.query),
    {
      keepPreviousData: true,
      enabled: !!router?.query,
    }
  );

  const gotoDetail = (id) => {
    router.push(`/coaching-clinic-consultant/${id}/detail`);
  };

  const columns = [
    {
      title: "Judul",
      dataIndex: "title",
    },
    {
      title: "Tanggal",
      dataIndex: "start_date",
      render: (row) => {
        return <>{moment(row).format("DD MMMM YYYY")}</>;
      },
    },
    {
      title: "Maximal Peserta",
      dataIndex: "max_participants",
    },
    {
      title: "Peserta Terdaftar",
      dataIndex: "participants_count",
    },
    {
      title: "Jam",
      dataIndex: "start_hours",
      render: (_, row) => {
        return <>{`${row?.start_hours} - ${row?.end_hours}`}</>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
    },
    {
      title: "Tgl. Dibuat",
      key: "created_at",
      render: (_, row) => (
        <>{moment(row?.created_at).format("DD MMMM YYYY HH:mm:ss")}</>
      ),
    },
    {
      title: "Aksi",
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
            {/* <Divider type="vertical" />
            <a onClick={() => handleReset(row)}>Reset</a> */}
          </>
        );
      },
    },
    {
      title: "Set Status",
      key: "set_status",
      render: (_, row) => {
        return (
          <>
            <a onClick={() => handleChangeStatus(row, "upcoming")}>Upcoming</a>
            <Divider type="vertical" />
            <a onClick={() => handleChangeStatus(row, "end")}>End</a>
          </>
        );
      },
    },
  ];

  return (
    <Card title="Daftar Riwayat Instruktur Coaching Clinic">
      <ModalUpdate
        open={open}
        handleClose={handleClose}
        data={row}
        handleUpdate={handleUpdate}
        loading={isLoadingUpdate}
      />
      <Table
        columns={columns}
        loading={isLoading}
        rowKey={(row) => row?.id}
        dataSource={data?.data}
      />
    </Card>
  );
}

export default CoachingMeetings;
