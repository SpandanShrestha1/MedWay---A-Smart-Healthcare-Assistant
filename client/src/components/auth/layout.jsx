import { Outlet } from "react-router-dom";
import leftSideImage from "../../assets/leftside2.jpeg";
function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden lg:flex items-center justify-center bg-white w-1/2 px-12 border-t border-l border-b border-black">
        <div className="max-w-md space-y-6 text-center text-primary-foreground">
          <img src={leftSideImage} alt="Welcome" className="w-full h-auto" />
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 border-t border-r border-b border-black">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
