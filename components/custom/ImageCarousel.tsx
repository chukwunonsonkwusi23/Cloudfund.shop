import { Grid } from "@mui/material"; // Assuming you're using Material-UI (MUI)
import Slider from "react-slick";
import Animator from "./Animator";
// Assuming you have an Animator component

const CarouselComponent = ({ data }: any) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <Slider {...settings}>
      {data?.map((cur: any, i: number) => (
        <Grid item xs={12} key={i}>
          <Animator delay={900} variant="fade" timeout={900} style={{}}>
            <img
              src={cur.img}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 20,
              }}
              alt={`carousel-item-${i}`}
            />
          </Animator>
        </Grid>
      ))}
    </Slider>
  );
};

export default CarouselComponent;
