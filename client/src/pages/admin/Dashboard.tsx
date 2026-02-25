import { useEffect, useState } from "react";
import { Ticket, Wallet, PlayCircle, Users } from "lucide-react";
import axiosClient from "../../api/axiosClient";

// Component con: Card thống kê 
const StatCard = ({ title, value, icon }: any) => (
  <div className="bg-surface p-6 rounded-xl border border-white/5 flex items-center justify-between shadow-lg">
    <div>
      <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-white">{value}</h3>
    </div>
    <div className="w-12 h-12 bg-surface border border-white/10 rounded-lg flex items-center justify-center text-primary shadow-inner">
      {icon}
    </div>
  </div>
);

const Dashboard = () => {
  const [movies, setMovies] = useState<any[]>([]);

  // Gọi API lấy danh sách phim thật từ DB
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await axiosClient.get('/movies'); // movie.controller.ts -> getLocalMovies
        setMovies(res.data.data.slice(0, 3)); // Chỉ lấy 3 phim mới nhất để hiển thị
      } catch (error) {
        console.error("Failed to fetch movies");
      }
    };
    fetchMovies();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-white">Admin <span className="text-aurora">Dashboard</span></h1>
      
      {/* Stats Grid (Mock Data) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Bookings" value="73" icon={<Ticket />} />
        <StatCard title="Total Revenue" value="$1,060" icon={<Wallet />} />
        <StatCard title="Active Movies" value={movies.length.toString()} icon={<PlayCircle />} />
        <StatCard title="Total Users" value="43" icon={<Users />} />
      </div>

      {/* Active Movies Grid */}
      <h2 className="text-xl font-bold mb-5 text-white">Active Movies</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {movies.length > 0 ? movies.map((movie) => (
            <div key={movie.id} className="bg-surface rounded-xl overflow-hidden border border-white/5 group hover:border-primary transition-all duration-300">
                {/* Poster */}
                <div className="relative aspect-video">
                    <img 
                        src={`https://image.tmdb.org/t/p/w500${movie.backdropPath || movie.posterPath}`} 
                        alt={movie.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-3 left-3 right-3">
                         <h3 className="font-bold text-white text-lg truncate">{movie.title}</h3>
                         <p className="text-xs text-gray-400">{new Date(movie.releaseDate).getFullYear()} Movie</p>
                    </div>
                </div>
                {/* Footer Card */}
                <div className="p-4 flex justify-between items-center bg-white/5">
                    <span className="text-primary font-bold text-lg">$29</span>
                    <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                        ★ {movie.rating.toFixed(1)}
                    </div>
                </div>
            </div>
        )) : (
            <p className="text-gray-500 col-span-3 text-center py-10">No movies found. Please import movies first.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;