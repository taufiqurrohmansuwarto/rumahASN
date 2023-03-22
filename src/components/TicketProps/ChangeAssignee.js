import { SettingOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Form, Modal, Select, message } from "antd";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { refAgents, changeAssignee } from "@/services/index";

const AssigneeModal = ({ open, onCancel, ticketId, agentId, agents }) => {
  const [form] = Form.useForm();
  
  const queryClient = useQueryClient();

  const {mutate: updateAssignee, isLoading} = useMutation(data => changeAssignee(data), {
    onSuccess : () => {
       message.success('Berhasil merubah penerima tugas')
       queryClient.invalidateQueries(['publish-ticket', ticketId])
       onCancel()
    },
    onError : () => {
      message.error('Gagal merubah penerima tugas')
    }
  })

  const handleSubmit = async () => {
    try {
      const {assignee} = await form.validateFields();
      const data = {
        id : ticketId,
        data : {
          assignee
        }
      }
      
      if(!isLoading){
       updateAssignee(data) 
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      title="Pilih Penerima Tugas"
      centered
      destroyOnClose
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={isLoading}
    >
      <Form form={form} initialValues={{
        assignee : agentId
      }}>
        <Form.Item name="assignee">
          <Select showSearch optionFilterProp="name">
            {agents?.map((agent) => (
              <Select.Option
                key={agent.custom_id}
                name={agent?.username}
                value={agent.custom_id}
              >
                {agent.username}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

function ChangeAssignee({ ticketId, agentId }) {
  const { data: agents, isLoading: isLoadingAgents } = useQuery(
    ["refs-agents"],
    () => refAgents(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const [open, setOpen] = useState(false);
  const handleShowModal = () => {
    if (isLoadingAgents) return;
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
      <AssigneeModal
        ticketId={ticketId}
        agentId={agentId}
        agents={agents}
        open={open}
        onCancel={handleCancelModal}
      />
    </div>
  );
}

export default ChangeAssignee;
