import PharmacistHeader from "./header";
import PharmacistSideBar from "./sidebar";
import { Outlet } from "react-router-dom";
import { useState } from "react";
function PharmacistLayout() {
  const [openSidebar, setOpenSidebar] = useState(false);
  return (
    <div className="flex min-h-screen w-full">
      <PharmacistSideBar open={openSidebar} setOpen={setOpenSidebar} />
      <div className="flex flex-1 flex-col">
        <PharmacistHeader setOpen={setOpenSidebar} />
        <main className="flex-1 flex-col flex bg-muted/40 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default PharmacistLayout;
