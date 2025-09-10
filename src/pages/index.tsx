import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import Logo from "../components/Logo";

export default function HomePage() {
  const { data: session, status } = useSession();
  const [movieInput, setMovieInput] = useState("");
  const [movieFact, setMovieFact] = useState("");
  const [isLoadingFact, setIsLoadingFact] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState("");
  const [remainingCalls, setRemainingCalls] = useState(10);
  const [isCached, setIsCached] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAddMovies, setShowAddMovies] = useState(false);
  const [newMoviesInput, setNewMoviesInput] = useState("");
  const [isManagingMovies, setIsManagingMovies] = useState(false);

  // Fetch rate limit status when component mounts or session changes
  useEffect(() => {
    const fetchRateLimitStatus = async () => {
      if (session?.user?.email) {
        try {
          const res = await fetch("/api/user/rate-limit-status");
          if (res.ok) {
            const data = await res.json();
            setRemainingCalls(data.remainingCalls);
          }
        } catch (error) {
          console.error("Failed to fetch rate limit status:", error);
        }
      }
    };

    fetchRateLimitStatus();
  }, [session]);

  // Function to fetch movie fact for a specific movie
  const fetchMovieFact = async (movieTitle: string, forceNew: boolean = false) => {
    setSelectedMovie(movieTitle);
    setIsLoadingFact(true);
    try {
      const res = await fetch("/api/movie/fact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieTitle, forceNew }),
      });
      const data = await res.json();
      if (res.ok) {
        setMovieFact(data.fact);
        setRemainingCalls(data.remainingCalls);
        setIsCached(data.cached || false);
      } else {
        setMovieFact("Error: " + data.message);
        if (res.status === 429) {
          setRemainingCalls(0);
        }
      }
    } catch (error) {
      console.error('Failed to fetch movie fact:', error);
      setMovieFact("Failed to fetch movie fact.");
    }
    setIsLoadingFact(false);
  };

  // Handler for submitting the user's favorite movie
  const handleSaveMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieInput || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/user/update-movie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favoriteMovie: movieInput }),
      });

      if (res.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        alert("Failed to save movie.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Failed to save movie:', error);
      alert("Failed to save movie.");
      setIsSubmitting(false);
    }
  };

  // Handler for removing a movie
  const handleRemoveMovie = async (movieTitle: string) => {
    if (!confirm(`Remove "${movieTitle}" from your favorites?`)) return;
    
    setIsManagingMovies(true);
    try {
      const res = await fetch("/api/user/manage-movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", movieTitle }),
      });

      if (res.ok) {
        window.location.reload();
      } else {
        alert("Failed to remove movie.");
      }
    } catch (error) {
      console.error('Failed to remove movie:', error);
      alert("Failed to remove movie.");
    }
    setIsManagingMovies(false);
  };

  // Handler for adding new movies
  const handleAddMovies = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMoviesInput.trim() || isManagingMovies) return;

    setIsManagingMovies(true);
    try {
      const res = await fetch("/api/user/manage-movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", newMovies: newMoviesInput }),
      });

      if (res.ok) {
        setNewMoviesInput("");
        setShowAddMovies(false);
        window.location.reload();
      } else {
        alert("Failed to add movies.");
      }
    } catch (error) {
      console.error('Failed to add movies:', error);
      alert("Failed to add movies.");
    }
    setIsManagingMovies(false);
  };

  if (status === "loading") {
    // Show the landing page immediately while session loads in background
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-200 via-stone-100 to-stone-50 transition-all duration-500">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 p-6 bg-gradient-to-br from-stone-50/95 via-white/95 to-stone-100/95 backdrop-blur-md border-b border-stone-200/50">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <Logo size="md" variant="dark" />
            <div className="bg-stone-800 text-white px-6 py-2.5 rounded-lg font-medium opacity-50 cursor-not-allowed">
              Loading...
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-32">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-stone-200/50 backdrop-blur-sm px-4 py-2 rounded-lg text-stone-700 text-sm font-medium mb-8">
              AI-Powered Movie Discovery
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-stone-900 mb-6 leading-tight">
              Your Personal
              <span className="block bg-gradient-to-r from-stone-600 to-stone-800 bg-clip-text text-transparent">
                Cinema Companion
              </span>
            </h1>
            
            <p className="text-xl text-stone-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Discover fascinating AI-generated facts about your favorite movies. 
              From behind-the-scenes secrets to production trivia, unlock the stories behind the stories.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in - Modern Product Landing Page
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100 relative overflow-hidden transition-all duration-700 ease-in-out">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-stone-200 to-stone-300 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-stone-300 to-stone-400 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-stone-100 to-stone-200 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 p-6 bg-gradient-to-br from-stone-50/95 via-white/95 to-stone-100/95 backdrop-blur-md border-b border-stone-200/50">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <Logo size="md" variant="dark" />
            <button
              onClick={() => signIn("google")}
              className="bg-stone-800 hover:bg-stone-900 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Sign In
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-32">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-stone-200/50 backdrop-blur-sm px-4 py-2 rounded-lg text-stone-700 text-sm font-medium mb-8">
              AI-Powered Movie Discovery
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-stone-900 mb-6 leading-tight">
              Your Personal
              <span className="block bg-gradient-to-r from-stone-600 to-stone-800 bg-clip-text text-transparent">
                Cinema Companion
              </span>
            </h1>
            
            <p className="text-xl text-stone-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Discover fascinating AI-generated facts about your favorite movies, build your personal collection, and explore cinema like never before.
            </p>
            
          </div>

          {/* Features Timeline */}
          <div className="mb-20">
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Central line */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-full bg-gradient-to-b from-stone-300 via-stone-400 to-stone-300"></div>
                
                {/* Feature 1 - Left */}
                <div className="relative flex items-center mb-16">
                  <div className="w-1/2 pr-12 text-right">
                    <div className="inline-block">
                      <h3 className="text-2xl font-bold text-stone-900 mb-3">Discover Hidden Stories</h3>
                      <p className="text-stone-600 text-lg leading-relaxed">
                        Every film has untold stories. Our AI dives deep into cinema archives to uncover fascinating trivia, behind-the-scenes secrets, and connections you never knew existed.
                      </p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-stone-800 rounded-full border-4 border-white shadow-lg"></div>
                  <div className="w-1/2 pl-12">
                    <div className="bg-stone-100 p-6 rounded-2xl border border-stone-200">
                      <div className="text-stone-500 text-sm mb-2">Example Discovery</div>
                      <div className="text-stone-800 font-medium">&ldquo;The Matrix&apos;s green code was actually sushi recipes&rdquo;</div>
                    </div>
                  </div>
                </div>
                
                {/* Feature 2 - Right */}
                <div className="relative flex items-center mb-16">
                  <div className="w-1/2 pr-12">
                    <div className="bg-stone-100 p-6 rounded-2xl border border-stone-200">
                      <div className="text-stone-500 text-sm mb-2">Your Collection</div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-stone-400 rounded-full"></div>
                          <span className="text-stone-800">Inception</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-stone-400 rounded-full"></div>
                          <span className="text-stone-800">The Godfather</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-stone-400 rounded-full"></div>
                          <span className="text-stone-800">Pulp Fiction</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-stone-800 rounded-full border-4 border-white shadow-lg"></div>
                  <div className="w-1/2 pl-12 text-left">
                    <div className="inline-block">
                      <h3 className="text-2xl font-bold text-stone-900 mb-3">Build Your Cinema DNA</h3>
                      <p className="text-stone-600 text-lg leading-relaxed">
                        Create a living collection of your favorite films. Add, organize, and explore your personal cinema universe. Your taste evolves, and so does your collection.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Feature 3 - Left */}
                <div className="relative flex items-center">
                  <div className="w-1/2 pr-12 text-right">
                    <div className="inline-block">
                      <h3 className="text-2xl font-bold text-stone-900 mb-3">Instant Intelligence</h3>
                      <p className="text-stone-600 text-lg leading-relaxed">
                        No waiting, no loading. Smart caching means your discoveries are always at your fingertips. The more you explore, the faster it gets.
                      </p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-stone-800 rounded-full border-4 border-white shadow-lg"></div>
                  <div className="w-1/2 pl-12">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 text-green-700 text-sm mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Cached & Ready</span>
                      </div>
                      <div className="text-green-800 font-medium">Lightning fast access to your movie facts</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-stone-800 rounded-lg p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to explore cinema?</h2>
            <p className="text-stone-300 mb-8 text-lg">
              Join other movie enthusiasts discovering new perspectives on their favorite films.
            </p>
            <button
              onClick={() => signIn("google")}
              className="bg-white text-stone-800 hover:bg-stone-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
