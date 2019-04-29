import React from 'react';
import ReactDOM from 'react-dom';
import {HashRouter, Route} from 'react-router-dom';
import axios from 'axios';
import Movie from './Movie';
import Info from './Info';
import './styles.css';

class MovieList extends React.Component {
   constructor(props) {
      super(props);
      this.state = {movies: []};                                        // this is where we store the result of API query
   }

   componentDidMount() {                                                // runs once after component is mounted
      this.updateMovies();
   }

   updateMovies() {
      axios.get('api/movies')
         .then(response => {
            this.setState({movies: response.data});
         })
         .catch(error => {
            console.log(error);
         });
   }

   render() {                                                           // use first 12 movies to get the array of Movies
      const movieList = this.state.movies.slice(0, 12).map(movie => (
         <Movie
            key={movie.id}
            movie={movie}
         />
      ));
      return (<div className='panel-body home-wrapper'>{movieList}</div>);
   }
}

class App extends React.Component {
   render() {                                                           // React Routes; Movie posters are used as Links
      return (
         <HashRouter>
            <div className='main-wrapper'>
               <Route exact path='/' component={MovieList}/>
               <Route path='/info' component={Info}/>
            </div>
         </HashRouter>
      );
   }
}

ReactDOM.render(<App/>, document.getElementById('root'));