import React from "react";
import { Outlet } from "react-router-dom";

import Navbar from "../components/layout/Navbar";

function PublicLayout() {

  return (

    <>
      <Navbar />

      <Outlet />

    </>

  );

}

export default PublicLayout;