import { Outlet } from "react-router-dom";
import PatientHeader from "../patient-view/header";

function PatientLayout() {
  return (
    <div className="flex flex-col bg-white overflow-hidden">
      {/* common header */}
      <PatientHeader />
      <main className="flex flex-col w-full">
        <Outlet />
      </main>
    </div>
  );
}

export default PatientLayout;
