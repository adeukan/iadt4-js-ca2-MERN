import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Route} from 'react-router-dom';
import axios from 'axios';
import Movie from './Movie';
import Info from './Info';
import './styles.css';


class MovieList extends React.Component {
  constructor(props) {
    super(props);
    // this is where we store the result of API query
    this.state = {movies: []};
  }

  // runs once after component is mounted
  componentDidMount() {
    // url query for all popular movies
    let url =
            'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=a3abe9699d800e588cb2a57107b4179c';
    // get all popular movies from TMDb
    axios
      .get(url)
      .then((response) => {
        // store the movies in state
        this.setState({movies: response.data.results});
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    // use the first 12 movies to get the array of Movie components
    const movieList = this.state.movies.slice(0, 12).map(movie => (
      <Movie
        key={movie.id}
        id={movie.id}
        poster_id={movie.poster_path}
      />
    ));

    return (<div className="panel-body home-wrapper"> {movieList} </div>);
  }
} // end of MovieList component


class App extends React.Component {
  render() {
    return (
    // React Routes; Movie posters are used as Links
      <BrowserRouter>
        <div className="main-wrapper">
          <Route exact path="/" component={MovieList}/>
          <Route path="/info" component={Info}/>
        </div>
      </BrowserRouter>
    );
  }
}

ReactDOM.render(<App/>, document.getElementById('root'));