import { Avatar, Group, Paper, Stack, Text } from "@mantine/core";
import React from "react";

function CustomerAdminAgent({ data }) {
  return (
    <Paper p="lg" shadow="lg" radius="md">
      <Stack>
        {data?.customer !== null ? (
          <Group>
            <Avatar radius="xl" src={data?.customer?.image} size="sm" />
            <div>
              <Text color="dimmed" size="sm">
                Pembuat tiket
              </Text>
              <Text size="xs">{data?.customer?.username}</Text>
            </div>
          </Group>
        ) : null}
        {data?.admin !== null ? (
          <>
            <Group>
              <Avatar radius="xl" src={data?.admin?.image} size="sm" />
              <div>
                <Text color="dimmed" size="sm">
                  Pemilih Agent
                </Text>
                <Text size="xs">{data?.admin?.username}</Text>
              </div>
            </Group>
          </>
        ) : null}
        {data?.agent !== null ? (
          <>
            <Group>
              <Avatar radius="xl" src={data?.agent?.image} size="sm" />
              <div>
                <Text color="dimmed" size="sm">
                  Agent
                </Text>
                <Text size="xs">{data?.agent?.username}</Text>
              </div>
            </Group>
          </>
        ) : null}
      </Stack>
    </Paper>
  );
}

export default CustomerAdminAgent;
