import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

class Movie extends React.Component {
  constructor(props) {
    super(props);
    // setup the state
    this.state = {
      // full poster URL
      poster_url: '',
      // movie object
      movie: null
    };
  }

  render() {

    // skip this at the first rendering to adoid 'property of null' error
    if (this.props.movie !== null) {

      let poster_url = 'http://image.tmdb.org/t/p/w185' + this.props.movie.info.poster_path;

      var movie =
                // the image is used as a React Link
                // to={{...}} is used for sending 'id' and 'poser URL' to Info component
                <Link to={{ pathname: '/info',
                  state: { movie: this.props.movie, poster_url: poster_url }
                }}>
                  <img src={poster_url} className="home-poster col-sm-3 col-md-2" alt="Poster"/>
                </Link>;
    }

    return (
      movie != null && movie
    );
  }
}

export default Movie;