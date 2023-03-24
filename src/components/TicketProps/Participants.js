import { Space, Typography, Avatar, Tooltip } from "antd";

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
            <Tooltip title={item?.username} key={item?.custom_id}>
              <Avatar src={item?.image} />
            </Tooltip>
          ))}
        </Avatar.Group>
      )}
    </Space>
  );
}

export default Participants;
