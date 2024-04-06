import { Avatar, Space, Tooltip, Typography } from "antd";
import { useRouter } from "next/router";

function Participants({ item }) {
  const router = useRouter();

  const gotoDetailUser = (id) => {
    router.push(`/users/${id}`);
  };

  return (
    <Space direction="vertical">
      <Typography.Text style={{ fontSize: 12 }}>
        {item?.participants?.length}{" "}
        {item?.participants?.length > 1 ? "Peserta" : "Peserta"}
      </Typography.Text>
      {item?.participants?.length > 0 && (
        <Avatar.Group>
          {item?.participants?.map((item) => (
            <Tooltip title={item?.username} key={item?.custom_id}>
              <Avatar
                onClick={() => gotoDetailUser(item?.custom_id)}
                style={{ cursor: "pointer" }}
                src={item?.image}
              />
            </Tooltip>
          ))}
        </Avatar.Group>
      )}
    </Space>
  );
}

export default Participants;
