import { SettingOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { refStatus, changeStatus } from "@/services/index";
import { Form, Select, Modal,message } from "antd";

const StatusModal = ({ open, onCancel, data, ticketId, statusId }) => {
  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  const {mutate: updateStatus, isLoading} = useMutation(data => changeStatus(data), {
     onSuccess : () => {
      message.success('Berhasil merubah status');
      queryClient.invalidateQueries(['publish-ticket', ticketId])
      onCancel()
     },
     onError : () => {
      message.error('Gagal merubah status');
     }
  });

  const handleSubmit = async () => {
    const {status} = await form.validateFields();
    const data = {
      id : ticketId,
      data : {
        status
      }
    }

     if(isLoading) {
      return
     } else {
      updateStatus(data);
     }
  };

  return (
    <Modal
      title="Pilih Status"
      destroyOnClose
      centered
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={isLoading}
    >
      <Form form={form} initialValues={{
        status : statusId
      }}>
        <Form.Item label='Status Tiket' name="status" rules={[{required : true, message : 'Tidak boleh kosong'}]}>
          <Select showSearch optionFilterProp="name">
            {data?.map((status) => {
              return (
                <Select.Option
                  key={status.name}
                  name={status?.name}
                  value={status.name}
                >
                  {status.name}
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

const ChangeStatus = ({ ticketId, statusId }) => {
  const { data, isloading } = useQuery(["ref-status"], () => refStatus(), {
    refetchOnWindowFocus: false,
  });

  const [open, setOpen] = useState(false);
  const handleShowModal = () => {
    if (isloading) return;
    setOpen(true);
  };
  const handleCancelModal = () => setOpen(false);

  return (
    <div>
      <SettingOutlined
        style={{
          cursor: "pointer",
          color: "#1890ff",
        }}
        onClick={handleShowModal}
      />
      <StatusModal
        data={data}
        ticketId={ticketId}
        statusId={statusId}
        open={open}
        onCancel={handleCancelModal}
      />
    </div>
  );
};

export default ChangeStatus;