Explore Cinema
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Logged in, but no favorite movie set yet
  if (!session.user.favoriteMovie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-stone-200 via-stone-100 to-stone-50 relative">
        {/* Navigation */}
        <nav className="absolute top-6 right-6 flex gap-4">
          <Link href="/about" className="text-stone-600 hover:text-stone-800 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-stone-200">
            About
          </Link>
          <button
            onClick={() => signOut()}
            className="bg-stone-600 text-white px-4 py-2 rounded-lg hover:bg-stone-700 transition-all duration-200 border border-stone-500 hover:border-stone-600"
          >
            Sign out
          </button>
        </nav>
        
        <div className="text-center max-w-4xl mx-auto px-6">
          {session.user.image && (
            <div className="relative mb-8">
              <Image
                src={session.user.image}
                alt="User Photo"
                width={100}
                height={100}
                className="rounded-full mx-auto border-4 border-gray-600 shadow-xl"
              />
            </div>
          )}
          
          <h1 className="text-5xl font-bold mb-4 text-stone-800 whitespace-nowrap">
            Welcome, {session.user.name}!
          </h1>
          
          <p className="mb-12 text-stone-600 text-xl leading-relaxed whitespace-nowrap">
            Let&apos;s start your cinematic journey. What&apos;s your favorite movie?
          </p>
          
          {showSuccess && (
            <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg animate-fade-in">
              <p className="text-green-700 font-medium">✨ Movie saved successfully!</p>
            </div>
          )}
          
          <form onSubmit={handleSaveMovie} className="mb-8">
            <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 hover:border-stone-300 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-stone-400 rounded-full"></div>
                <h3 className="text-lg font-semibold text-stone-800">Add New Favorite Movie</h3>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={movieInput}
                    onChange={(e) => setMovieInput(e.target.value)}
                    placeholder="Enter your favorite movie..."
                    className="w-full px-4 py-3 bg-white hover:bg-stone-50 border border-stone-300 hover:border-stone-400 rounded-lg text-stone-800 placeholder-stone-500 hover:placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-500 focus:bg-white transition-all duration-200"
                    disabled={isSubmitting}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={!movieInput || isSubmitting}
                  className="px-8 py-3 bg-stone-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-lg relative overflow-hidden group"
                >
                  <div className="relative z-10 flex items-center gap-2">
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span>🎬</span>
                        <span>Add Movie</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
              
              {movieInput && (
                <div className="mt-4 p-3 bg-stone-100 border border-stone-200 rounded-lg">
                  <p className="text-stone-600 text-sm">
                    💡 Tip: You can add multiple movies separated by commas
                  </p>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Logged in with favorite movie
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-200 via-stone-100 to-stone-50 transition-all duration-700 ease-in-out">
      {/* Daily AI Calls Counter - Fixed Position */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="bg-white/90 backdrop-blur-sm border border-stone-300 px-4 py-2 rounded-full shadow-lg">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-stone-600">AI calls:</span>
            <span className="font-bold text-stone-800">{remainingCalls}/10</span>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-6 bg-gradient-to-br from-stone-50/95 via-white/95 to-stone-100/95 backdrop-blur-md border-b border-stone-200/50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Logo size="md" variant="dark" />
          <button
            onClick={() => signOut()}
            className="bg-stone-800 hover:bg-stone-900 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto pt-32 px-6">
        <div className="text-center mb-16">
          {session.user.image && (
            <div className="relative mb-8">
              <Image
                src={session.user.image}
                alt="User Photo"
                width={100}
                height={100}
                className="rounded-full mx-auto border-4 border-stone-300 shadow-xl"
              />
            </div>
          )}
          
          <h1 className="text-3xl font-bold mb-4 text-stone-800">
            Welcome back, {session.user.name}!
          </h1>
        </div>

        {/* Two Column Layout: Movies List + Facts Panel */}
        {session.user.favoriteMovie && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 animate-in fade-in duration-500">
                
            {/* Left Column: Movie List */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-stone-400 rounded-full"></div>
                <h3 className="text-2xl font-bold text-stone-800">Your Movies</h3>
              </div>
              
              <div className="space-y-3">
                    {session.user.favoriteMovie.split(',').map((movie: string, index: number) => (
                      <div key={index} className={`group relative bg-white p-4 rounded-lg border transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer ${
                        selectedMovie === movie.trim() 
                          ? 'border-stone-400 bg-stone-50' 
                          : 'border-stone-200 hover:border-stone-300'
                      }`}>
                        <button
                          onClick={() => handleRemoveMovie(movie.trim())}
                          disabled={isManagingMovies}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center text-xs transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50"
                          title="Remove movie"
                        >
                          ×
                        </button>
                        
                        <div 
                          onClick={() => fetchMovieFact(movie.trim())}
                          className="pr-8"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              selectedMovie === movie.trim() ? 'bg-stone-600' : 'bg-stone-400'
                            }`}></div>
                            <span className={`text-lg font-semibold transition-colors duration-300 ${
                              selectedMovie === movie.trim() 
                                ? 'text-stone-900' 
                                : 'text-stone-800 group-hover:text-stone-900'
                            }`}>
                              {movie.trim()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                
                {/* Add More Movies Button */}
                <div className="pt-4">
                  <button
                    onClick={() => setShowAddMovies(!showAddMovies)}
                    className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg ${
                      showAddMovies 
                        ? 'bg-stone-500 hover:bg-stone-600 text-white border border-stone-400 hover:border-stone-500' 
                        : 'bg-stone-600 hover:bg-stone-700 text-white'
                    }`}
                  >
                    <span className="text-lg">
                      {showAddMovies ? '−' : '+'}
                    </span>
                    <span>{showAddMovies ? 'Cancel' : 'Add More Movies'}</span>
                  </button>
                </div>
                
                {/* Add Movies Form */}
                {showAddMovies && (
                  <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 shadow-sm">
                    <form onSubmit={handleAddMovies} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                          Add new movies (separate multiple movies with commas)
                        </label>
                        <input
                          type="text"
                          value={newMoviesInput}
                          onChange={(e) => setNewMoviesInput(e.target.value)}
                          placeholder="e.g., The Matrix, Inception, Interstellar"
                          className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-all duration-300 bg-white text-stone-900 placeholder-stone-500"
                          disabled={isManagingMovies}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!newMoviesInput.trim() || isManagingMovies}
                        className="w-full bg-stone-600 hover:bg-stone-700 disabled:bg-stone-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <span>🎬</span>
                        <span>{isManagingMovies ? 'Adding...' : 'Add Movies'}</span>
                      </button>
                    </form>
                  </div>
                )}
            </div>

                {/* Right Column: Facts Panel */}
            <div className="lg:sticky lg:top-24 lg:h-fit">
              <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-md min-h-[400px] flex flex-col">
                {selectedMovie ? (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-6">
                      <span className="text-2xl">🎭</span>
                      <h3 className="text-xl font-semibold text-stone-800">Behind the Scenes</h3>
                      {isCached && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full ml-2 font-medium">
                          💾 Cached
                        </span>
                      )}
                    </div>
                    
                    <div className="text-center mb-6">
                      <h4 className="text-lg font-medium text-stone-700">&ldquo;{selectedMovie}&rdquo;</h4>
                    </div>
                    
                    <div className="flex-1 flex flex-col">
                      <div className={`relative flex-1 mb-6 bg-stone-50 p-4 rounded-lg transition-all duration-500 ${isLoadingFact ? 'opacity-50' : 'opacity-100'}`}>
                        <p className="text-stone-700 leading-relaxed">
                          {movieFact || "Click 'New Fact' to discover fascinating insights about this movie..."}
                        </p>
                        <div className="absolute -top-1 -left-1 text-3xl text-stone-300 opacity-60">&ldquo;</div>
                        <div className="absolute -bottom-2 -right-1 text-3xl text-stone-300 opacity-60">&rdquo;</div>
                      </div>
                      
                      <div className="flex justify-center">
                        <button
                          onClick={() => fetchMovieFact(selectedMovie, true)}
                          disabled={remainingCalls <= 0 || isLoadingFact}
                          className={`bg-stone-600 hover:bg-stone-700 disabled:bg-stone-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg ${isLoadingFact ? 'animate-pulse' : ''}`}
                        >
                          🎲 {isLoadingFact ? 'Generating...' : 'New Fact'} {remainingCalls <= 0 && "(Limit Reached)"}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                    <div className="text-6xl mb-4 opacity-40">🎬</div>
                    <h3 className="text-xl font-semibold text-stone-700 mb-2">Select a Movie</h3>
                    <p className="text-stone-600 leading-relaxed max-w-sm">Click on any movie from your list to discover fascinating AI-generated facts and behind-the-scenes stories.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
      </div>

      {/* Professional Footer */}
      <footer className="bg-stone-800 text-stone-200 mt-16">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="mb-4">
                <Logo size="lg" variant="light" />
              </div>
              <p className="text-stone-400 leading-relaxed mb-6 max-w-md">
                Discover fascinating AI-generated facts about your favorite movies. 
                Powered by OpenAI and built with modern web technologies.
              </p>
              <div className="flex space-x-4">
                <a href="https://github.com/suhaskm" className="text-stone-400 hover:text-white transition-colors duration-200" title="GitHub">
                  <span className="sr-only">GitHub</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a href="https://linkedin.com/in/suhaskm" className="text-stone-400 hover:text-white transition-colors duration-200" title="LinkedIn">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="https://medium.com/@suhaskm" className="text-stone-400 hover:text-white transition-colors duration-200" title="Medium">
                  <span className="sr-only">Medium</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
                  </svg>
                </a>
                <a href="https://suhas.page" className="text-stone-400 hover:text-white transition-colors duration-200" title="Portfolio">
                  <span className="sr-only">Portfolio</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Connect */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <ul className="space-y-3">
                <li>
                  <a href="https://github.com/suhas-km" className="text-stone-400 hover:text-white transition-colors duration-200">
                    GitHub Projects
                  </a>
                </li>
                <li>
                  <a href="https://suhas.page/" className="text-stone-400 hover:text-white transition-colors duration-200">
                    Portfolio
                  </a>
                </li>
                <li>
                  <a href="https://medium.com/@suhaskm" className="text-stone-400 hover:text-white transition-colors duration-200">
                    Medium Articles
                  </a>
                </li>
                <li>
                  <a href="https://linkedin.com/in/suhaskm" className="text-stone-400 hover:text-white transition-colors duration-200">
                    LinkedIn Profile
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <a href="https://nextjs.org" className="text-stone-400 hover:text-white transition-colors duration-200">
                    Next.js
                  </a>
                </li>
                <li>
                  <a href="https://openai.com" className="text-stone-400 hover:text-white transition-colors duration-200">
                    OpenAI
                  </a>
                </li>
                <li>
                  <a href="https://prisma.io" className="text-stone-400 hover:text-white transition-colors duration-200">
                    Prisma
                  </a>
                </li>
                <li>
                  <a href="https://tailwindcss.com" className="text-stone-400 hover:text-white transition-colors duration-200">
                    Tailwind CSS
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-stone-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-stone-400 text-sm">
              © 2025 Suhas K M. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="mailto:contact@suhaskm@gmail.com" className="text-stone-400 hover:text-white text-sm transition-colors duration-200">
                Say Hello
              </a>
              <a href="https://www.suhas.page/#projects" className="text-stone-400 hover:text-white text-sm transition-colors duration-200">
                More Projects
              </a>
              <a href="https://github.com/suhaskm/movie-facts-app" className="text-stone-400 hover:text-white text-sm transition-colors duration-200">
                Source Code
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}