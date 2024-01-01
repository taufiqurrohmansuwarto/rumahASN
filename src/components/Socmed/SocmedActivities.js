import { getActivities } from "@/services/socmed.services";
import { socmedActivities } from "@/utils/client-utils";
import { useQuery } from "@tanstack/react-query";
import { Avatar, List } from "antd";

const Activity = ({ activity }) => {
  return (
    <List.Item>
      <List.Item.Meta
        avatar={<Avatar size="small" src={activity?.user?.image} />}
        // description={socmedActivities(activity)}
      />
    </List.Item>
  );
};

function SocmedActivities() {
  const { data, isLoading } = useQuery(
    ["socmed-activities"],
    () => getActivities(),
    {}
  );

  return (
    <>
      <List
        header={<div>Activities</div>}
        loading={isLoading}
        rowKey={(row) => row?.id}
        dataSource={data?.data}
        renderItem={(activity) => <Activity activity={activity} />}
      />
    </>
  );
}

export default SocmedActivities;
