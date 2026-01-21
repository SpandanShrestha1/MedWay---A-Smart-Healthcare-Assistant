import { logoutUser } from "../../store/auth-slice";
import { useDispatch } from "react-redux";
import { Button } from "../ui/button";
import { Menu } from "lucide-react";

function PharmacistHeader({ setOpen }) {
  const dispatch = useDispatch();
  function handleLogout() {
    dispatch(logoutUser());
  }
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-background border-b">
      <dir
        onClick={() => setOpen(true)}
        className="lg:hidden sm:block"
        size="icon"
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle Menu</span>
      </dir>
      <div className="flex flex-1 justify-end">
        <Button
          onClick={handleLogout}
          className="inline-flex gap-2 items-center rounded-md px-4 py-2 text-sm font-medium shadow"
        >
          Logout
        </Button>
      </div>
    </header>
  );
}

export default PharmacistHeader;
