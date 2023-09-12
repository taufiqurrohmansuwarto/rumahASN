import { Carousel } from "@mantine/carousel";
import { Image } from "@mantine/core";
import { useRouter } from "next/router";

function CarouselBanner() {
  const router = useRouter();
  return (
    <Carousel
      mx="auto"
      withIndicators
      height="auto"
      dragFree
      slideGap="md"
      align="start"
    >
      <Carousel.Slide
        style={{
          cursor: "pointer",
        }}
        onClick={() => router.push("/webinar-series/all")}
      >
        <div
          style={{
            height: "100%",
          }}
        >
          <Image
            src={"https://siasn.bkd.jatimprov.go.id:9000/public/banner2.png"}
            alt="banner-sample.webp"
          />
        </div>
      </Carousel.Slide>

      <Carousel.Slide
        style={{
          cursor: "pointer",
        }}
        onClick={() => router.push("/edukasi/podcasts")}
      >
        <div
          style={{
            height: "100%",
          }}
        >
          <Image
            src={"https://siasn.bkd.jatimprov.go.id:9000/public/banner-1.png"}
            alt="banner-sample.webp"
          />
        </div>
      </Carousel.Slide>
    </Carousel>
  );
}

export default CarouselBanner;
