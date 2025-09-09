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
      alert("Failed to add movies.");
    }
    setIsManagingMovies(false);
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-600 border-t-gray-300 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" style={{animationDelay: '0.15s'}}></div>
        </div>
        <p className="mt-6 text-gray-300 text-lg animate-pulse">Loading your cinema experience...</p>
      </div>
    );
  }

  // Not logged in - Modern Product Landing Page
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100 relative overflow-hidden">
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
                      <div className="text-stone-800 font-medium">"The Matrix's green code was actually sushi recipes"</div>
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
        
        <div className="text-center max-w-lg mx-auto px-6">
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
          
          <h1 className="text-5xl font-bold mb-4 text-stone-800">
            Welcome, {session.user.name}!
          </h1>
          
          <p className="mb-12 text-stone-600 text-xl leading-relaxed">
            Let's start your cinematic journey. What's your favorite movie?
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
                <div className="flex-1 relative group">
                  <input
                    type="text"
                    value={movieInput}
                    onChange={(e) => setMovieInput(e.target.value)}
                    placeholder="Enter your favorite movie..."
                    className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg text-stone-800 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all duration-300 group-hover:border-stone-400"
                    disabled={isSubmitting}
                  />
                  <div className="absolute inset-0 bg-stone-100 rounded-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-stone-200 via-stone-100 to-stone-50">
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

      <div className="max-w-4xl mx-auto pt-24 px-4">
        <div className="text-center mb-8">
          {session.user.image && (
            <div className="relative mb-6">
              <Image
                src={session.user.image}
                alt="User Photo"
                width={120}
                height={120}
                className="rounded-full mx-auto border-4 border-stone-300 shadow-xl"
              />
            </div>
          )}
          
          <h1 className="text-4xl font-bold mb-2 text-stone-800">
            Welcome back, {session.user.name}!
          </h1>
            {/* Display favorite movies as enhanced tags */}
            {session.user.favoriteMovie && (
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-stone-400 rounded-full"></div>
                  <h3 className="text-2xl font-bold text-stone-800">Your Favorite Movies</h3>
                  <div className="flex-1 h-px bg-stone-300"></div>
                </div>
                
                <div className="grid gap-4 mb-6">
                  {session.user.favoriteMovie.split(',').map((movie: string, index: number) => (
                    <div key={index} className="group relative bg-white p-6 rounded-lg border border-stone-200 hover:border-stone-300 transition-all duration-300 shadow-sm hover:shadow-md">
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
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-2 h-2 bg-stone-400 rounded-full"></div>
                          <span className="text-lg font-semibold text-stone-800 group-hover:text-stone-900 transition-colors duration-300 pr-8">
                            {movie.trim()}
                          </span>
                        </div>
                        <div className="text-sm text-stone-600 group-hover:text-stone-700 transition-colors duration-300">
                          🎬 Click for AI facts
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Add More Movies Button */}
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowAddMovies(!showAddMovies)}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-500 font-medium shadow-md hover:shadow-lg transform ${
                      showAddMovies 
                        ? 'bg-red-600 hover:bg-red-700 text-white scale-105' 
                        : 'bg-stone-600 hover:bg-stone-700 text-white'
                    }`}
                  >
                    <span className={`text-lg transition-transform duration-300 ${
                      showAddMovies ? 'rotate-45' : 'rotate-0'
                    }`}>
                      {showAddMovies ? '✕' : '+'}
                    </span>
                    <span>{showAddMovies ? 'Cancel' : 'Add More Movies'}</span>
                  </button>
                </div>
                
                {/* Add Movies Form */}
                {showAddMovies && (
                  <div className="mt-6 bg-stone-100 p-6 rounded-lg border border-stone-200">
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
                          className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-all duration-300 bg-white placeholder-stone-600"
                          disabled={isManagingMovies}
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={!newMoviesInput.trim() || isManagingMovies}
                          className="flex-1 bg-stone-600 hover:bg-stone-700 disabled:bg-stone-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          {isManagingMovies ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Adding...</span>
                            </>
                          ) : (
                            <>
                              <span>🎬</span>
                              <span>Add Movies</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
            
          {/* Rate limit display */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 bg-stone-100 px-4 py-2 rounded-lg border border-stone-200">
              <span className="text-stone-600 text-sm">Daily AI calls remaining:</span>
              <span className="font-bold text-stone-800">{remainingCalls}/10</span>
            </div>
          </div>

          {selectedMovie && (
            <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-2xl">🎭</span>
                <h3 className="text-xl font-semibold text-stone-800">Behind the Scenes of "{selectedMovie}"</h3>
                {isCached && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full ml-2">
                    💾 Cached
                  </span>
                )}
              </div>
              
              {isLoadingFact ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-stone-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <p className="text-stone-600">Generating fascinating facts...</p>
                </div>
              ) : (
                <div className="relative">
                  <p className="text-stone-700 leading-relaxed text-lg">{movieFact}</p>
                  <div className="absolute -top-2 -left-2 text-4xl text-stone-300">"</div>
                  <div className="absolute -bottom-2 -right-2 text-4xl text-stone-300">"</div>
                </div>
              )}
            </div>
          )}

          {selectedMovie && (
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => fetchMovieFact(selectedMovie, true)}
                disabled={remainingCalls <= 0}
                className="bg-stone-600 hover:bg-stone-700 disabled:bg-stone-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg"
              >
                🎲 New Fact {remainingCalls <= 0 && "(Limit Reached)"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}