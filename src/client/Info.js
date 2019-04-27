import React from 'react';
import $ from 'jquery';
import axios from 'axios';

class Info extends React.Component {
    constructor(props) {
        super(props);
        this.state = {_id: this.props.location.state.movie._id, runtime: ''};

        this.handleClick = this.handleClick.bind(this);
        this.updateMovie = this.updateMovie.bind(this);
        this.scaleMovie = this.scaleMovie.bind(this);
    }

    // runs after the poster is loaded
    // used to scale the movie block to fit the screen
    // the filled movie object should be passed in at the first rendering, otherwise the movie div is scaled incorrectly
    scaleMovie() {
        let movieDiv = $('.info-content');                           // reference to movie div
        let movieHeight = movieDiv.height();                         // initial movie height (without padding, margin and borders)
        let winHeight;                                               // window height
        let ratio;                                                   // ratio between them

        if (WURFL.form_factor === "Desktop") {
            ratio = window.innerHeight / movieHeight;
            movieDiv.css({zoom: ratio});                             // scale movie
            movieHeight = movieDiv.height();                         // save actual movie height (to further track changes)
        }
        else if (WURFL.form_factor === "Smartphone" || WURFL.form_factor === "Tablet") {
            ratio = window.screen.height / movieHeight;              // ratio between screen height and movie height
            movieDiv.css({zoom: ratio});
            movieHeight = movieDiv.height();                         // save actual movie height (to further track changes)
        }

        let oldWinHeight = window.innerHeight;                       // initial size of window and screen
        let oldWinWidth = window.innerWidth;
        let oldScreenWidth = window.screen.width;
        let oldScreenHeight = window.screen.height;

        setInterval(function () {                                    // rescale movie if screen changed or window (or movie) were resized
            let screenWidth = window.screen.width;                   // actual screen width
            let screenHeight = window.screen.height;                 // actual screen height

            // check whether the screen has changed
            if ((WURFL.form_factor == "Smartphone" || WURFL.form_factor == "Tablet") && (screenWidth !== oldScreenWidth || screenHeight !== oldScreenHeight)) {

                movieDiv.css({zoom: 1});                             // restore initial zoom
                movieHeight = movieDiv.height();                     // get actual movie height
                ratio = window.screen.height / movieHeight;          // get actual ratio
                movieDiv.css({zoom: ratio});                         // rescale movie
                movieHeight = movieDiv.height();                     // save actual movie height (to further track changes)

                oldScreenWidth = screenWidth;                        // update variables for next use
                oldScreenHeight = screenHeight;
                oldWinHeight = window.screen.height;
                oldWinWidth = window.screen.width;
                return;                                              // early exit
            }

            // check whether the window or movie were resized in desktop mode
            if (WURFL.form_factor == "Desktop" && (movieDiv.height() !== movieHeight || window.innerHeight !== oldWinHeight || oldWinWidth !== window.innerWidth)) {

                movieDiv.css({zoom: 1});
                movieHeight = movieDiv.height();
                winHeight = window.innerHeight;
                ratio = window.innerHeight / movieHeight;
                movieDiv.css({zoom: ratio});
                movieHeight = movieDiv.height();                     // save actual movie height (to further track changes)

                oldWinHeight = window.innerHeight;                   // update variables for next use
                oldWinWidth = window.innerWidth;
            }
        }, 100);
    }

    handleClick(event) {
        let name = event.target.getAttribute('name');
        let value = event.target.getAttribute('value');

        this.setState({
            [name]: prompt('Please edit the selected field:', value)
        }, this.updateMovie);
    }

    updateMovie() {
        axios.put('/api/movies', this.state)
            .catch(error => {
                console.log(error);
            });
    }

    render() {

        let movie;
        if (String(window.performance.getEntriesByType("navigation")[0].type) === "reload")
        // Todo: get request to DB to get updated movie object and replace next line
            movie = this.props.location.state.movie;
        else
            movie = this.props.location.state.movie;


        if (movie !== null) {

            // check the movie properties and create elements if needed
            var poster_url = this.props.location.state.poster_url;
            if (poster_url.length > 30) {
                var poster = (
                    <li className="list-group-item poster">
                        <img src={this.props.location.state.poster_url} className="info-poster" onLoad={this.scaleMovie}
                             alt="Poster"/>
                    </li>
                );
                var side_poster = (
                    <div className="info-left-col">
                        <img src={this.props.location.state.poster_url} className="side_poster" alt="Poster"/>
                    </div>
                );
            }


            if (movie.info.title !== '')
                var title = (
                    <li className="list-group-item active info-title">{movie.info.title}</li>
                );

            // EDITABLE PROPERTY
            var runtime = null;
            if (this.state.runtime !== '') {
                runtime = <li className="list-group-item"
                              name="runtime"
                              value={this.state.runtime}
                              onClick={this.handleClick}> {this.state.runtime} minutes</li>;
            }
            else if (movie.info.runtime !== '') {
                runtime = <li className="list-group-item"
                              name="runtime"
                              value={movie.info.runtime}
                              onClick={this.handleClick}>{movie.info.runtime} minutes</li>;
            }

            if (movie.info.tagline !== '')
                var tagline = <li className="list-group-item">"{movie.info.tagline}"</li>;

            if (movie.info.release_date !== '')
                var year = (
                    <li className="list-group-item">{movie.info.release_date.substring(0, 4)}</li>
                );

            if (movie.info.overview !== '')
                var overview = (
                    <li className="list-group-item info-overview"> {movie.info.overview}</li>
                );
            if (movie.info.homepage !== null)
                var homepage = (
                    <li className="list-group-item">
                        <a href={movie.info.homepage}>Home Page</a>
                    </li>
                );

            // get the set of genres and create the element if needed
            var genreString = "";
            if (movie.info.genres.length > 0) {
                var genres = movie.info.genres;
                genres.forEach((genre, index) => {
                    genreString = genreString + genre.name;
                    if (genres[index + 1] != null)
                        genreString = genreString + " | ";
                });
                genres = (<span> {genreString} </span>);
            }

            // get the set of countries and create the element if needed
            var countryString = "";
            if (movie.info.production_countries.length > 0) {
                var countries = movie.info.production_countries;
                countries.forEach((country, index) => {
                    countryString = countryString + country.name;
                    if (genres[index + 1] != null)
                        countryString = countryString + " | ";
                });
                countries = (<span> {countryString} </span>);
            }
        }

        // return the prepared elements if they exist
        return (
            <div className="info-wrapper">
                <div className="info-content">
                    {side_poster != null && side_poster}
                    <div className={"info-right-col"}>
                        <ul className="list-group panel-body info-list">
                            {title != null && title}
                            {genres != null && <li className="list-group-item"> {genres} </li>}
                            {runtime != null && runtime}
                            {poster != null && poster}
                            {tagline != null && tagline}
                            {homepage != null && homepage}
                            {countries != null && <li className="list-group-item"> {countries} </li>}
                            {year != null && year}
                            {overview != null && overview}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

export default Info;
