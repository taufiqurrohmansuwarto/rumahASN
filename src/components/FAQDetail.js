import { createStyles, Grid } from "@mantine/core";
import { Collapse } from "antd";

const useStyles = createStyles((theme) => ({
  wrapper: {
    paddingTop: theme.spacing.xl * 2,
    paddingBottom: theme.spacing.xl * 2,
  },

  title: {
    marginBottom: theme.spacing.md,
    paddingLeft: theme.spacing.md,
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
  },

  item: {
    fontSize: theme.fontSizes.sm,
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[1]
        : theme.colors.gray[7],
  },
}));

const FAQDetail = ({ data, loading }) => {
  const { classes } = useStyles();

  return (
    <Grid id="faq-grid">
      {/* <Grid.Col xs={12} md={6}>
          <Image src={image.src} alt="Frequently Asked Questions" />
        </Grid.Col> */}
      <Grid.Col xs={12} md={12}>
        {/* <Title order={2} align="left" className={classes.title}>
          Frequently Asked Questions
        </Title> */}
        <Collapse accordion>
          {data?.map((item) => {
            return (
              <Collapse.Panel
                key={item?.id}
                // className={classes.item}
                header={item?.question}
                value={`${item?.id}`}
              >
                {/* <Accordion.Control>{item?.question}</Accordion.Control> */}
                {/* <Accordion.Panel> */}
                <div
                  dangerouslySetInnerHTML={{
                    __html: item?.html,
                  }}
                />
                {/* </Accordion.Panel> */}
              </Collapse.Panel>
            );
          })}
        </Collapse>
      </Grid.Col>
    </Grid>
  );
};

export default FAQDetail;
