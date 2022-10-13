import { useQuery } from "@tanstack/react-query";
import { Card, Modal, Table } from "antd";
import { useState } from "react";
import { getPriorities } from "../../../services";

const { default: AdminLayout } = require("../../../src/components/AdminLayout");
const {
  default: PageContainer,
} = require("../../../src/components/PageContainer");

const CreateForm = ({ open, onCancel }) => {
  return (
    <Modal open={open} onCancel={onCancel}>
      <div>create form</div>
    </Modal>
  );
};

const UpdateForm = ({ open, onCancel, data }) => {
  return (
    <Modal open={open} onCancel={onCancel}>
      <div>update form</div>
    </Modal>
  );
};

const Priorities = () => {
  const { data, isLoading } = useQuery(["priorities"], () => getPriorities());
  const columns = [{}];

  // wow fucking amazing
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(falsel);
  const [selectedData, setSelectedData] = useState(null);

  const cancelCreate = () => setOpenCreate(false);
  const cancelUpdate = () => setOpenUpdate(false);

  const openCreateModal = () => setOpenCreate(true);
  const openUpdateModal = (data) => {
    setSelectedData(data);
    setOpenUpdate(true);
  };

  return (
    <PageContainer>
      <Card>
        <Table dataSource={data} loading={isLoading} />
        <CreateForm open={openCreate} />
        <UpdateForm />
      </Card>
    </PageContainer>
  );
};

Priorities.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};

Priorities.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Priorities;
