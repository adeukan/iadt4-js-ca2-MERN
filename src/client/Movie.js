import React from 'react';
import {Link} from 'react-router-dom';

class Movie extends React.Component {
   constructor(props) {
      super(props);
      this.state = {                                          // setup the state
         poster_url: '',                                      // full poster URL
         movie: null                                          // movie object
      };
   }

   render() {
      const poster_url = this.props.movie &&                  // skip at first rendering to avoid the error
          `http://image.tmdb.org/t/p/w185${this.props.movie.info.poster_path}`;

      const movie =                                           // the image is used as a React Link
         <Link to={{                                          // to={{...}} is used to send 'id' and 'poser URL' to Info component
            pathname: '/info',
            state: {movie: this.props.movie, poster_url: poster_url}
         }}>
            <img src={poster_url} className='home-poster col-md-2' alt='Poster'/>
         </Link>;

      if (movie) return movie;
   }
}

export default Movie;