import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-[#ECF7FF] via-[#F7FBFF] to-[#E0F1FF] relative overflow-hidden">
      <div
        className="absolute top-[-100px] left-[-120px] w-[450px] h-[450px] 
                      bg-[#B5E4FF] rounded-full blur-[160px] opacity-40"
      ></div>

      <div
        className="absolute bottom-[-160px] right-[-120px] w-[550px] h-[550px] 
                      bg-[#9BD0FF] rounded-full blur-[180px] opacity-45"
      ></div>

      <div
        className="hidden lg:flex items-center justify-center w-1/2 px-12 
                      bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900
                      text-white relative overflow-hidden"
      >
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes glow {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          .animate-glow {
            animation: glow 4s ease-in-out infinite;
          }
        `}</style>

        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/25 blur-3xl rounded-full opacity-30 animate-glow"></div>
        <div
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-indigo-600/20 blur-3xl rounded-full opacity-30 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-blue-500/15 blur-3xl rounded-full opacity-25"></div>

        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/40 via-transparent to-transparent pointer-events-none"></div>

        <div className="absolute top-10 left-10 w-1 h-1 bg-cyan-300 rounded-full opacity-70"></div>
        <div className="absolute top-1/4 right-20 w-1.5 h-1.5 bg-blue-300 rounded-full opacity-50"></div>
        <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-cyan-200 rounded-full opacity-60"></div>
        <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-50"></div>

        <div className="max-w-2xl space-y-12 text-center z-10 relative">
          <div className="inline-block animate-float">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/40 via-blue-400/30 to-indigo-400/20 blur-3xl rounded-full scale-125"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/30 to-blue-500/20 blur-2xl rounded-full"></div>
              <img
                src="https://cdn-icons-png.flaticon.com/512/387/387561.png"
                alt="Doctor Illustration"
                className="w-44 drop-shadow-2xl relative z-10 filter brightness-125"
              />
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <p className="text-cyan-300 text-sm font-semibold tracking-widest uppercase">
                Excellence in Healthcare
              </p>
              <h1 className="text-6xl font-black tracking-tight leading-tight">
                MedWay
              </h1>
              <p className="text-xl font-light text-blue-200">
                Your Health, Our Priority
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full opacity-60"></div>
              <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full opacity-60"></div>
              <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent rounded-full opacity-60"></div>
            </div>
          </div>

          <p className="text-base font-light opacity-90 leading-relaxed text-gray-200 max-w-sm mx-auto">
            Experience world-class healthcare through our intelligent platform
            combining cutting-edge technology with compassionate patient care.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-8">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/40">
          <div className="flex justify-center mb-4">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2966/2966327.png"
              alt="Logo"
              className="w-16"
            />
          </div>

          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6 ">
            Login
          </h2>

          <Outlet />

          <p className="text-center text-gray-500 text-sm mt-6">
            © {new Date().getFullYear()} MedWay Health. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
