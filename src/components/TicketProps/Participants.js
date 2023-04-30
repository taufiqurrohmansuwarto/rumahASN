import { Space, Typography, Avatar, Tooltip } from "antd";
import Link from "next/link";

function Participants({ item }) {
  return (
    <Space direction="vertical">
      <Typography.Text style={{ fontSize: 12 }}>
        {item?.participants?.length}{" "}
        {item?.participants?.length > 1 ? "Peserta" : "Peserta"}
      </Typography.Text>
      {item?.participants?.length > 0 && (
        <Avatar.Group>
          {item?.participants?.map((item) => (
            <Link href={`/users/${item?.custom_id}`} key={item?.custom_id}>
              <Tooltip title={item?.username}>
                <Avatar style={{ cursor: "pointer" }} src={item?.image} />
              </Tooltip>
            </Link>
          ))}
        </Avatar.Group>
      )}
    </Space>
  );
}

export default Participants;
