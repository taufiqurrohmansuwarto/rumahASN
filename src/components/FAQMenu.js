import { Grid } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Menu } from "antd";
import React from "react";
import { getFaq } from "../../services";
import FAQDetail from "./FAQDetail";

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
      <Grid.Col md={2} sm={12}>
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
      <Grid.Col md={10} sm={12}>
        {dataFaq && <FAQDetail data={dataFaq?.sub_faq} />}
      </Grid.Col>
    </Grid>
  );
}

export default FAQMenu;
