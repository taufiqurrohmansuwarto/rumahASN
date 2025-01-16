import { checkUser } from "@/services/esign.services";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Flex, Typography } from "antd";
import { useSession } from "next-auth/react";

function CheckUser() {
  const { data: currentUser, status } = useSession();
  const { data, isLoading, refetch } = useQuery(
    ["check-user"],
    () => checkUser(),
    {}
  );

  return (
    <div>
      <Flex>
        <Avatar src={currentUser?.user?.image} />
        <Typography.Text>{currentUser?.user?.name}</Typography.Text>
      </Flex>
      <Flex>{JSON.stringify(data)}</Flex>
    </div>
  );
}

export default CheckUser;
