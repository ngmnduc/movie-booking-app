import { useForm } from "react-hook-form";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { register, handleSubmit } = useForm();
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const onSubmit = (data: any) => {
    // Giả lập login thành công
    console.log(data);
    login({ 
    email: "admin@gmail.com", // Đổi name -> email
    role: "admin",
    id: "user_123" 
}, "token_fake_123");
    navigate("/admin/dashboard");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-background">
       <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl w-96 text-black">
          <h2 className="text-2xl font-bold mb-6 text-center">Đăng Nhập</h2>
          <input {...register("email")} placeholder="Email" className="w-full mb-4 p-3 border rounded" />
          <input {...register("password")} type="password" placeholder="Password" className="w-full mb-6 p-3 border rounded" />
          <button className="w-full bg-black text-white py-3 rounded font-bold">Login</button>
       </form>
    </div>
  );
};
export default Login;