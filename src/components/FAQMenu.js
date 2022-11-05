import { Grid } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Menu } from "antd";
import React from "react";
import { getFaq } from "../../services";

function FAQMenu({ data }) {
  const [current, setCurrent] = React.useState(null);
  const handleClick = ({ key }) => setCurrent(key);

  const { data: dataFaq, isLoading } = useQuery(
    ["faqs", current],
    () => getFaq(current),
    {
      enabled: !!current,
    }
  );

  return (
    <Grid>
      <Grid.Col span={2}>
        <Menu mode="inline">
          {data?.map((item) => {
            return (
              <Menu.Item onClick={handleClick} key={item?.id}>
                {item?.name}
              </Menu.Item>
            );
          })}
        </Menu>
      </Grid.Col>
      <Grid.Col>{JSON.stringify(dataFaq)}</Grid.Col>
    </Grid>
  );
}

export default FAQMenu;
