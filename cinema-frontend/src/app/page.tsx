"use client";
import { useMemo, useState } from "react";

type Rating = "G" | "PG" | "PG-13" | "R";
type Status = "current" | "comingSoon";

interface Movie {
    id: string;
    title: string;
    rating: Rating;
    genre: string;
    status: Status;
    poster: string;
    showtimes: string[];
}

const Genres = [
    "Action",
    "Animation",
    "Comedy",
    "Drama",
    "Fantasy",
    "Horror",
    "Romance",
    "Sci-Fi",
    "Thriller",
    "Musical",
];

const Movies: Movie[] = [
    {
        id: "whiplash",
        title: "Whiplash",
        rating: "R",
        genre: "Drama",
        status: "current",
        poster: "https://image.tmdb.org/t/p/w500/lIv1QinFqz4dlp5U4lQ6HaiskOZ.jpg",
        showtimes: ["2:00 PM", "5:00 PM", "8:00 PM"],
    },
    {
        id: "sunset-drive",
        title: "Sunset Drive",
        rating: "PG-13",
        genre: "Drama",
        status: "comingSoon",
        poster: "https://picsum.photos/500/750?random=21",
        showtimes: ["1:15 PM", "4:15 PM", "7:45 PM"],
    },
    {
        id: "nebula-quest",
        title: "Nebula Quest",
        rating: "PG",
        genre: "Sci-Fi",
        status: "comingSoon",
        poster: "https://picsum.photos/500/750?random=22",
        showtimes: ["12:30 PM", "3:30 PM", "6:30 PM"],
    },
    {
        id: "laugh-lines",
        title: "Laugh Lines",
        rating: "PG",
        genre: "Comedy",
        status: "comingSoon",
        poster: "https://picsum.photos/500/750?random=23",
        showtimes: ["2:10 PM", "5:10 PM", "8:10 PM"],
    },
];

