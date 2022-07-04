// Global Constants
const API_KEY = "ADD_API_KEY";

const movieArea = document.querySelector(".movie-area");
const loadMore = document.querySelector("#load-more");
const movieListTypes = document.querySelectorAll(".movie-list-type");
const movieListTitle = document.querySelector(".movie-list-title");
const backdropPoster = document.querySelector(".backdrop-poster");
const movieInfo = document.querySelector(".movie-info");
const movieOverview = document.querySelector(".movie-overview");
const movieTrailer = document.querySelector(".movie-trailer");
const trailerPopupClose = document.querySelector("#trailer-popup-close");
const searchItem = document.querySelector("#search-item");
const searchForm = document.querySelector("#search-form");
const clearButton = document.querySelector("#clear-button");
var pages = 1;
var searchPages = 0;
var movieListType = "popular";
var searchTerm = "";
const movieListTitles = {
    "popular": "Popular",
    "now_playing": "Now Playing",
    "upcoming": "Upcoming",
    "top_rated": "Top Rated"
}
async function getResults(type) {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${type}?api_key=${API_KEY}&page=${pages}`);
        const data = await res.json(); 
        if (pages == data.total_pages) {
            loadMore.style.visibility = "hidden";
        } else {
            loadMore.style.visibility = "visible";
        }
        return data.results;
    } catch (error) {
        console.error(error); 
        return [];      
    }
   
}
async function searchMovies(q) {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${q}&page=${searchPages}&include_adult=false`);
        const data = await res.json();
        if (searchPages == data.total_pages) {
            loadMore.style.visibility = "hidden";
        } else {
            loadMore.style.visibility = "visible";
        }
        return data.results;
    } catch (error) {
        console.error(error); 
        return [];      
    }
   
}
async function getMovieDetails(id) {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`);
        const data = await res.json(); 
        return data;
    } catch (error) {
        console.error(error); 
        return null;      
    }
}
async function getMovieTrailers(id) {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/trailers?api_key=${API_KEY}`);
        const data = await res.json(); 
        return data.youtube;
    } catch (error) {
        console.error(error); 
        return null;      
    }
}

async function addMovieDetails(id) {
    const movie = await getMovieDetails(id);
    if (movie != null) {
        let releaseDate = movie.release_date;
        let genre = movie.genres.map(g => g.name).join(', ');
        movieInfo.textContent = `${movie.runtime} min | ${releaseDate} | ${genre} | ★ ${movie.vote_average}`;
        backdropPoster.src = `https://image.tmdb.org/t/p/w780/${movie.backdrop_path}`;
        backdropPoster.alt = `${movie.original_title} Backdrop Poster`   
        movieOverview.textContent = movie.overview;
    } else {
        movieInfo.textContent = 'Sorry! No information is available.';
    }
    

}
async function addMovieTrailer(id) {
    const trailers = await getMovieTrailers(id);
    if (trailers != null && trailers.length > 0) {
        movieTrailer.src = `https://www.youtube.com/embed/${trailers[0].source}`;
    } else {
        movieTrailer.src = 'https://www.youtube.com/embed/lJIrF4YjHfQ';
    }
    

}

function displayResults(response) {    
    response.forEach((movie) => {
        if (movie.poster_path != null) {
            const newDiv = document.createElement('div');
            const newMovieImg = document.createElement('img');
            const newMovieRating = document.createElement('span');
            const newMovieTitle = document.createElement('span');
            const newRatingDiv = document.createElement('div');
            const newTrailerButton = document.createElement('button');
            const newRatingIcon = document.createElement('span');
            const newRatingIconGroup = document.createElement('div');         
            newMovieImg.src = `https://image.tmdb.org/t/p/w342/${movie.poster_path}`;
            newMovieImg.alt = `${movie.title} Poster`;
            newRatingIcon.innerHTML = '<i class="fa-solid fa-star" style="color:#f3c221"></i> ';
            newMovieRating.textContent = movie.vote_average;
            newMovieTitle.textContent = movie.title;
            newTrailerButton.innerHTML = '<i class="fa-solid fa-circle-play"></i> Play Trailer';
            newRatingDiv.classList.add("rating-div");
            newRatingIconGroup.append(newRatingIcon, newMovieRating);
            newRatingDiv.append(newRatingIconGroup, newTrailerButton);
            newDiv.classList.add("movie-item");
            newMovieImg.setAttribute("data-bs-toggle", "modal");
            newMovieImg.setAttribute("data-bs-target", "#staticBackdrop");
            newMovieImg.classList.add("movie-poster")
            newTrailerButton.setAttribute("data-bs-toggle", "modal");
            newTrailerButton.setAttribute("data-bs-target", "#trailer-popup");
            newTrailerButton.classList.add("btn", "btn-outline-warning")
            newMovieImg.addEventListener("click", () => addMovieDetails(movie.id));
            newTrailerButton.addEventListener("click", () => addMovieTrailer(movie.id));    
            newDiv.append(newMovieImg, newRatingDiv, newMovieTitle);
            movieArea.append(newDiv);
        }
    })

}

async function loadMovies() {
    searchPages = 0;
    pages = 1;
    movieListTitle.textContent = movieListTitles[movieListType];
    movieArea.textContent = '';
    const res = await getResults(movieListType);
    displayResults(res);
}

async function showMoreMovies() {
    if (pages >= 1) {
        pages += 1;
        const res = await getResults(movieListType);
        displayResults(res);
    } else if (searchPages >= 1) {
        searchPages += 1;
        const res = await searchMovies(searchTerm);
        displayResults(res);
    }    
           
}
function stopVideo() {
    var iframeSrc = movieTrailer.src;
    movieTrailer.src = iframeSrc;
}
async function handleFormSubmit(event) {
    event.preventDefault();     
    pages = 0;
    searchPages = 1;
    movieListTitle.textContent = "";
    movieArea.textContent = '';
    searchTerm = searchItem.value;
    const res = await searchMovies(searchTerm);
    displayResults(res);
    searchItem.value = '';
    
}
function handleClearEvent() {
    movieArea.textContent = '';
    loadMovies();
}

window.onload = function () {
    // execute your functions here to make sure they run as soon as the page loads
    loadMovies();
    loadMore.addEventListener('click', showMoreMovies);
    movieListTypes.forEach((type) => type.addEventListener('click', () => {
        movieListType = type.value;
        loadMovies();
    }));
    trailerPopupClose.addEventListener('click', stopVideo);
    searchForm.addEventListener('submit', handleFormSubmit);
    clearButton.addEventListener('click', handleClearEvent);
}
