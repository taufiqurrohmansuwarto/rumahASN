import { Carousel } from "@mantine/carousel";
import { Box, Image } from "@mantine/core";
import Autoplay from "embla-carousel-autoplay";
import { useRouter } from "next/router";
import { useRef } from "react";
import { Grid as GridAntd } from "antd";

const CarouselBanner = () => {
  const router = useRouter();
  const breakPoint = GridAntd.useBreakpoint();
  const isMobile = breakPoint.xs;

  const autoplay = useRef(
    Autoplay({
      delay: 4500,
    })
  );

  return (
    <Carousel
      plugins={[autoplay.current]}
      onMouseEnter={() => autoplay.current.stop}
      onMouseLeave={() => autoplay.current.reset}
      mx="auto"
      withIndicators
      height={isMobile ? "160px" : "180px"}
      dragFree
      slideGap="xs"
      align="start"
    >
      <Carousel.Slide
        style={{
          cursor: "pointer",
        }}
      >
        <div
          style={{
            height: "100%",
          }}
        >
          <a
            href="https://sscasn.bkn.go.id/"
            target={"_blank"}
            rel={"noreferrer"}
          >
            <Image
              src={
                "https://siasn.bkd.jatimprov.go.id:9000/public/banner-sscasn_test.png"
              }
              alt="banner-sscasn.webp"
              style={{
                height: "100%",
                objectFit: "cover",
              }}
            />
          </a>
        </div>
      </Carousel.Slide>

      <Carousel.Slide
        style={{
          cursor: "pointer",
        }}
        onClick={() => router.push("/coaching-clinic/all")}
      >
        <div
          style={{
            height: "100%",
          }}
        >
          <Image
            src={
              "https://siasn.bkd.jatimprov.go.id:9000/public/banner-coaching-clinic.png"
            }
            alt="banner-coaching-clinic.webp"
            style={{
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      </Carousel.Slide>

      <Carousel.Slide
        style={{
          cursor: "pointer",
        }}
        onClick={() => router.push("/quiz")}
      >
        <div
          style={{
            height: "100%",
          }}
        >
          <Image
            src={
              "https://siasn.bkd.jatimprov.go.id:9000/public/banner-quiz.png"
            }
            alt="banner-sample.webp"
            style={{
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      </Carousel.Slide>
      <Carousel.Slide
        style={{
          cursor: "pointer",
        }}
      >
        <div
          style={{
            height: "100%",
          }}
        >
          <a
            href="https://monitoring-siasn.bkn.go.id/"
            target={"_blank"}
            rel={"noreferrer"}
          >
            <Image
              src={
                "https://siasn.bkd.jatimprov.go.id:9000/public/banner-tracking-layanan.png"
              }
              alt="banner-sample.webp"
              style={{
                height: "100%",
                objectFit: "cover",
              }}
            />
          </a>
        </div>
      </Carousel.Slide>
      <Carousel.Slide
        style={{
          cursor: "pointer",
        }}
        onClick={() => router.push("/webinar-series/all")}
      >
        <Box style={{ height: "100%" }}>
          <Image
            src={"https://siasn.bkd.jatimprov.go.id:9000/public/banner2.png"}
            alt="banner-sample.webp"
            style={{
              height: "100%",
              objectFit: "cover",
            }}
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
            style={{
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      </Carousel.Slide>
    </Carousel>
  );
};

export default CarouselBanner;
