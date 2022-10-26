import { useQuery } from "@tanstack/react-query";
import { Carousel, Image } from "antd";
import { dataListBanner } from "../../services";

function BannerBKD() {
  const { data, isLoading } = useQuery(["banner"], () => dataListBanner());

  const contentStyle = {
    color: "#fff",
    lineHeight: "160px",
    textAlign: "center",
    background: "#364d79",
  };

  return (
    <div>
      <Carousel autoplay>
        {data?.map((item, index) => (
          <div key={item?.id}>
            <Image
              style={contentStyle}
              preview={false}
              alt="item"
              src={item?.image_url}
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
}

export default BannerBKD;
