import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;

const tmdbClient = axios.create({
    baseURL: TMDB_BASE_URL,
    headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
    },
    timeout: 10000
});
const formatMovieShort = (movie: any) => ({
  tmdbId: movie.id,              
  title: movie.title,
  originalTitle: movie.original_title,
  releaseDate: movie.release_date,
  posterPath: movie.poster_path, // Lấy đuôi ảnh để ghép link
  overview: movie.overview ? movie.overview.substring(0, 150) + "..." : "" ,
  voteCount: movie.vote_count
});

export const searchMovies = async (query: string, page: number = 1) => {
  try {
    const response = await tmdbClient.get('/search/movie', {
      params: { 
        query, 
        language: 'vi-VN', 
        page,
        include_adult: false 
      },
    });

    const rawResults = response.data.results || [];
    const cleanResults = rawResults
      .filter((movie: any) => {
        if (!movie.poster_path) return false;
        if (movie.vote_count < 10) return false; 

        return true;
      })
      .sort((a: any, b: any) => {
        //  Sắp xếp Phim mới nhất lên đầu
        return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
      })
      .map(formatMovieShort);

    return {
      page: response.data.page,
      total_pages: response.data.total_pages,
      results: cleanResults 
    };
} catch (error: any) {
    console.error('TMDB Error:', error.response?.data?.status_message || error.message);
    throw new Error('TMDB_SEARCH_FAILED');
  }
};

export const getMovieDetails = async ( tmdbId: number) => {
    try{
        const [detailRes, creditsRes] = await Promise.all([
            tmdbClient.get(`/movie/${tmdbId}`, {params: {language: 'vi-VN'}}),
            tmdbClient.get(`/movie/${tmdbId}/credits`, { params: { language: 'vi-VN' } })
        ]);
        const details = detailRes.data;
        const credits = creditsRes.data;
        return {
        tmdbId: details.id,
        title: details.title,
        originalTitle: details.original_title,
        description: details.overview,
        posterPath: details.poster_path,
        backdropPath: details.backdrop_path,
        releaseDate: details.release_date,
        duration: details.runtime || 120, 
        rating: details.vote_average,
        genres: details.genres ? details.genres.map((g: any) => g.name) : [],
        cast: credits.cast.slice(0, 10).map((c: any) => ({ // Top 10 diễn viên
        name: c.name,
        character: c.character,
        profilePath: c.profile_path
      })) 
    };
    }
    catch (error){
        console.error('TMDB Detail Error:', error);
        throw new Error('TMDB_DETAIL_FAILED');
    }
}

