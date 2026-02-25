import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore"; 
import axiosClient from "../../api/axiosClient";
import { useState } from "react";

const Register = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);
  const [error, setError] = useState("");

  const onSubmit = async (data: any) => {
    try {
      // Backend yêu cầu: email, password, fullName, phone
      const res = await axiosClient.post('/auth/register', {
        email: data.email,
        password: data.password,
        fullName: data.fullName, // Bắt buộc
        phone: data.phone || "0000000000" // Nếu user không nhập thì gửi tạm số giả để ko lỗi backend
      });
      
      // Đăng ký xong tự động login luôn
      if (res.data.success) {
          // Vì API register trả về data user nhưng thường API register xong sẽ cần login lại
          // Nếu backend trả về token luôn thì lưu, không thì chuyển về trang login
          alert("Account created successfully!");
          navigate("/login");
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 409) {
          setError("Email already exists.");
      } else {
          setError(err.response?.data?.message || "Registration failed. Please check inputs.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/50 fixed inset-0 z-50 backdrop-blur-sm p-4">
      <div className="bg-white text-gray-900 w-full max-w-[450px] rounded-2xl p-10 shadow-2xl relative">
        {/* Nút đóng */}
        <button onClick={() => navigate('/login')} className="absolute top-4 right-4 text-gray-400 hover:text-black">✕</button>

        {/* Header giống ảnh */}
        <h2 className="text-2xl font-bold text-center mb-2">Create your account</h2>
        <p className="text-gray-500 text-center text-sm mb-6">Welcome! Please fill in the details to get started.</p>

        {/* Google Button */}
        <button type="button" className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-3 hover:bg-gray-50 transition mb-6">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
          <span className="font-medium text-gray-700">Continue with Google</span>
        </button>

        <div className="flex items-center gap-3 mb-6">
            <div className="h-[1px] bg-gray-200 flex-1"></div>
            <span className="text-gray-400 text-sm">or</span>
            <div className="h-[1px] bg-gray-200 flex-1"></div>
        </div>

        {error && <div className="text-red-500 text-sm text-center mb-4 bg-red-50 p-2 rounded">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Thêm trường Full Name */}
            <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Full Name</label>
                <input 
                    {...register("fullName", { required: true })}
                    type="text" 
                    placeholder="e.g. John Doe"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:outline-none transition"
                />
            </div>

            {/* Thêm trường Phone */}
            <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Phone Number</label>
                <input 
                    {...register("phone")}
                    type="tel" 
                    placeholder="e.g. 0912345678"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:outline-none transition"
                />
            </div>

            <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Email address</label>
                <input 
                    {...register("email", { required: true })}
                    type="email" 
                    placeholder="Enter your email address"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:outline-none transition"
                />
            </div>
             <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Password</label>
                <input 
                    {...register("password", { required: true, minLength: 6 })}
                    type="password" 
                    placeholder="Enter your password"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:outline-none transition"
                />
            </div>
            
            <button type="submit" className="w-full bg-[#1F2937] text-white font-bold py-3.5 rounded-lg hover:bg-black transition shadow-lg mt-2">
                Continue
            </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-600">
            Already have an account? <Link to="/login" className="font-bold text-gray-900 hover:underline">Sign in</Link>
        </p>
        
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
             <p className="text-xs text-gray-400 font-medium">Secured by QuickShow Auth</p>
             <p className="text-xs text-orange-500 font-bold mt-1">Development mode</p>
        </div>
      </div>
    </div>
  );
};

export default Register;