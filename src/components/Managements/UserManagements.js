import { getRoles } from "@/services/managements.services";
import { useQuery } from "@tanstack/react-query";
import CreateRole from "./CreateRole";
import CreatePermissions from "./CreatePermissions";

function UserManagements() {
  const { data, isLoading } = useQuery(["roles"], () => getRoles(), {});

  return (
    <div>
      {JSON.stringify(data)}
      <CreateRole />
      <CreatePermissions />
    </div>
  );
}

export default UserManagements;
