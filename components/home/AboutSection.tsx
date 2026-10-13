import { Button, Grid, Typography } from "@mui/material";
import Animator from "../custom/Animator";
import Link from "next/link"; // Import Link from next/link

export const AboutSection = ({ mobile }: { mobile?: boolean }) => (
  <div
    style={{
      padding: mobile ? "40px 20px" : "60px 40px", // Adjusted for more responsive padding
      backgroundColor: "#ffff",
      minHeight: "40vh",
      color: "#000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center", // Center content
    }}
  >
    <div style={{ maxWidth: "1200px", width: "100%" }}>
      {" "}
      {/* Limits max width */}
      <Grid container spacing={6}>
        {/* Image Section */}
        <Grid item xs={12} md={4}>
          <div
            style={{
              border: "3px solid orange",
              padding: 6,
              borderRadius: "50%", // Circular container
              width: "100%",
              height: 0,
              paddingBottom: "100%", // Maintain aspect ratio for perfect circle
              position: "relative", // Enables absolute positioning for the image
              overflow: "hidden", // Clip the image
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src="/images/Author.png"
              alt="Author"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        </Grid>

        {/* Author Info Section */}
        <Grid item xs={12} md={8}>
          <Animator delay={500} variant="zoom" style={{}} timeout={500}>
            <div>
              <Typography
                gutterBottom
                style={{
                  textTransform: "uppercase",
                  fontWeight: 500,
                  color: "#e94b3c", // Can adjust the color if you prefer
                }}
              >
                About The Author
              </Typography>
              <Typography
                variant="h4"
                gutterBottom
                fontWeight={700}
                sx={{ fontFamily: "'Georgia', serif" }}
              >
                {"AuntyChy's Kitchen"}
              </Typography>
              <Typography variant="body1" fontWeight={470} paragraph>
                {
                  "Welcome to AuntyChy’s Kitchen! At AuntyChy’s Kitchen, we believe that food is more than just sustenance—it's a celebration of culture, tradition, and togetherness. Our kitchen is inspired by the rich culinary heritage passed down through generations, bringing you authentic and delicious dishes that capture the essence of home-cooked comfort."
                }
              </Typography>
              <Link href="/about" passHref>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#000",
                    color: "#fff",
                    marginTop: 2,
                    borderRadius: 0,
                    ":hover": { backgroundColor: "#444" }, // Hover effect
                  }}
                >
                  READ MORE
                </Button>
              </Link>
            </div>
          </Animator>
        </Grid>
      </Grid>
    </div>
  </div>
);
