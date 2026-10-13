import { Button } from "@mui/material";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import Link from "next/link";
import * as React from "react";

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

export default function BlogComponent({
  createdAt,
  description,
  id,
  img,
  title,
}: {
  title: string;
  description: string;
  img: string;
  createdAt: string;
  id: string;
}) {
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <div
      style={
        {
          // minHeight: 900,
        }
      }
    >
      <img
        src={img}
        style={{
          height: 220,
          width: "100%",
          objectFit: "cover",
        }}
      />
      <div
        style={{
          background: "#fff",
          marginTop: "-1%",
          padding: "10px 15px",
          minHeight: 170,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <div
            dangerouslySetInnerHTML={{ __html: description?.slice(0, 50) }}
          ></div>
        </Typography>
        <Link
          href={{
            pathname: "/blogs/view",
            query: { id: id },
          }}
        >
          <Button
            variant="outlined"
            style={{
              marginTop: 16,
              alignItems: "flex-end",
              height: "100%",
              padding: "5px 25px",
            }}
          >
            VIEW POST
          </Button>
        </Link>
      </div>
    </div>
  );
}
