import { Link } from "react-router-dom";
import { useState } from "react";
import CommonForm from "../../components/common/form";
import { loginFormControls } from "../../config/index";
import { useDispatch } from "react-redux";
import { loginUser } from "../../store/auth-slice";
import { toast } from "sonner";
import starImg from "../../assets/star.jpeg";

const initialState = {
  email: "",
  password: "",
};
function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();

  function onSubmit(event) {
    event.preventDefault();
    dispatch(loginUser(formData)).then((data) => {
      if (data?.payload?.success) {
        toast.success(data?.payload?.message);
      } else {
        toast.error(data?.payload?.message);
      }
    });
  }
  return (
    <div className="w-full max-w-md">
      <div className="flex justify-center mb-8">
        <div className="w-12 h-12 flex items-center justify-center">
          <img src={starImg} alt="Logo" className="w-8 h-8" />
        </div>
      </div>

      <h1 className="text-center text-3xl font-bold text-slate-900 mb-2">
        Welcome Back!
      </h1>
      <p className="text-center text-slate-600 text-sm mb-10 leading-relaxed">
        Let's get you into{" "}
        <span className="font-semibold" style={{ color: "#1988dcff" }}>
          Med
        </span>
        Way
      </p>

      <div className="space-y-5 mb-7">
        <CommonForm
          formControls={loginFormControls}
          buttonText={"Login"}
          formData={formData}
          setFormData={setFormData}
          onSubmit={onSubmit}
        />
      </div>

      <div className="flex items-center gap-3 my-7">
        <div className="flex-1 h-px bg-slate-300"></div>
        <span className="text-xs text-slate-500 font-medium">OR</span>
        <div className="flex-1 h-px bg-slate-300"></div>
      </div>

      <p className="text-center text-slate-600 text-sm">
        Don't have an account?{" "}
        <Link
          to="/auth/register"
          className="font-semibold hover:underline"
          style={{ color: "#1988dcff" }}
        >
          Sign up here
        </Link>
      </p>
    </div>
  );
}

export default AuthLogin;
