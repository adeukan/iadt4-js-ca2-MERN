import React from 'react';
import {Link} from 'react-router-dom';

class Movie extends React.Component {
    constructor(props) {
        super(props);
        this.state = {                                                  // setup the state
            poster_url: '',                                             // full poster URL
            movie: null                                                 // movie object
        };
    }

    render() {
        if (this.props.movie !== null) {                                // skip this at the first rendering to avoid the error
                                                                        // ${} doesn't work here to interpolate the value into string ???
            let poster_url = 'http://image.tmdb.org/t/p/w185' + this.props.movie.info.poster_path;

            var movie =                                                 // the image is used as a React Link
                <Link to={{                                             // to={{...}} is used to send 'id' and 'poser URL' to Info component
                    pathname: '/info',
                    state: {movie: this.props.movie, poster_url: poster_url}
                }}>
                    <img src={poster_url} className="home-poster col-md-2" alt="Poster"/>
                </Link>;
        }

        return (
            movie != null && movie
        );
    }
}

export default Movie;