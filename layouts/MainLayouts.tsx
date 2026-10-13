import { ReactNode } from "react";
import MarketplaceFooter from "../components/MarketplaceFooter";
import Header from "../components/navs/Header";

function MainLayouts({
  children,
  mobile,
}: {
  children: ReactNode;
  mobile?: boolean;
}) {
  return (
    <div>
      <Header />
      {children}
      <MarketplaceFooter />
    </div>
  );
}

export default MainLayouts;
