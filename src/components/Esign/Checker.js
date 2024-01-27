import { checkUser } from "@/services/esign.services";
import { useQuery } from "@tanstack/react-query";
import { Button, Skeleton } from "antd";
import { RedoOutlined } from "@ant-design/icons";
import { Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons";

const Checker = ({ children }) => {
  const { data, isLoading, refetch, isFetching } = useQuery(
    ["check_signer"],
    () => checkUser(),
    {
      refetchOnWindowFocus: false,
      enabled: false,
    }
  );

  const handleRefetch = () => {
    refetch();
  };

  return (
    <>
      <Button
        type="primary"
        onClick={handleRefetch}
        icon={<RedoOutlined />}
        style={{
          marginBottom: 16,
        }}
      >
        Refresh
      </Button>
      <Skeleton active loading={isLoading || isFetching}>
        {data?.status === "NOT_REGISTERED" ? (
          <div>
            <Alert
              variant="filled"
              icon={<IconAlertCircle size="1rem" />}
              title="Perhatian"
              color="red"
              mb="md"
            >
              Mohon maaf, NIK anda belum terdaftar sebagai penandatangan
              elektronik.
            </Alert>
          </div>
        ) : (
          <div>
            <Alert
              variant="filled"
              icon={<IconAlertCircle />}
              title="Perhatian"
              color="green"
              mb="md"
            >
              Selamat, NIK anda sudah terdaftar sebagai penandatangan
              elektronik.
            </Alert>
            {children}
          </div>
        )}
      </Skeleton>
    </>
  );
};

export default Checker;
