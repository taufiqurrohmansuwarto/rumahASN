import { MessageOutlined } from "@ant-design/icons";
import { Text } from "@mantine/core";
import { Avatar, Button, Flex, Typography } from "antd";
import React from "react";

function DetailUser({ user }) {
  return (
    <Flex vertical gap={10}>
      <Flex gap={10}>
        <Flex>
          <Avatar size={38} src={user?.image} alt={user?.username} />
        </Flex>
        <Flex vertical>
          <Text size="xs" fw={700}>
            {user?.username}
          </Text>
          <Text size="xs">{user?.information?.jabatan?.jabatan}</Text>
        </Flex>
      </Flex>
      <Flex>
        <Typography.Text type="secondary" style={{ fontSize: 10 }}>
          {user?.information?.perangkat_daerah?.detail}
        </Typography.Text>
      </Flex>
      <Flex>
        <Button icon={<MessageOutlined />} type="primary">
          Chat
        </Button>
      </Flex>
    </Flex>
  );
}

export default DetailUser;
