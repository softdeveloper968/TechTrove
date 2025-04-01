import React from "react";

import { useState } from "react";
import Header from "../header/Header";
import SideBar from "../sidebar/SideBar";

type Props = {
  children: JSX.Element;
  isAuth: Boolean;
};

export default function MainLayout(props: Props) {
  /* handle hamburger click */
  const [toggleMenu, setToggleMenu] = useState<Boolean>(false);
  return (
    <>
      {/* Display the layout only if the user is authenticated */}
      {props.isAuth && (
        <>
          {/* Main layout container */}
          <div className="bg-slate-50 fixed-sidebar fixed-header bg-[#edf2f9] flex min-h-screen flex-col ">
            {/* Header component */}
            <Header
              handleHamburgerClick={() => {
                setToggleMenu(!toggleMenu);
              }}
            />
            {/* SideBar and content section */}

            <div className="app-main flex items-center flex relative">
              {/* SideBar component */}
              <SideBar
                toggleMenu={`${!toggleMenu ? "left-0" : "left-[-100%]"}`}
              />
              <div
                className={`${
                  !toggleMenu ? " pl-[14.08rem]" : "pl-3.5"
                } app-main-outer w-full pt-16 pr-3.5 pb-5"`}
              >
                <div className={`${!toggleMenu ? "pl-1.5 " : "pl-0"}"`}>
                  {/* Render the content passed as children */}
                  {props.children}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
