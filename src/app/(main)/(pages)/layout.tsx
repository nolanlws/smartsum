import React from "react";

type Props = { children: React.ReactNode };

const Layout = ({ children }: Props) => {
  return (
    <div className="h-screen overflow-scroll bg-background/50 pb-20 ">
      {children}
    </div>
  );
};

export default Layout;
