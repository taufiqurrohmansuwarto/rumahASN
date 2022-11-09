import { createStyles, Group, Paper, SimpleGrid, Text } from "@mantine/core";
import {
  IconUserPlus,
  IconDiscount2,
  IconReceipt2,
  IconCoin,
  IconArrowUpRight,
  IconArrowDownRight,
} from "@tabler/icons";
import { listDataDashboard } from "../../utils";

const useStyles = createStyles((theme) => ({
  value: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1,
  },

  diff: {
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
  },

  icon: {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[3]
        : theme.colors.gray[4],
  },

  title: {
    fontWeight: 700,
    textTransform: "uppercase",
  },
}));

const icons = {
  user: IconUserPlus,
  discount: IconDiscount2,
  receipt: IconReceipt2,
  coin: IconCoin,
};

export function StatsGrid({ data, role = "agent" }) {
  const { classes } = useStyles();
  const stats = data.map((stat) => {
    // const Icon = icons[stat.icon];
    const Icon = listDataDashboard.find((item) => item.name === stat.name).icon;
    const color = listDataDashboard.find(
      (item) => item.name === stat.name
    ).color;

    return (
      <Paper withBorder p="md" radius="md" key={stat.title}>
        <Group position="apart">
          <Text size="xs" color="dimmed" className={classes.title}>
            {stat.name}
          </Text>
          <Icon className={classes.icon} size={22} stroke={1.5} />
        </Group>

        <Group align="flex-end" spacing="xs" mt={25}>
          <Text className={classes.value}>{stat.count}</Text>
        </Group>

        <Text size="xs" color="dimmed" mt={7}>
          Tiket yang telah di proses
        </Text>
      </Paper>
    );
  });

  return (
    <div className={classes.root}>
      <SimpleGrid
        cols={4}
        breakpoints={[
          { maxWidth: "md", cols: 2 },
          { maxWidth: "xs", cols: 1 },
        ]}
      >
        {stats}
      </SimpleGrid>
    </div>
  );
}
