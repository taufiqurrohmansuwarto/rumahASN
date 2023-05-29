import { landingData } from "@/services/index";
import { Avatar, Group, Rating, Text, createStyles } from "@mantine/core";
import { IconMessageDots } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { Carousel, Typography } from "antd";

const COLORS = "#eb2f96";

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
          <Text
            sx={{
              fontSize: 16,
              color: "white",
            }}
            className={classes.name}
          >
            {data?.customer?.username}
          </Text>

          <Group noWrap spacing={10} mt={3}>
            <Text
              sx={(theme) => ({
                // subscribe to color scheme changes
                // or use any other static values from theme
                color: theme.colors.gray[1],
                fontSize: theme.fontSizes.sm,
                fontWeight: 500,
              })}
            >
              {data?.requester_comment}
            </Text>
          </Group>

          <Group noWrap spacing={10} mt={5}>
            <Rating defaultValue={5} />
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
        background: COLORS,
        padding: 28,
      }}
    >
      <Typography.Title
        level={2}
        style={{
          textAlign: "center",
          color: "white",
        }}
      >
        Apa kata mereka tentang Rumah ASN?
      </Typography.Title>
      <Carousel>
        <div>
          {whiteListData(data?.ticketsWithRatings)?.map((ticket) => (
            <UserInfo key={ticket?.id} data={ticket} />
          ))}
        </div>
      </Carousel>
    </div>
  );
}

export default AppRating;
