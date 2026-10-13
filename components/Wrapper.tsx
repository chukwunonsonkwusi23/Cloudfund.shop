interface WRAPPERPROPS {
  p?: number | string;
  mt?: number | string;
  mb?: number | string;
  pr?: number | string;
  pl?: number | string;
  gap?: number | string;
  position?: "relative" | "absolute";
  ai?: "center" | "flex-start" | "flex-end";
  fw?: "wrap" | "nowrap" | "wrap-reverse" | "initial" | "inherit";
  jc?:
    | "center"
    | "flex-start"
    | "flex-end"
    | "space-between"
    | "space-around"
    | "space-evenly";
  d?: "row" | "column" | "row-reverse" | "column-reverse";
  children: any;
  h?: number | string;
  w?: number | string;
}
function Wrapper({
  p,
  mt = 1,
  mb = 1,
  pl,
  pr,
  position,
  h,
  gap: gap,
  d = "row",
  ai,
  jc,
  children,
  w,
  fw,
}: WRAPPERPROPS) {
  return (
    <div
      style={{
        display: "flex",
        padding: p,
        paddingLeft: pl,
        paddingRight: pr,
        width: w,
        marginTop: mt,
        marginBottom: mb,
        gap: gap,
        position: position,
        height: h,
        flexDirection: d,
        alignItems: ai,
        justifyContent: jc,
        flexWrap: fw,
      }}
    >
      {children}
    </div>
  );
}

export default Wrapper;
