"use client";

import { Box, Button, Container, Grid, List, Typography, styled } from "@mui/material";
import Image from "next/image";

const MenuSection = styled("section")(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(8, 0),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  textAlign: "center",
  fontSize: "2rem",
  fontWeight: "bold",
}));

const MenuFilters = styled(List)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  marginBottom: theme.spacing(4),
}));

const MenuItem = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const MenuContent = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(1),
}));

const MenuIngredients = styled(Typography)(({ theme }) => ({
  fontStyle: "italic",
  color: theme.palette.text.secondary,
  fontWeight: "bold", // Makes the name bold
  fontSize: "15px",
  whiteSpace: "pre-line",
}));

// Custom styled "View All" link
const ViewAllLink = styled("a")({
  display: "inline-block",
  backgroundColor: "orange", // Set background color to orange
  color: "#fff", // White text color for contrast
  fontWeight: "bold",
  fontSize: "1rem", // Customize font size
  padding: "12px 24px",
  textAlign: "center",
  textDecoration: "none", // Remove underline
  borderRadius: "4px",
  "&:hover": {
    backgroundColor: "darkorange", // Darker orange on hover
  },
});

const Menu = () => {
  return (
    <MenuSection
      id="menu"
      style={{
        background: "#f7f7f7",
      }}
    >
      <Container data-aos="fade-up">
        <SectionTitle variant="h2" style={{ marginTop: 5 }}>
          Menu
        </SectionTitle>

        <Grid
          container
          justifyContent="center"
          data-aos="fade-up"
          data-aos-delay="100"
          mt={14}
        >
          {/* <MenuFilters>
            <ListItem
              button
              component="li"
              className="filter-active"
              style={{ background: "#cda45e", color: "#fff" }}
            >
              <ListItemText primary="All" />
            </ListItem>
            <ListItem button component="li">
              <ListItemText primary="Starters" />
            </ListItem>
            <ListItem button component="li">
              <ListItemText primary="Salads" />
            </ListItem>
            <ListItem button component="li">
              <ListItemText primary="Specialty" />
            </ListItem>
          </MenuFilters> */}
        </Grid>

        <Grid container spacing={6} data-aos="fade-up" data-aos-delay="200">
          {[
            {
              name: "SUYA CHICKEN WINGS",
              imgSrc: "/images/Wings Suya.jpg",
              filter: "filter-starters",
              ingredients:
                "AuntyChy SUYA. \nThis is made with AuntyChy's Premium SUYA Spices.",
            },

            {
              name: "EGUSI SOUP",
              imgSrc: "/images/Egusi Soup.jpg",
              filter: "filter-specialty",
              ingredients:
                "Pumpkin seed blended with spices, spinach, peppers and onions. \nCan be combined with a side of white rice(separate)",
            },
            {
              name: "PEPPERED GOAT MEAT",
              imgSrc: "/images/image1 .jpeg",
              filter: "filter-starters",
              ingredients:
                "A well prepared goat meat that is garnished with peppered ingredients that blow your mind away.",
            },
            {
              name: "SEA-FOOD OKRA",
              imgSrc: "/images/image7.jpeg",
              filter: "filter-salads",
              ingredients:
                "Each plate of soup comes with two pieces of meat and also a choice of swallow.",
            },
            {
              name: "FRIED RICE",
              imgSrc: "/images/image4.jpeg",
              filter: "filter-specialty",
              ingredients:
                "Stir-fried long grain rice made with rich ingredients consisting of mixed vegetables, minced chicken and your meat of choice.",
            },
            {
              name: "EFO-RIRO",
              imgSrc: "/images/image5.jpeg",
              filter: "filter-starters",
              ingredients:
                "A flavorful stew/soup made with spinach leaves and seasoned with a variety of spices.",
            },
            {
              name: "PEPPER SOUP",
              imgSrc: "/images/image6.jpeg",
              filter: "filter-salads",
              ingredients:
                "Made using various meat of your choice (customizable, prices may vary), Chili peppers and calabash nutmeg as primary ingredients. Comes with a side of white rice",
            },
            {
              name: "COCONUT RICE",
              imgSrc: "/images/image0.jpeg",
              filter: "filter-salads",
              ingredients:
                "A well cooked coconut rice mixed with spices and different ingredients",
            },
          ].map((item, index) => (
            <MenuItem
              container
              item
              lg={6}
              key={index}
              className={item.filter}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <div style={{ flexShrink: 0 }}>
                <Image
                  src={item.imgSrc}
                  alt={item.name}
                  width={140}
                  height={140}
                  style={{
                    borderRadius: 70,
                  }}
                  objectFit="cover"
                />
              </div>
              <div style={{ marginLeft: "16px", flex: 1 }}>
                <MenuContent>
                  <Button
                    href=""
                    style={{
                      padding: 0,
                      fontWeight: "bold",
                      fontSize: "1.5rem",
                    }}
                  >
                    {item.name}
                  </Button>
                </MenuContent>
                <MenuIngredients variant="caption">
                  {item.ingredients}
                </MenuIngredients>
              </div>
            </MenuItem>
          ))}
        </Grid>
        {/* Add View All Button Below Menu List */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 4, // margin top for spacing
          }}
        >
          <ViewAllLink
            href="https://app.mulle.ee/qr/AuntyChy's-Menu/menu
"
            target="_blank" // Opens the link in a new tab
            rel="noopener noreferrer" // Security feature for opening links in a new tab
          >
            View All
          </ViewAllLink>
        </Box>
      </Container>
    </MenuSection>
  );
};

export default Menu;
