import { statistikPegawaiBKD } from "@/services/bkd.services";
import { Center, Stack, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Card, Divider, Rate, Space, Typography } from "antd";
import { useSession } from "next-auth/react";

function UserPerformance() {
  const {
    data: { user },
    status,
  } = useSession();

  const { data, isLoading } = useQuery(["statistik-tiket-pegawai-bkd"], () =>
    statistikPegawaiBKD()
  );

  return (
    <Card title="Performa Pegawai" loading={status === "loading" || isLoading}>
      <Center>
        <Stack spacing="xs" align="center">
          <Avatar size={128} src={user?.image} />
          <Text>{user?.name}</Text>
          <Title>{data?.average_rating ? data?.average_rating : 0}</Title>
          <Rate allowHalf disabled value={data?.average_rating} />
          <Text c="dimmed">Berdasarkan {data?.total_rating} ulasan</Text>
          <Divider />
          <Space>
            <Space direction="vertical" align="center">
              <Text fz="xs">DIAJUKAN</Text>
              <Text fz="xs">{data?.status?.diajukan}</Text>
            </Space>
            <Divider type="vertical" />
            <Space direction="vertical" align="center">
              <Text fz="xs">DIKERJAKAN</Text>
              <Text fz="xs">{data?.status?.dikerjakan}</Text>
            </Space>
            <Divider type="vertical" />
            <Space direction="vertical" align="center">
              <Text fz="xs">SELESAI</Text>
              <Text fz="xs">{data?.status?.selesai}</Text>
            </Space>
            <Divider type="vertical" />
          </Space>
        </Stack>
      </Center>
    </Card>
  );
}

export default UserPerformance;
