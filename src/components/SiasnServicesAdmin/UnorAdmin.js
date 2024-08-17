import { masterUnorBackup } from "@/services/master.services";
import { SyncOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, Form, Skeleton, TreeSelect } from "antd";

function UnorAdmin() {
  const {
    data: unor,
    isLoading: isLoadingUnor,
    isFetching,
    refetch,
  } = useQuery(["data-unor-admin"], () => masterUnorBackup(), {
    refetchOnWindowFocus: false,
  });

  const handleRefresh = () => refetch();

  return (
    <div>
      {/* <Button
        icon={<SyncOutlined />}
        style={{
          marginBottom: 10,
        }}
        type="primary"
        onClick={handleRefresh}
        loading={isFetching}
      >
        Refresh Perangkat Daerah
      </Button> */}
      <Form.Item name="skpd_id" label="Perangkat Daerah">
        {unor && (
          <TreeSelect showSearch treeNodeFilterProp="title" treeData={unor} />
        )}
      </Form.Item>
    </div>
  );
}

export default UnorAdmin;
