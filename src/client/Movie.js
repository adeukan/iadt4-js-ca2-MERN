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

  // runs once after component is mounted
  componentDidMount() {

    // use the props to create query URL to get the movie
    let url = `https://api.themoviedb.org/3/movie/ ${this.props.id} ?api_key=a3abe9699d800e588cb2a57107b4179c`;
    axios
      .get(url)
      .then((response) => {
        this.setState({
          movie: response.data,
          poster_url: `http://image.tmdb.org/t/p/w185${response.data.poster_path}`
        });
      })
      .catch((err) => { console.log(err);});
  }

  render() {

    // skip this at the first rendering to adoid 'property of null' error
    if (this.state.movie !== null) {

      var movie =
                // the image is used as a React Link
                // to={{...}} is used for sending 'id' and 'poser URL' to Info component
                <Link to={{ pathname: '/info',
                  state: { movie: this.state.movie, poster_url: this.state.poster_url }
                }}>
                  <img src={this.state.poster_url} className="home-poster col-sm-3 col-md-2" alt="Poster"/>
                </Link>;
    }

    return (
      movie != null && movie
    );
  }
}

export default Movie;