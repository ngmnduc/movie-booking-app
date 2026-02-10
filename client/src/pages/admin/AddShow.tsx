import { ShowtimeForm } from "../../components/forms/ShowtimeForm";

const AddShow = () => {
  return (
    <div>
       <h1 className="text-2xl font-bold mb-6">Thêm Lịch Chiếu Mới</h1>
       {/* Chỉ gọi Component Form vào đây */}
       <ShowtimeForm />
    </div>
  );
};
export default AddShow;