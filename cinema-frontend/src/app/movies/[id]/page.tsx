//Specific movie details page with showtimes linking to booking page
"use client";
import React from "react";
import Link from "next/link";
import {useState, useEffect} from "react";

 
export default function MovieDetails() {
    const [date, setDate] = useState("");

    // Save selected date to localStorage whenever it changes
    useEffect(() => {
        if (date) {
            localStorage.setItem("selectedDate", date);
        }
    }, [date]);
    //Hardcoded movie details for testing
	const movie = {
		id: "1",
		title: "Crazy Rich Asians",
		rating: "PG-13",
		description: "Woman discovers her boyfriend is rich and goes to Singapore.",
		posterUrl: "https://m.media-amazon.com/images/M/MV5BMTYxNDMyOTAxN15BMl5BanBnXkFtZTgwMDg1ODYzNTM@._V1_FMjpg_UX1000_.jpg",
		showtimes: ["2:00 PM", "5:00 PM", "8:00 PM"],
		trailerUrl: "https://www.youtube.com/embed/ZQ-YX-5bAs0",
	};

	return (
		<div style={{ backgroundColor: "#fff", top: 0, left: 0, right: 0, bottom: 0, margin: 0, padding: 0}}>
            <header className="navbar">
                <div className="brand">BookMyShow</div>
            </header>
			<div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "8px", padding: "20px"}}>
				<img src={movie.posterUrl} alt={movie.title} style={{ width: 200, borderRadius: 12, marginRight: "20px" }} />
				<div>
					<h1 style={{color: "black", fontSize: "40px", fontWeight: "bold"}}>{movie.title}</h1>
					<p style={{color: "black"}}> <strong>Rating:</strong> {movie.rating}</p>
					<p style={{color: "black"}}><strong>Description:</strong> {movie.description}</p>
                    
                    {/*Date input box*/}
                    <div
                        style={{
                        marginTop: "8px",
                        marginBottom: "8px",
                        padding: "4px",
                        border: "1px solid #ddd",
                        borderWidth: "1px",
                        borderRadius: "8px",
                        backgroundColor: "#f9f9f9",
                        maxWidth: "190px",
                        marginLeft: "0px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start"
                        }}
                    >
                        <h2 style={{ color: "black", marginBottom: "6px", textAlign: "left", fontSize: "15px", marginLeft: "1px" }}><strong>Select Date:</strong></h2>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            style={{
                                width: "100px",
                                padding: "5px",
                                border: "1px solid #bbb",
                                borderRadius: "3px",
                                fontSize: "12px",
                                color: "black",
                                marginLeft: "38px",
                            }}
                        />
                    </div>

					<h2 style={{color: "black"}}><strong>Showtimes (select one below):</strong></h2>
					{/*List of showtimes as clickable links to booking page*/}
					<ul style={{ listStyle: "none", padding: 0}}>
                        {movie.showtimes.map((time) => {
                            // Build booking link (with date)
                            let href = `/booking?title=${encodeURIComponent(movie.title)}&time=${encodeURIComponent(time)}`;
                            if (date) {
                                href += `&date=${encodeURIComponent(date)}`;
                            }
                            return (
                                <li key={time}>
                                    <Link 
                                        href={href}
                                        style = {{
                                            display: "inline-block",
                                            padding: "8px 16px",
                                            margin: "4px",
                                            backgroundColor: "#000000ff",
                                            color: "white",
                                            borderRadius: "8px",
                                            textDecoration: "none",
                                            fontWeight: "bold",
                                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                            transition: "background-color 0.3s ease",
                                            cursor: "pointer"
                                        }}
                                    >
                                        {time}
                                    </Link>
                                </li>
                            );
                        })}
					</ul>
				</div>
			</div>
		   {/* Embedded trailer*/}
			<div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", marginTop: "8px" }}>
				<h2 style={{fontSize: "20px", fontWeight: "bold", color: "black", marginBottom: "15px" }}>Trailer</h2>
				<iframe 
                    style = {{marginBottom: "20px", borderRadius: 12}}
					width="500"
					height="300"
					src={movie.trailerUrl}
					title="Movie Trailer"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
				/>
			</div>
		</div>
	);
}

