import {
  createScheduleVisit,
  getEmployeesBKD,
  getScheduleVisits,
} from "@/services/guests-books.services";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  Button,
  Table,
  Modal,
  Form,
  DatePicker,
  Input,
  message,
  Select,
  Space,
  Typography,
  Avatar,
} from "antd";
import { toUpper } from "lodash";
import { useState } from "react";
import dayjs from "dayjs";

const FormEmployees = ({ name }) => {
  const { data, isLoading } = useQuery(
    ["pegawai_bkd"],
    () => getEmployeesBKD(),
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <div>
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
            <Select.Option
              name={item?.name}
              key={item?.value}
              value={JSON.stringify(item?.label)}
            >
              <Space>
                <Avatar size="small" src={item?.avatar} />
                <Typography.Text>{item?.name}</Typography.Text>
              </Space>
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
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

const FormModalCreate = ({ open, onCancel, submit, loading }) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const employeeVisited = values?.employee_visited?.map((item) =>
      JSON.parse(item?.value)
    );

    const payload = {
      ...values,
      employee_visited: JSON.stringify(employeeVisited),
      visit_date: dayjs(values?.visit_date).format("YYYY-MM-DD HH:mm:ss"),
    };

    console.log(payload);

    submit(payload);
  };

  return (
    <Modal
      width={800}
      confirmLoading={loading}
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
        <FormEmployees name="employee_visited" />
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

function GuestBookScheduleVisit() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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

  const { data, isLoading } = useQuery(
    ["guest-book-schedule-visits"],
    () => getScheduleVisits(),
    {}
  );

  return (
    <div>
      {JSON.stringify(data)}
      <Button type="primary" onClick={handleOpen}>
        Tambah
      </Button>
      <FormModalCreate
        open={open}
        onCancel={handleClose}
        submit={create}
        loading={isLoadingCreate}
      />
      <Table loading={isLoading} dataSource={data} rowKey={(row) => row?.id} />
    </div>
  );
}

export default GuestBookScheduleVisit;
