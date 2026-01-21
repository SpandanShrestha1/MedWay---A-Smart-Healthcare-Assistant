import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import CommonForm from "../../components/common/form";
import { registerFormControls } from "../../config/index";
import { useDispatch } from "react-redux";
import { registerUser } from "../../store/auth-slice";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import starImg from "../../assets/star.jpeg";

const initialState = {
  userName: "",
  email: "",
  password: "",
};
function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function onSubmit(event) {
    event.preventDefault();
    dispatch(registerUser(formData)).then((data) => {
      console.log(data);
      if (data?.payload?.success) {
        toast.success(data.payload.message);
        navigate("/auth/login");
      } else {
        toast.error(data.payload.message);
      }
    });
  }
  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="flex justify-center mb-8">
        <div className="w-12 h-12 flex items-center justify-center">
          <img src={starImg} alt="Logo" className="w-8 h-8" />
        </div>
      </div>
      <h1 className="text-center text-3xl font-bold text-slate-900 mb-2">
        Create Your <span style={{ color: "#1988dcff" }}>MedWay</span> Account
      </h1>
      <p className="text-center text-slate-600 text-sm mb-10 leading-relaxed">
        One MedWay Account is all you need to access all MedWay services
      </p>
      <CommonForm
        formControls={registerFormControls}
        buttonText={"Sign Up"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
      <div className="flex items-center gap-3 my-7">
        <div className="flex-1 h-px bg-slate-300"></div>
        <span className="text-xs text-slate-500 font-medium">OR</span>
        <div className="flex-1 h-px bg-slate-300"></div>
      </div>

      <p className="text-center text-slate-600 text-sm">
        Already have an account?{" "}
        <Link
          to="/auth/login"
          className="font-semibold hover:underline"
          style={{ color: "#1988dcff" }}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default AuthRegister;
