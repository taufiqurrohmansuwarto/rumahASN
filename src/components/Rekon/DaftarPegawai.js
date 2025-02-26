import { Card, Form } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import EmployeesTableAdmin from "../Fasilitator/EmployeesTableAdmin";
import EmployeesTable from "../Fasilitator/EmployeesTable";

const DaftarPegawai = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const handleFinish = (values) => {
    // router.push(`/rekon/pegawai/${values.nip}`);
  };

  const [form] = Form.useForm();
  const admin = session?.user?.current_role === "admin";
  const fasilitator = session?.user?.role === "FASILITATOR";

  return <>{admin ? <EmployeesTableAdmin /> : <EmployeesTable />}</>;
};

export default DaftarPegawai;
