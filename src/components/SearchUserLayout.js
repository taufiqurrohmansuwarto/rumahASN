import { searchUser } from "@/services/index";
import { useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Select, Space, Spin, Typography, Grid } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
const { useBreakpoint } = Grid;

function SearchUserLayout() {
  const router = useRouter();
  const [user, setUser] = useState(undefined);
  const [debounceValue] = useDebouncedValue(user, 500);
  const screens = useBreakpoint();
  const { data, status } = useSession();

  const { data: dataUser, isLoading: isLoadingUser } = useQuery(
    ["data-user", debounceValue],
    () => searchUser(debounceValue),
    {
      enabled: !!debounceValue,
    }
  );

  return (
    <>
      {!screens.xs &&
        (data?.user?.current_role === "admin" ||
          data?.user?.current_role === "agent") && (
          <Select
            style={{
              width: 250,
            }}
            showSearch
            allowClear
            filterOption={false}
            placeholder="Ketik nama atau NIP"
            //       loading={isLoadingUser}

            notFoundContent={isLoadingUser ? <Spin size="small" /> : null}
            onSearch={(value) => {
              if (!value) {
                return;
              } else {
                setUser(value);
              }
            }}
            value={user}
            onChange={(value) => {
              if (!value) {
                return;
              } else {
                router.push(`/users/${value}`);
                setUser(value);
              }
            }}
          >
            {dataUser?.map((item) => (
              <Select.Option key={item?.custom_id} value={item?.custom_id}>
                <Space>
                  <Avatar size="small" src={item?.image} />
                  <Typography.Text>{item?.username}</Typography.Text>
                </Space>
              </Select.Option>
            ))}
          </Select>
        )}
    </>
  );
}

export default SearchUserLayout;
