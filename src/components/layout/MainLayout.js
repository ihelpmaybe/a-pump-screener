import React from "react";
import LeftSidebar from "./LeftSidebar";

const MainLayout = ({ children, openSearchModal }) => {
  return (
    <div className="flex min-h-screen bg-dex-bg-primary text-dex-text-primary">
      <LeftSidebar openSearchModal={openSearchModal} />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
};

export default MainLayout;
