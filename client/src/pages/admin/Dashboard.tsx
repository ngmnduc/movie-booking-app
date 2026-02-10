const Dashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="p-6 bg-surface rounded-xl border border-gray-800">
           <h3 className="text-gray-400">Total Revenue</h3>
           <p className="text-3xl font-bold mt-2">$1,200</p>
        </div>
        {/* Thêm các thẻ khác tương tự */}
      </div>
    </div>
  );
};
export default Dashboard;