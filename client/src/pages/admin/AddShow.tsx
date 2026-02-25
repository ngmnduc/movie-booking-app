import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Check, Calendar, Search, Globe, Database, Loader2, Download } from "lucide-react";
import axiosClient from "../../api/axiosClient";

const AddShow = () => {
  // --- States ---
  const [localMovies, setLocalMovies] = useState<any[]>([]); // Phim trong DB
  const [tmdbMovies, setTmdbMovies] = useState<any[]>([]);   // Phim tìm từ TMDB
  const [activeTab, setActiveTab] = useState<'local' | 'tmdb'>('local'); // Tab đang chọn
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, reset } = useForm();

  // --- Load danh sách phim Local khi vào trang ---
  const fetchLocalMovies = async () => {
    try {
      const res = await axiosClient.get('/movies');
      setLocalMovies(res.data.data || []);
    } catch (error) {
      console.error("Lỗi lấy phim local:", error);
    }
  };

  useEffect(() => {
    fetchLocalMovies();
  }, []);

  // --- Xử lý Tìm kiếm ---
  const handleSearchTMDB = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      // Gọi API Backend: movie.routes.ts -> searchTmdb
      const res = await axiosClient.get('/movies/tmdb/search', {
        params: { query: searchTerm }
      });
      setTmdbMovies(res.data.data.results || []);
    } catch (error) {
      alert("Lỗi tìm kiếm TMDB.");
    } finally {
      setLoading(false);
    }
  };

  // --- Xử lý Import phim từ TMDB -> DB ---
  const handleImportMovie = async (tmdbId: number) => {
    setLoading(true);
    try {
      // Gọi API Import
      const res = await axiosClient.post('/movies', { tmdbId });
      const newMovie = res.data.data;
      
      alert(`Đã thêm phim "${newMovie.title}" vào Database!`);
      
      // Refresh lại list Local và tự động chọn phim vừa thêm
      await fetchLocalMovies();
      setActiveTab('local');
      setSearchTerm(""); // Clear search để hiện full list
      setSelectedMovieId(newMovie.id);
      
    } catch (error: any) {
      alert(error.response?.data?.message || "Lỗi Import phim.");
    } finally {
      setLoading(false);
    }
  };

  // --- Logic Filter cho Local Movies ---
  const filteredLocalMovies = localMovies.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Submit Form tạo lịch chiếu ---
  const onSubmit = async (data: any) => {
    if (!selectedMovieId) return alert("Vui lòng chọn một bộ phim!");
    setServerError("");

    try {
      await axiosClient.post('/showtimes', {
        movieId: selectedMovieId,
        price: Number(data.price),
        startTime: data.startTime,
        roomId: "1" // Hardcode tạm Room 1
      });
      
      alert("Tạo lịch chiếu thành công!");
      reset();
      setSelectedMovieId(null);
    } catch (error: any) {
      if (error.response?.status === 409) {
        setServerError("⚠️ Phòng chiếu đã bị trùng lịch! Vui lòng chọn giờ khác.");
      } else {
        setServerError("Lỗi tạo lịch chiếu.");
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-white">Add <span className="text-aurora">Shows</span></h1>
      
      {/* --- SEARCH & FILTER BAR --- */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Tab Switcher */}
        <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
            <button 
                onClick={() => setActiveTab('local')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                    activeTab === 'local' ? 'btn-aurora text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
            >
                <Database size={16} /> Available Movies
            </button>
            <button 
                onClick={() => setActiveTab('tmdb')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                    activeTab === 'tmdb' ? 'btn-aurora text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
            >
                <Globe size={16} /> Import from TMDB
            </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-96 group">
            <input 
                type="text" 
                placeholder={activeTab === 'local' ? "Filter local movies..." : "Search TMDB online..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && activeTab === 'tmdb' && handleSearchTMDB()}
                className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-12 py-2.5 text-white outline-none focus:border-aurora-purple transition"
            />
            <Search className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-aurora-green" size={18} />
            
            {/* Nút tìm kiếm (Chỉ hiện khi ở tab TMDB) */}
            {activeTab === 'tmdb' && (
                <button 
                    onClick={handleSearchTMDB}
                    disabled={loading}
                    className="absolute right-2 top-1.5 p-1.5 bg-white/10 hover:bg-white/20 rounded-md text-aurora-blue transition"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                </button>
            )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* --- LEFT COLUMN: Movie Grid --- */}
        <div className="flex-1">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                {activeTab === 'local' ? 'Select a Movie' : 'Search Results'}
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-400">
                    {activeTab === 'local' ? filteredLocalMovies.length : tmdbMovies.length} found
                </span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {(activeTab === 'local' ? filteredLocalMovies : tmdbMovies).map((movie) => (
                    <div 
                        key={movie.id || movie.tmdbId}
                        onClick={() => activeTab === 'local' ? setSelectedMovieId(movie.id) : null}
                        className={`relative rounded-xl overflow-hidden border-2 transition-all group ${
                            activeTab === 'local' 
                                ? (selectedMovieId === movie.id ? "border-aurora-purple shadow-[0_0_15px_rgba(177,158,239,0.5)] scale-[1.02]" : "border-transparent bg-black/40 hover:border-white/20 cursor-pointer")
                                : "border-transparent bg-black/40 hover:border-white/20"
                        }`}
                    >
                        {/* Poster */}
                        <div className="aspect-[2/3] relative">
                            <img 
                                src={`https://image.tmdb.org/t/p/w300${movie.posterPath}`} 
                                className="w-full h-full object-cover" 
                                alt={movie.title} 
                            />
                            
                            {/* Overlay cho tab TMDB: Nút Import */}
                            {activeTab === 'tmdb' && (
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                    <button 
                                        onClick={() => handleImportMovie(movie.tmdbId)}
                                        disabled={loading}
                                        className="btn-aurora px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                                    >
                                        <Download size={16} /> Import
                                    </button>
                                </div>
                            )}

                            {/* Checkmark cho tab Local */}
                            {activeTab === 'local' && selectedMovieId === movie.id && (
                                <div className="absolute inset-0 bg-aurora-purple/20 flex items-center justify-center backdrop-blur-[2px]">
                                    <div className="bg-aurora-purple text-black p-3 rounded-full shadow-lg animate-bounce">
                                        <Check size={24} strokeWidth={4} />
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Info */}
                        <div className="p-3">
                            <p className="text-white font-bold text-sm truncate">{movie.title}</p>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-gray-400">{new Date(movie.releaseDate).getFullYear()}</span>
                                <span className="text-xs text-aurora-green font-bold">★ {movie.voteCount || movie.rating}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Empty State */}
            {(activeTab === 'local' ? filteredLocalMovies : tmdbMovies).length === 0 && (
                <div className="text-center py-10 text-gray-500 border border-dashed border-white/10 rounded-xl">
                    {activeTab === 'local' 
                        ? "Không tìm thấy phim nào trong Database." 
                        : "Nhập tên phim và bấm tìm kiếm..."}
                </div>
            )}
        </div>

        {/* --- RIGHT COLUMN: Form Inputs --- */}
        <div className="w-full lg:w-[350px]">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl sticky top-6">
                <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Schedule Details</h3>
                
                {serverError && (
                    <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg mb-4 text-sm font-semibold animate-pulse">
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Price Input */}
                    <div>
                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Ticket Price</label>
                        <div className="bg-black/40 border border-white/10 rounded-lg flex items-center px-4 py-3 focus-within:border-aurora-purple transition group">
                             <span className="text-gray-500 mr-2 group-focus-within:text-aurora-purple">$</span>
                             <input 
                                {...register("price", { required: true })}
                                type="number" 
                                placeholder="e.g. 75"
                                className="bg-transparent text-white outline-none w-full placeholder-gray-600 font-medium"
                             />
                        </div>
                    </div>

                    {/* Date Input */}
                    <div>
                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Date & Time</label>
                        <div className="relative group">
                            <input 
                                {...register("startTime", { required: true })}
                                type="datetime-local" 
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-aurora-purple transition [color-scheme:dark]"
                            />
                            <Calendar className="absolute right-4 top-3.5 text-gray-500 group-focus-within:text-aurora-purple pointer-events-none" size={18}/>
                        </div>
                    </div>
                    
                    {/* Selected Movie Preview */}
                    {selectedMovieId && (
                        <div className="bg-aurora-blue/10 border border-aurora-blue/30 rounded-lg p-3 flex items-center gap-3">
                            <Check size={16} className="text-aurora-blue" />
                            <span className="text-aurora-blue text-sm font-medium">Movie Selected</span>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={!selectedMovieId}
                        className={`w-full py-3.5 rounded-lg shadow-lg font-bold transition-all transform active:scale-95 ${
                            selectedMovieId 
                                ? "btn-aurora hover:shadow-aurora-purple/40" 
                                : "bg-gray-800 text-gray-500 cursor-not-allowed"
                        }`}
                    >
                        Create Schedule
                    </button>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AddShow;