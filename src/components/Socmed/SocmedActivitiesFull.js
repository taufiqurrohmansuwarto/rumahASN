import { getActivities } from "@/services/socmed.services";
import { socmedActivities } from "@/utils/client-utils";
import { useQuery } from "@tanstack/react-query";
import { Typography, Avatar, Button, List } from "antd";
import { useRouter } from "next/router";

const Activity = ({ activity }) => {
  const router = useRouter();

  const handleActivityClick = () => {
    if (activity?.post) {
      router.push(`/asn-connect/asn-updates/all/${activity?.post?.id}`);
    }
  };

  return (
    <List.Item
      onClick={handleActivityClick}
      style={{
        cursor: "pointer",
      }}
    >
      <List.Item.Meta
        avatar={<Avatar src={socmedActivities(activity)?.user?.image} />}
        description={
          <>
            <Typography.Text type="secondary">
              {`"${activity?.post?.content}"`}
            </Typography.Text>
          </>
        }
        title={
          <>
            <Typography.Text>
              {socmedActivities(activity)?.user?.username}
            </Typography.Text>{" "}
            <Typography.Text type="secondary">
              {socmedActivities(activity)?.text}
            </Typography.Text>{" "}
            <Typography.Text>
              {socmedActivities(activity)?.trigger_user?.username}
            </Typography.Text>{" "}
          </>
        }
      />
    </List.Item>
  );
};

function SocmedActivitiesFull() {
  const router = useRouter();

  const handleViewAll = () => {
    router.push(`/asn-connect/asn-updates/activities`);
  };

  const { data, isLoading } = useQuery(
    ["socmed-activities"],
    () => getActivities(),
    {
      enabled: router?.query,
    }
  );

  return (
    <>
      <List
        size="small"
        footer={
          <Button onClick={handleViewAll} type="link">
            Lihat Semua
          </Button>
        }
        loading={isLoading}
        rowKey={(row) => row?.id}
        dataSource={data?.data}
        renderItem={(activity) => <Activity activity={activity} />}
      />
    </>
  );
}

export default SocmedActivitiesFull;
