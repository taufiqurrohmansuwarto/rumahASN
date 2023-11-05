import {
  detailMeeting,
  updateMeeting,
} from "@/services/coaching-clinics.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Skeleton,
  message,
} from "antd";
import moment from "moment";
import { useEffect } from "react";

function EditCoachingClinicModal({ open, onClose, id }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ["meeting", id],
    () => detailMeeting(id),
    {}
  );

  const { isLoading: isLoadingUpdate, mutate: updateData } = useMutation(
    (data) => updateMeeting(data),
    {
      onSuccess: () => {
        message.success("Coaching clinic berhasil diupdate");
        queryClient.invalidateQueries(["meeting", id]);
        queryClient.invalidateQueries(["meetings"]);
        onClose();
      },
      onSettled: () => {
        queryClient.invalidateQueries(["meetings"]);
        queryClient.invalidateQueries(["meeting", id]);
      },
    }
  );

  const [form] = Form.useForm();

  const handleSubmit = async () => {
    const result = await form.validateFields();
    const hasil = {
      ...result,
      start_date: moment(result.start_date).format("YYYY-MM-DD"),
      start_hours: moment(result.start_hours).format("HH:mm:ss"),
      end_hours: moment(result.end_hours).format("HH:mm:ss"),
    };
    const payload = {
      id,
      data: hasil,
    };

    updateData(payload);
  };

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        title: data?.title,
        is_private: data?.is_private,
        description: data?.description,
        start_date: data?.start_date ? moment(data.start_date) : null,
        start_hours: data?.start_hours
          ? moment(data.start_hours, "HH:mm:ss")
          : null,
        end_hours: data?.end_hours ? moment(data.end_hours, "HH:mm:ss") : null,
        max_participants: data?.max_participants,
      });
    }
  }, [data, form]);

  return (
    <Modal
      confirmLoading={isLoadingUpdate}
      onOk={handleSubmit}
      centered
      open={open}
      onCancel={onClose}
      title="Edit Coaching Clinic"
    >
      <Skeleton loading={isLoading}>
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
            <Checkbox />
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
      </Skeleton>
    </Modal>
  );
}

export default EditCoachingClinicModal;
