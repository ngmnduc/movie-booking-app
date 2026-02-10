import { useForm } from "react-hook-form";
import { useState } from "react";
// SỬA DÒNG NÀY: Thêm một dấu ../ nữa để lùi ra đúng thư mục gốc src
import axiosClient from "../../api/axiosClient";

export const ShowtimeForm = () => {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState("");

  const onSubmit = async (data: any) => {
    setError("");
    try {
      await axiosClient.post('/showtimes', data);
      alert("Tạo lịch chiếu thành công!");
    } catch (err: any) {
      // Dùng optional chaining (?.) để tránh lỗi crash nếu response null
      if (err.response?.status === 409) {
        setError("⚠️ Phòng chiếu đã bị trùng lịch! Vui lòng chọn giờ khác.");
      } else {
        setError("Lỗi server.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-6">
       {error && <div className="p-4 bg-red-900/50 border border-red-500 text-red-200 rounded">{error}</div>}
       
       <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm text-gray-400">Movie ID</label>
            <input {...register("movieId")} className="w-full p-3 bg-[#1A1A1A] border border-gray-700 rounded text-white" placeholder="Movie ID" />
          </div>
          <div>
             <label className="block mb-2 text-sm text-gray-400">Room ID</label>
             <select {...register("roomId")} className="w-full p-3 bg-[#1A1A1A] border border-gray-700 rounded text-white">
                <option value="1">Cinema A - Room 1</option>
             </select>
          </div>
       </div>
       <button type="submit" className="w-full py-3 bg-red-600 text-white font-bold rounded">Add Show</button>
    </form>
  );
};