import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import AddShow from "../pages/admin/AddShow";
import { useAuthStore } from "../store/useAuthStore";

const ProtectedRoute = ({ children }: { children: any }) => {
  const token = useAuthStore(state => state.token);
  return token ? children : <Navigate to="/login" />;
};

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Khu vực Admin được bảo vệ */}
      <Route path="/admin" element={
        <ProtectedRoute>
           <AdminLayout />
        </ProtectedRoute>
      }>
         <Route path="dashboard" element={<Dashboard />} />
         <Route path="add-show" element={<AddShow />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRouter;