import { useSession } from "next-auth/react";
import EmployeesTable from "../Fasilitator/EmployeesTable";
import EmployeesTableAdmin from "../Fasilitator/EmployeesTableAdmin";

/**
 * Komponen untuk menampilkan daftar pegawai berdasarkan peran pengguna
 * Admin melihat tabel admin, fasilitator melihat tabel fasilitator
 */
const DaftarPegawai = () => {
  const { data: session } = useSession();

  // Menentukan peran pengguna
  const isAdmin = session?.user?.current_role === "admin";
  const isFasilitator = session?.user?.role === "FASILITATOR";

  // Render komponen berdasarkan peran
  if (isAdmin) {
    return <EmployeesTableAdmin />;
  }

  if (isFasilitator) {
    return <EmployeesTable />;
  }

  // Jika bukan admin atau fasilitator, tampilkan kosong
  return null;
};

export default DaftarPegawai;