export default function Page() {
    const [genres, setGenres] = useState<Set<string>>(new Set());
    const [searchText, setSearchText] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const onSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSearchQuery(searchText.trim());
    };

    const toggleInSet = <T,>(value: T) => (prev: Set<T>): Set<T> => {
        const next = new Set(prev);
        if (next.has(value)) next.delete(value);
        else next.add(value);
        return next;
    };

    const filtered = useMemo(() => {
        return Movies.filter((m) => {
            const matchesTitle =
                !searchQuery || m.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesGenres = genres.size === 0 || genres.has(m.genre);
            return matchesTitle && matchesGenres;
        });
    }, [searchQuery, genres]);

    const current = filtered.filter((m) => m.status === "current");
    const coming = filtered.filter((m) => m.status === "comingSoon");

    return (
        <div className="page">
            <header className="navbar">
                <div className="brand">BookMyShow</div>
            </header>
            <div className="container">
                <aside className="filters">
                    <h3 className="filtersTitle">Search</h3>
                    <div className="filterBlock">
                        <form className="searchBar" onSubmit={onSearchSubmit}>
                            <input
                                id="titleSearch"
                                type="search"
                                className="searchInput"
                                placeholder="Search titles…"
                                aria-label="Search by title"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </form>
                    </div>
                    <h2 className="filtersTitle">Filter By</h2>
                    <div className="filterBlock">
                        <div className="label">GENRE</div>
                        {Genres.map((g) => (
                            <label className="check" key={g}>
                                <input
                                    type="checkbox"
                                    onChange={() => setGenres(toggleInSet<string>(g))}
                                    checked={genres.has(g)}
                                />
                                <span>{g}</span>
                            </label>
                        ))}
                    </div>
                </aside>

                <main className="content">
                    <section className="section">
                        <h1 className="sectionTitle">Currently Showing</h1>
                        {current.length === 0 ? (
                            <p className="empty">No results match your filters.</p>
                        ) : (
                            <div className="cards">
                                {current.map((m) => (
                                    <MovieCard key={m.id} movie={m} />
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="section">
                        <h2 className="sectionTitle">Coming Soon</h2>
                        {coming.length === 0 ? (
                            <p className="empty">No upcoming titles match your filters.</p>
                        ) : (
                            <div className="cards">
                                {coming.map((m) => (
                                    <MovieCard key={m.id} movie={m} />
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            </div>

            <style jsx>{`
        :global(html, body) {
          background: #fff;
          color: #0b0b0b;
        }

        .page {
          min-height: 100svh;
          display: flex;
          flex-direction: column;
        }

        .navbar {
          height: 64px;
          background: black;
          color: #fff;
          display: flex;
          align-items: center;
          padding: 0 24px;
          gap: 24px;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .brand {
          font-weight: 1000;
          font-size: 24px;
          letter-spacing: 0.4px;
          margin-inline: auto;
        }

        .container {
          display: grid;
          grid-template-columns: 175px 1fr;
          gap: 34px;
          padding: 24px;
          max-width: 1450px;
          width: 100%;
          margin: 0 auto;
        }

        .filters {
          border-right: 1px solid #e8e8e8;
          padding-right: 24px;
        }

        .filtersTitle {
          font-size: 28px;
          margin: 0 0 16px;
        }

        .filterBlock {
          margin: 18px 0 24px;
        }

        .label {
          font-weight: 700;
          letter-spacing: 0.4px;
          margin-bottom: 10px;
        }

        .check {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 8px 0;
          font-size: 14px;
        }
        
        .searchBar {
          position: relative;
          width: 100%;
        }
        
        .searchInput {
          width: 100%;
          height: 40px;
          border: 1px solid #dcdcdc;
          border-radius: 999px;
            padding: 0 16px;
          outline: none;
          background: #fff;
        }
        .searchInput:focus {
          border-color: #111;
          box-shadow: 0 0 0 3px rgba(0,0,0,0.06);
        }
        .searchInput::-webkit-search-cancel-button {
          -webkit-appearance: none; 
        }

        .content {
          padding-left: 8px;
        }

        .section {
          margin-bottom: 36px;
        }

        .sectionTitle {
          font-size: 40px;
          font-weight: 800;
          margin: 0 0 16px;
        }
        
        .content .sectionTitle {
            text-align: center;
        }
        
        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }

        .empty {
          opacity: 0.7;
        }

        @media (max-width: 980px) {
          .container {
            grid-template-columns: 1fr;
          }
          .filters {
            border-right: none;
            border-bottom: 1px solid #e8e8e8;
            padding-bottom: 20px;
            margin-bottom: 12px;
          }
        }
      `}</style>
        </div>
    );
}

function MovieCard({ movie }: { movie: Movie }) {
    return (
        <article className="card">
            <div className="posterWrap">
                <img className="poster" src={movie.poster} alt={`${movie.title} poster`} />
            </div>
            <div className="cardBody">
                <div className="title">{movie.title}</div>
                <div className="genre">{movie.genre}</div>
                <div className="showtimes">
                    {movie.showtimes.map((t) => (
                        <span className="outline" key={t}>{t}</span>
                    ))}
                </div>
            </div>

            <style jsx>{`
        .card {
          background: #fff;
          border: 1px solid #ececec;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
          display: flex;
          flex-direction: column;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }
        .posterWrap { position: relative; aspect-ratio: 2 / 3; background: #f5f5f5; }
        .poster { width: 100%; height: 100%; object-fit: cover; display: block; }

        .cardBody {
          padding: 12px 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .title {
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .genre {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          opacity: 0.85;
        }
        .showtimes {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 4px;
        }
        .outline {
          border: 1px solid #d7d7d7;
          border-radius: 999px;
          font-size: 12px;
          padding: 4px 10px;
          line-height: 1;
          white-space: nowrap;
        }
      `}</style>
        </article>
    );
}
