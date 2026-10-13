"use client";
import { Typography } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useIsMobile } from "../hooks/useIsMobile";
import { currencyFormatter } from "../utility";
import Wrapper from "./Wrapper";

function ProductComponent({
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
        minHeight: mobile ? 330 : 320,
        borderWidth: 0.5,
        borderColor: "#ddd",
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
          <div
            style={{
              position: "absolute",
              right: 20,
              top: 20,
              padding: "1px 10px",
              borderRadius: 50,
              background: "#f5a623",
            }}
          >
            <Typography color={"white"} variant="caption">
              {category}
            </Typography>
          </div>
          <img
            src={img ? img : "/img/image.png"}
            style={{
              height: 210,

              width: "100%",
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
            style={{
              maxWidth: "70%",
            }}
          >
            {title}
          </Typography>
          <Typography
            style={{ color: "#f5a623", maxWidth: "50%" }}
            fontWeight={"600"}
          >
            {currencyFormatter(+price, {
              currency,
            })}
          </Typography>
        </Wrapper>
        {/* <Wrapper jc="space-between" ai="center" mb={2}>
          <Typography variant="caption" fontWeight={600}>
            {category}
          </Typography>
          <Typography variant="caption" fontWeight={600}>
            {foodType}
          </Typography>
        </Wrapper> */}
        <div>
          <Typography align="left">
            {description && description?.slice(0, 30)}
          </Typography>
        </div>
      </div>
    </div>
  );
}
export default ProductComponent;
