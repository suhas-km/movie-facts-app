import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function HomePage() {
  const { data: session, status } = useSession();
  const [movieInput, setMovieInput] = useState("");
  const [movieFact, setMovieFact] = useState("");
  const [isLoadingFact, setIsLoadingFact] = useState(false);

  // Effect to fetch a movie fact when the page loads or refreshes
  useEffect(() => {
    const fetchMovieFact = async () => {
      if (session?.user?.favoriteMovie) {
        setIsLoadingFact(true);
        try {
          const res = await fetch("/api/movie/fact");
          const data = await res.json();
          if (res.ok) {
            setMovieFact(data.fact);
          } else {
            setMovieFact("Error: " + data.message);
          }
        } catch (error) {
          setMovieFact("Failed to fetch movie fact.");
        }
        setIsLoadingFact(false);
      }
    };

    fetchMovieFact();
  }, [session?.user?.favoriteMovie]);

  // Handler for submitting the user's favorite movie
  const handleSaveMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieInput) return;

    const res = await fetch("/api/user/update-movie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favoriteMovie: movieInput }),
    });

    if (res.ok) {
      // A simple reload to re-fetch the session with the new movie data
      window.location.reload();
    } else {
      alert("Failed to save movie.");
    }
  };

  if (status === "loading") {
    return <div className="text-center mt-10">Loading...</div>;
  }

  // Not logged in
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <h1 className="text-4xl font-bold mb-4 text-gray-100">Welcome to My Movie App!</h1>
        <p className="mb-8 text-gray-300 text-lg">Please sign in to continue.</p>
        <button
          onClick={() => signIn("google")}
          className="bg-gray-200 text-gray-900 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  // Logged in, but no favorite movie set yet
  if (!session.user.favoriteMovie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="absolute top-6 right-6">
          <button
            onClick={() => signOut()}
            className="bg-gray-800 text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 border border-gray-600"
          >
            Sign out
          </button>
        </div>
        
        {session.user.image && (
          <Image
            src={session.user.image}
            alt="User Photo"
            width={80}
            height={80}
            className="rounded-full mb-6 border-2 border-gray-600"
          />
        )}
        <h1 className="text-4xl font-bold mb-6 text-gray-100">Hi, {session.user.name}!</h1>
        <p className="mb-8 text-gray-300 text-lg">What&apos;s your favorite movie?</p>
        <form onSubmit={handleSaveMovie} className="flex flex-col gap-6 w-full max-w-md">
          <input
            type="text"
            value={movieInput}
            onChange={(e) => setMovieInput(e.target.value)}
            placeholder="e.g., The Matrix"
            required
            className="px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent text-lg"
          />
          <button
            type="submit"
            className="bg-gray-200 text-gray-900 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-lg font-medium"
          >
            Save My Movie
          </button>
        </form>
      </div>
    );
  }

  // Logged in with favorite movie
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-4">
      <div className="bg-gray-900 p-8 rounded-lg border border-gray-700 w-full max-w-lg text-center">
        {session.user.image && (
          <Image
            src={session.user.image}
            alt="User Photo"
            width={100}
            height={100}
            className="rounded-full mx-auto mb-6 border-2 border-gray-600"
          />
        )}
        <h1 className="text-4xl font-bold mb-3 text-gray-100">Hello, {session.user.name}!</h1>
        <p className="text-gray-300 mb-8 text-lg">{session.user.email}</p>

        <h2 className="text-2xl font-semibold mb-6 text-gray-100">
          Your Favorite Movie is:{" "}
          <span className="text-gray-100 font-bold">{session.user.favoriteMovie}</span>
        </h2>

        <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-gray-600">
          <p className="font-semibold text-gray-100 mb-3">💡 An interesting fact:</p>
          {isLoadingFact ? (
            <p className="text-gray-300 mt-2">Loading a new fact...</p>
          ) : (
            <p className="text-gray-200 mt-2 leading-relaxed">{movieFact}</p>
          )}
        </div>

        <button
          onClick={() => signOut()}
          className="mt-8 bg-gray-800 text-gray-200 px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 border border-gray-600"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}