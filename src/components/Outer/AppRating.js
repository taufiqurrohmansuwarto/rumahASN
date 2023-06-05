import { landingData } from "@/services/index";
import { Avatar, Group, createStyles } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Rate, Typography } from "antd";
const Text = Typography.Text;

const COLORS = "#F2F2F0";
const COLOR_FONT = "#595959";

const blacklist = [
  "105503740477298041174",
  "master|88",
  "master|56552",
  "master|56543",
  "113359564305461720000",
];

const whiteListData = (data) => {
  return data?.filter((item) => !blacklist.includes(item.customer?.custom_id));
};

const contentStyle = {
  margin: 0,
  height: "40vh",
  color: "#fff",
  lineHeight: "160px",
  textAlign: "center",
  background: COLORS,
};

const useStyles = createStyles((theme) => ({
  icon: {
    color: "white",
  },

  name: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
  },
}));

const UserInfo = ({ data }) => {
  const { classes } = useStyles();
  return (
    <div>
      <Group px={40} my={40}>
        <Avatar src={data?.customer?.image} size={80} radius="md" />
        <div>
          <Text>{data?.customer?.username}</Text>

          <Group noWrap spacing={10} mt={3}>
            <Text type="secondary">{data?.requester_comment}</Text>
          </Group>

          <Group noWrap spacing={10} mt={5}>
            <Rate value={5} disabled />
          </Group>
        </div>
      </Group>
    </div>
  );
};

function AppRating() {
  const { data, isLoading } = useQuery(["landing"], () => landingData());

  return (
    <div
      style={{
        // create
        background: COLORS,
        padding: 72,
        // only border in bottom has round
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
      }}
    >
      <Typography.Title
        level={3}
        style={{
          textAlign: "center",
          color: COLOR_FONT,
        }}
      >
        Apa Kata Mereka?
      </Typography.Title>
      <div>
        {whiteListData(data?.ticketsWithRatings)?.map((ticket) => (
          <UserInfo key={ticket?.id} data={ticket} />
        ))}
      </div>
    </div>
  );
}

export default AppRating;
