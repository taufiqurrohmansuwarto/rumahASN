import { Carousel } from "@mantine/carousel";
import { Box, Image } from "@mantine/core";
import Autoplay from "embla-carousel-autoplay";
import { useRouter } from "next/router";
import { useRef } from "react";

function CarouselBanner() {
  const router = useRouter();
  const autoplay = useRef(
    Autoplay({
      delay: 1000,
    })
  );

  return (
    <Carousel
      plugins={[autoplay.current]}
      onMouseEnter={() => autoplay.current.stop}
      onMouseLeave={() => autoplay.current.reset}
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
        <Box>
          <Image
            src={"https://siasn.bkd.jatimprov.go.id:9000/public/banner2.png"}
            alt="banner-sample.webp"
          />
        </Box>
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
