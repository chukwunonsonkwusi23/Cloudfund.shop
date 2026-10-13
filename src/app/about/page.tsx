"use client";
import { Grid, Typography } from "@mui/material";
import { useIsMobile } from "../../../hooks/useIsMobile";
import MainLayouts from "../../../layouts/MainLayouts";

function Page() {
  const mobile = useIsMobile();
  return (
    <MainLayouts>
      <div
        className="innersection"
        style={{
          marginTop: 180,
        }}
      >
        <header
          style={{
            // background: "#f7f7f7",
            // minHeight: "60vh",
            padding: mobile ? "50px 15px" : "50px 30px",
            marginBottom: 30,
          }}
        >
          <Grid container spacing={4}>
            <Grid item md={7} sm={12} xs={12}>
              <div
                style={{
                  background: "#873E36",
                  padding: "5px 15px",
                  width: 90,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 15,
                }}
              >
                {" "}
                <Typography fontWeight={600}>ABOUT</Typography>
              </div>

              <Typography variant="h4" fontWeight={600}>
                {
                  "Welcome to AuntyChy's Kitchen: Authentic Nigerian Cuisine Delivered to your doorstep"
                }
              </Typography>
              <Typography
                variant="h6"
                style={{
                  color: "#000",
                }}
                fontWeight={500}
                mt={2}
              >
                {
                  "At AuntyChy's Kitchen, we bring the vibrant flavors of Nigerian Cuisine, Crafted from traditional recipes, right to your home. Immerse yourself in rich tastes,textures, and aromas made with fresh,locally sourced ingredients and assorted spices from the Motherland."
                }
              </Typography>
            </Grid>
            <Grid item md={5} sm={12} xs={12}>
              <img
                src="/images/Author.png"
                style={{
                  width: "100%",
                }}
              />
            </Grid>
          </Grid>
        </header>
        <div
          style={{
            marginBottom: 30,
          }}
        >
          {/* <Grid container spacing={4}>
            {[
              "/images/Vegetable And Semo.jpg",
              "/images/Wings Suya.jpg",
              "images/Bitterleaf soup.jpeg",
            ]?.map((cur, i) => (
              <Grid item md={4} sm={12} xs={12} key={i}>
                <img
                  src={cur}
                  alt="product"
                  style={{
                    height: "320px",
                    width: "100%",
                    objectFit: "cover",
                  }}
                />
              </Grid>
            ))}
          </Grid> */}
        </div>
        <div>
          <Typography mb={2} variant="h4" fontWeight={700}>
            {"About the Author & Founder, AuntyChy's Kitchen"}
          </Typography>
          <Typography mb={3} lineHeight={1.8} fontWeight={500}>
            At AuntyChy’s Kitchen, we believe that food is more than just
            sustenance—
            {
              "It's a celebration of culture, tradition, and togetherness. Our kitchen is inspired by the rich culinary heritage passed down through generations, bringing you authentic and delicious dishes that capture the essence of home-cooked comfort. Founded with a passion for sharing cherished family recipes and creating memorable dining experiences, AuntyChy’s Kitchen offers a diverse menu that features time-honored favorites and inventive new creations. Every meal is crafted with the finest ingredients and a touch of love, ensuring that each bite is a delightful journey through flavors. Whether you’re enjoying a hearty meal with loved ones or indulging in a solo treat, our commitment to quality and hospitality shines through in every dish we serve. At AuntyChy’s Kitchen, we’re not just feeding you; we’re inviting you to be part of our extended family. Join us and experience the warmth and joy that come from our kitchen to your table. Welcome home!"
            }
          </Typography>

          <Typography mb={2} variant="h4" fontWeight={700}>
            Contact
          </Typography>
          <Typography mb={20}>
            Any other enquiries and any order request, please send me an Email
            to <a href="">chysellsusa@gmail.com</a> You can also follow me on{" "}
            <a href="">Facebook</a>,<a href=""> Instagram@auntychys_kitchen</a>,{" "}
            <a href=""> X@AuntyChysKitchn</a>, <a href=""></a>,and
            <a href=""> Youtube!</a>
          </Typography>
        </div>
      </div>
    </MainLayouts>
  );
}
export default Page;
