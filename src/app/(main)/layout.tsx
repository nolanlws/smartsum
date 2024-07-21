import { MainNav } from "@/components/custom/main-nav";
import { ThemeToggle } from "@/components/custom/theme-toggle";
import { SignedIn, UserButton } from "@clerk/nextjs";
import React from "react";

type Props = { children: React.ReactNode; modal: React.ReactNode };

const Layout = (props: Props) => {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <ThemeToggle />
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </div>
      {/* <Sidebar /> */}
      <div className="w-full">
        {/* <InfoBar /> */}
        {props.children}
        {props.modal}
      </div>
    </div>
  );
};
export default Layout;
