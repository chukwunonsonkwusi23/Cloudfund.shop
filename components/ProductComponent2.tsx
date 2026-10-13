"use client";
import { Typography } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useIsMobile } from "../hooks/useIsMobile";
import { currencyFormatter } from "../utility";
import Wrapper from "./Wrapper";

function ProductComponent2({
  title,
  description,
  price,
  currency,
  img,
  id,
  reviews_info,
  slug,
  foodType,
  category,
}: any) {
  const mobile = useIsMobile();
  const router = useRouter();

  return (
    <div
      style={{
        cursor: "pointer",
        // minHeight: mobile ? 330 : 320,
        borderWidth: 0.5,
        borderColor: "#ddd",
        background: "#fff",
        display: "flex",
        flexDirection: "row",

        borderStyle: "solid",
      }}
    >
      <Link
        href={{
          pathname: "/products/info",
          query: {
            slug: id,
          },
        }}
      >
        <div
          style={{
            position: "relative",
          }}
        >
          <img
            src={img ? img : "/img/image.png"}
            style={{
              height: 150,
              objectFit: "cover",
              width: 150,
              marginBottom: "-2%",
            }}
          />
        </div>
      </Link>
      <div
        style={{
          padding: "5px 13px",
        }}
      >
        <Wrapper ai="center" jc="space-between" mb={10}>
          <Typography
            // fontWeight={"600"}
            variant="h6"
            fontWeight={600}
          >
            {title}
          </Typography>
        </Wrapper>
        <Typography style={{ color: "var(--primary)" }} fontWeight={"600"}>
          {currencyFormatter(+price, {
            currency,
          })}
        </Typography>

        <div>
          <Typography align="left">
            {description && description?.slice(0, 30)}
          </Typography>
        </div>
        <div
          style={{
            // position: "absolute",
            // right: 20,
            // top: 20,
            width: 70,
            padding: "1px 10px",
            display: "flex",
            marginTop: 2,
            alignItems: "center",
            justifyContent: "center",
            // borderRadius: 50,
            background: "var(--primary)",
          }}
        >
          <Typography color={"white"} variant="caption">
            {category}
          </Typography>
        </div>
      </div>
    </div>
  );
}
export default ProductComponent2;
