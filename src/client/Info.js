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
        this.scaleMobile = this.scaleMobile.bind(this);
    }

    // runs after the poster is loaded
    // used to scale the movie block to fit the screen
    // the ready movie object should be passed in at the first rendering, otherwise the movie div is scaled incorrectly
    scaleMovie() {
        var movieWrapper = $('.info-wrapper');                                              // reference to movie wrapper (or simply 'movie')
        var movieHeight = movieWrapper.height();                                            // initial movie height (without padding and etc.)
        var winHeight;                                                                      // window height
        var heightRatio;                                                                    // ratio between them
        var self = this;

        if (WURFL.form_factor === "Desktop") {                                              // WURFL works good at start, but not on the fly

            heightRatio = window.innerHeight / movieHeight;                                 // find the ratio and scale 'movie'
            // 'zoom' is very problematic CSS property
            // it's impossible to get the correct block height after using the 'zoom'
            // (CSS 'scale' is not suitable because it doesn't save the form factor of the <ul>, but only wrapper)
            // so, I have to calculate updated 'movie' height in advance instead of measuring it after zooming
            movieHeight = movieWrapper.height() * heightRatio;
            movieWrapper.css('cssText', 'position: absolute;' +                             // scale 'movie'
                'zoom:' + heightRatio );
        }
        else if (WURFL.form_factor === "Smartphone" || WURFL.form_factor === "Tablet") {    // if smart phone
            this.scaleMobile();                                                             // make calculations and scale 'movie'
        }

        var oldWinHeight = window.innerHeight;                                              // initial window & screen sizes
        var oldWinWidth = window.innerWidth;                                                // used to detect size changes
        var oldScreenWidth = window.screen.width;
        var oldScreenHeight = window.screen.height;

        setInterval(function () {                                                           // check size changes and rescale 'movie'

            // if mobile in use and screen has changed (rough detection but the only one that worked for me)
            if ((window.navigator.maxTouchPoints === 1 /* || 'ontouchstart' in document */ )
                && (window.screen.width !== oldScreenWidth || window.screen.height !== oldScreenHeight)) {

                self.scaleMobile();                                                         // make calculations and scale 'movie'
                oldScreenWidth = window.screen.width;                                       // update variables to detect changes next time
                oldScreenHeight = window.screen.height;
                oldWinHeight = window.screen.height;
                oldWinWidth = window.screen.width;
            }

            // if desktop in use and window has changed
            if ((window.navigator.maxTouchPoints !== 1 /* || 'ontouchstart' in document */)
                && (movieWrapper.height() !== movieHeight || window.innerHeight !== oldWinHeight || oldWinWidth !== window.innerWidth)) {

                movieWrapper.css('cssText', 'zoom: 1;' );                                   // reset zoom value before new scaling
                winHeight = window.innerHeight;                                             // get actual window height
                heightRatio = window.innerHeight / movieWrapper.height();                   // find ratio between 'movie' and window height
                movieWrapper.css('cssText', 'position: absolute;' +                         // and scale 'movie'
                    'zoom:' + heightRatio );

                oldWinHeight = window.innerHeight;                                          // update variables to detect changes next time
                oldWinWidth = window.innerWidth;
                oldScreenWidth = window.screen.width;
                oldScreenHeight = window.screen.height;
            }
        }, 1000); // end of setInterval()
    }

    scaleMobile() {
        var movieWrapper = $('.info-wrapper');                                              // reference to info page wrapper
        var rightCol = $('.info-right-col');                                                // reference to right col in landscape mode
        var ulMovie = $('ul');                                                              // reference to unordered list with 'movie' info
        var poster = $('img');                                                              // reference to poster in landscape mode
        var newMovieHeight;                                                                 // new 'movie' height after scaling
        var scale;                                                                          // 'movie' height to screen height ratio (zoom scale)
        var orientation = ((window.screen.height - window.screen.width) > 0)                // screen orientation
            ? 'portrait' : 'landscape';

        ulMovie.css('cssText', 'zoom: 1;' );                                                // clear zoom values before next scaling
        movieWrapper.css('cssText', 'zoom: 1;' );

        var screenFormfactor = window.screen.height / window.screen.width;                  // screen height to length ratio
        var movieFormfactor = ulMovie.height() / ulMovie.width();                           // 'movie' height to length ratio
        var rightColFormfactor = rightCol.height() / rightCol.width();                      // right col height to length ratio

        if(orientation === 'portrait') {                                                    // if portrait mode

            // 'movie' height should be reduced to fit the screen form factor
            if (screenFormfactor < movieFormfactor && (movieFormfactor - screenFormfactor < 0.3)) {
                movieWrapper.css('cssText', 'position: absolute;' +                         // shift 'movie' to centre
                                            'top:50%;' +
                                            'left:50%;' +
                                            'transform: translate(-50%, -50%);'
                );

                // direct changing the 'movie' height will not give any result as the <ul> content will not be stretched
                // instead, I increase the width until reach the desired form factor
                for(let i = 100; i <= 200; i=i+0.1) {
                    ulMovie.css('cssText', 'width:' + i + '%;');                            // increase 'movie' width a little
                    movieFormfactor = ulMovie.height() / ulMovie.width();                   // check new 'movie' form factor

                    // if form factors almost match, find ratio and scale 'movie'
                    if((screenFormfactor - movieFormfactor) < 0.1 && (screenFormfactor - movieFormfactor) > 0) {
                        scale = window.screen.height / ulMovie.height();
                        ulMovie.css('cssText', 'zoom:' + scale * 0.9 + ';');
                        break;
                    }
                }
            }
            // 'movie' height should be increased to fit the screen form factor (opposite to the described above)
            else if (screenFormfactor > movieFormfactor) {
                movieWrapper.css('cssText', 'position: absolute;' +
                    'top:50%;' +
                    'left:50%;' +
                    'transform: translate(-50%, -50%);'
                );
                for(let i = 100; i > 0; i=i-0.1) {
                    ulMovie.css('cssText', 'width:' + i + '%;');
                    movieFormfactor = ulMovie.height() / ulMovie.width();

                    if((screenFormfactor - movieFormfactor) < 0.1 && (screenFormfactor - movieFormfactor) > 0) {
                        scale = window.screen.height / ulMovie.height();
                        ulMovie.css('cssText', 'zoom:' + scale * 0.9 + ';');
                        break;
                    }
                }
            }
            // if form factors match
            else {
                movieWrapper.css('cssText', 'height: 100vh; position: absolute;');
            }
        }

        // LANDSCAPE (similar to described above)
        else if(orientation === 'landscape') {
            scale = rightCol.height() / ulMovie.height();                                   // container height to 'movie' height ratio

            if(rightColFormfactor > movieFormfactor) {
                for(let i = 100; i > 0; i=i-0.1) {
                    ulMovie.css('cssText', 'width:' + i + '%;');                            // decrease 'movie' width a little
                    movieFormfactor = ulMovie.height() / ulMovie.width();

                    // if form factors almost match, find ratio and scale 'movie'
                    if((rightColFormfactor - movieFormfactor) < 0.08 && (rightColFormfactor - movieFormfactor) > 0) {

                        scale = rightCol.height() / ulMovie.height();
                        newMovieHeight = ulMovie.height() * scale * 0.87;                   // calculate updated 'movie' height in advance
                        ulMovie.css('cssText', 'zoom:' + scale * 0.87 + ';');
                        break;
                    }
                }
            }
            else if (rightColFormfactor < movieFormfactor) {
                for(let i = 100; i < 200; i=i+0.1) {
                    ulMovie.css('cssText', 'width:' + i + '%;');
                    movieFormfactor = ulMovie.height() / ulMovie.width();
                    if((rightColFormfactor - movieFormfactor) < 0.08 && (rightColFormfactor - movieFormfactor) > 0) {
                        newMovieHeight = ulMovie.height() * scale * 0.95;                   // calculate updated 'movie' height in advance
                        ulMovie.css('cssText', 'zoom:' + scale * 0.95 + ';');
                        break;
                    }
                }
            }
            else {
                newMovieHeight = ulMovie.height() * scale * 0.95;
                ulMovie.css('cssText', 'zoom:' + scale * 0.95 + ';');
            }

            scale = poster.height() / newMovieHeight;                                       // add appropriate padding for the poster
            if (scale > 1) {
                scale = 2 - scale;
                poster.css('cssText', 'transform: scale(' + scale + ');');
            }
            else if (scale < 1) {
                poster.css('cssText', 'transform: scale(' + scale + ');');
            }
        }
    }

    // CLICK HANDLER
    // currently works with 'runtime' only, but can be used to handle other fields' clicks
    handleClick(event) {
        let name = event.target.getAttribute('name');
        let value = event.target.getAttribute('value');

        // prompt user to update the selected field and save result in DB
        this.setState({
            [name]: prompt('Please edit the selected field:', value)
        }, this.updateMovie);
    }

    // save updated document in DB
    updateMovie() {
        axios.put('/api/movies', this.state)
            .catch(error => {
                console.log(error);
            });
    }

    render() {

        let movie;
        // if some field is updated by user and then the page is reloaded in the browser,
        // the actual state will be lost and we need to make request to DB to get the updated document
        if (String(window.performance.getEntriesByType("navigation")[0].type) === "reload")
        // Todo: get request to DB to get updated movie object and replace next line
            movie = this.props.location.state.movie;
        else
            movie = this.props.location.state.movie;

        if (movie !== null) {
            // check the movie properties and create html elements where necessary

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

            // EDITABLE PROPERTY 'RUNTIME'
            var runtime = null;
            if (this.state.runtime !== '') {                                        // if runtime was updated by the user
                runtime = <li className="list-group-item"
                              name="runtime"
                              value={this.state.runtime}
                              onClick={this.handleClick}> {this.state.runtime} minutes</li>;
            }
            else if (movie.info.runtime !== '') {                                   // if runtime was not updated by the user
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

            var genreString = "";                                                   // get the set of genres and create element
            if (movie.info.genres.length > 0) {
                var genres = movie.info.genres;
                genres.forEach((genre, index) => {
                    genreString = genreString + genre.name;
                    if (genres[index + 1] != null)
                        genreString = genreString + " | ";
                });
                genres = (<span> {genreString} </span>);
            }

            var countryString = "";                                                 // get the set of countries and create the element
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

        return (                                                                    // return the prepared elements if they exist
            <div className="info-wrapper">
                <div className="info-content">
                    {side_poster != null && side_poster}
                    <div className={"info-right-col"}>
                        <ul className="list-group panel-body">
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
