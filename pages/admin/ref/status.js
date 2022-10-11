import { useQuery } from "@tanstack/react-query";
import { Modal } from "antd";
import { useState } from "react";
import { getStatus } from "../../../services";

const { default: AdminLayout } = require("../../../src/components/AdminLayout");
const {
  default: PageContainer,
} = require("../../../src/components/PageContainer");

const column = [];

const CreateStatus = () => {
  return <Modal></Modal>;
};
const UpdateStatus = () => {
  return <Modal></Modal>;
};

const Status = () => {
  const { data, isLoading } = useQuery(["status"], () => getStatus());
  const [visibleCreate, setVisibleCreate] = useState(false);
  const [visibleUpdate, setVisibileUpdate] = useState(false);

  return <PageContainer>{JSON.stringify(data)}</PageContainer>;
};

Status.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};

Status.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Status;
