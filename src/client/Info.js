import React from 'react';
import $ from 'jquery';
import axios from 'axios';
import {ResizeSensor} from 'css-element-queries';

class Info extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         _id: this.props.location.state.movie._id,
         runtime: '',
         counter: 0
      };
      this.handleClick = this.handleClick.bind(this);
      this.updateMovie = this.updateMovie.bind(this);
      this.resetScaling = this.resetScaling.bind(this);
      this.scaleMovie = this.scaleMovie.bind(this);
      Info.scalePortrait = Info.scalePortrait.bind(this);
      Info.scaleLandscape = Info.scaleLandscape.bind(this);
   }

   componentWillUnmount() {
      window.removeEventListener('resize', this.resetScaling, false);                      // remove window resize listener
   }

   resetScaling() {
      console.log(`resetScaling() - ${this.state.counter}`);
      $('ul').css('cssText', 'zoom:normal;');                                              // clear zoom before next scaling
      $('.info-wrapper').css('cssText', 'zoom:normal;');
      this.scaleMovie();
   }

   // triggered after the poster image is loaded, otherwise the movie div is scaled incorrectly
   // used to scale the movie block to fit the screen
   scaleMovie() {
      console.log(`scaleMovie() - ${this.state.counter}`);
      const wrapper = $('.info-wrapper');

      this.setState(prevState => ({
         counter: prevState.counter + 1
      }), () => {                                                                          // setState callback

         if (window.navigator.maxTouchPoints || 'ontouchstart' in document) {              // if mobile
            if (window.screen.height - window.screen.width > 0)
               Info.scalePortrait();                                                       // scale in portrait mode
            else
               Info.scaleLandscape();                                                      // scale in landscape mode

         } else {                                                                          // if desktop
            const ratio = window.innerHeight / wrapper.height();                           // window height to 'movie' height ratio
            wrapper.css('cssText', `position:absolute; zoom:${ratio}`);                    // scale 'movie'
         }
         if (this.state.counter === 1) {
            window.addEventListener('resize', this.resetScaling, false);                   // window resize listener
            new ResizeSensor($('.info-content'), this.resetScaling, false);                // movie info-container resize listener
            // using ResizeSensor leads to an additional number of rendering cycles,
            // which would be desirable to avoid
         }
      });
   }

   static scalePortrait() {
      const ul = $('ul');                                                                  // unordered list with 'movie' info
      let ulShape = parseFloat((ul.height() / ul.width()).toFixed(2));                     // 'movie' height to length ratio
      const scrShape = parseFloat((window.screen.height / window.screen.width).toFixed(2));// screen height to length ratio
      let scale;                                                                           // the required degree of scaling

      // based on system of 2 equations
      // newUlHeight / newUlWidth = screenShape
      // newUlHeight + newUlWidth = oldUlHeight + oldUlWidth
      const newUlWidth = Math.round((ul.height() + ul.width()) / (1 + scrShape));          // new ul width to make ul shape match the screen

      // despite the accuracy of calculations, an attempt to set the width using the CSS does not give the desired result,
      // the problem is the height does not always adjust proportionally to new width,
      // it all depends on the amount of text inside the list.
      // so I have to make additional shape checking before scaling the movie
      if (ulShape > scrShape) {
      // increase ul width bit by bit to make the ul shape match the screen shape
      // such a gradual change ensures the height changes proportionally and the entire space is filled with the text
         for (let i = newUlWidth; i < (newUlWidth + 300); i++) {
            ul.css('cssText', `width:${i}px;`);
            ulShape = ul.height() / ul.width();                                            // updated ul shape

            if ((scrShape - ulShape) < 0.1 && (scrShape - ulShape) > 0) {                  // if ul shape roughly matches the screen
               scale = window.screen.height / ul.height();                                 // calculate scale level
               ul.css('cssText', `zoom:${scale};`);                                        // and zoom the ul
               break;
            }
         }
      }
      // decrease ul width bit by bit to make the ul shape match the screen shape          (the process opposite to described above)
      else if (ulShape < scrShape) {
         for (let i = newUlWidth; i > (newUlWidth - 300); i--) {
            ul.css('cssText', `width:${i}px;`);
            ulShape = ul.height() / ul.width();
            if ((scrShape - ulShape) < 0.1 && (scrShape - ulShape) > 0) {
               scale = window.screen.height / ul.height();
               ul.css('cssText', `zoom:${scale};`);
               break;
            }
         }
      }
      else {                                                                               // if ul shape matches the screen shape
         scale = window.screen.height / ul.height();                                       // calculate scale level
         ul.css('cssText', `zoom:${scale};`);                                              // and zoom movie
      }

      // after zooming, the last word in description could jump to new line,
      // this may lead to changing the block size again. I just make the scrolling possible here.
      if (ulShape > scrShape) {
         $('.info-wrapper').css('cssText', 'position: relative;');
      }
   }

   static scaleLandscape() {
      const ul = $('ul');                                                                  // unordered list with 'movie' info
      const rightCol = $('.info-right-col');                                               // right col in landscape mode
      const rightShape = parseFloat((window.screen.height / rightCol.width()).toFixed(2)); // right col height to length ratio
      const newUlWidth = (ul.height() + ul.width()) / (1 + rightShape);                    // new ul width to make ul shape match the screen
      let scale;                                                                           // 'movie' height to screen height ratio (zoom level)

      ul.css('cssText', `width:${newUlWidth}px;`);                                         // new ul width to make ul shape match the screen
      let ulShape = parseFloat((ul.height() / ul.width()).toFixed(2));                     // updated ul form after width changed

      // despite the accuracy of calculations, an attempt to set the width using the CSS does not give the desired result,
      // the problem is the height does not always adjust proportionally to new width,
      // it all depends on the amount of text inside the list.
      // so I have to make additional shape checking before scaling the movie
      if (ulShape > rightShape) {                                                          // the process is similar to used in portrait mode
         for (let i = newUlWidth; i < (newUlWidth + 300); i++) {
            ul.css('cssText', `width:${i}px;`);
            ulShape = ul.height() / ul.width();
            if ((rightShape - ulShape) < 0.2 && (rightShape - ulShape) > 0) {
               scale = window.screen.height / ul.height();
               ul.css('cssText', `zoom:${scale};`);
               break;
            }
         }
      }
      else if (rightShape > ulShape) {
         for (let i = newUlWidth; i > (newUlWidth - 300); i--) {
            ul.css('cssText', `width:${i}px;`);
            ulShape = ul.height() / ul.width();

            // if form factors almost match, find ratio and scale 'movie'
            if ((rightShape - ulShape) < 0.2 && (rightShape - ulShape) > 0) {

               scale = window.screen.height / ul.height();
               ul.css('cssText', `zoom:${scale};`);
               break;
            }
         }
      }
      else {
         scale = window.screen.height / ul.height();
         ul.css('cssText', `zoom:${scale};`);
      }
   }

   handleClick(event) {                                                                    // CLICK HANDLER
      const name = event.target.getAttribute('name');                                      // currently works with 'runtime' only
      const value = event.target.getAttribute('value');                                    // but can be used for other fields as well

      this.setState({
         [name]: prompt('Please edit the selected field:', value)                          // prompt user to update the selected field
      }, this.updateMovie);                                                                // and save result in DB
   }

   updateMovie() {                                                                         // save updated document in DB
      axios.put('/api/movies', this.state)
         .catch(error => {
            console.log(error);
         });
   }

   render() {
      console.log(`render() - ${this.state.counter}`);
      let movie,
         title,
         runtime,
         tagline,
         year,
         overview,
         homepage,
         genreString,
         genres,
         countryString,
         countries,
         poster,
         side_poster;

      // if some field is updated by user and then the page is reloaded in the browser,
      // the actual state will be lost and we need to make request to DB to get the updated document
      if (String(window.performance.getEntriesByType('navigation')[0].type) === 'reload')
      // Todo: get request to DB to get updated movie object and replace next line
         movie = this.props.location.state.movie;
      else
         movie = this.props.location.state.movie;

      if (movie) {                                                                         // check movie properties and create elements

         const poster_url = this.props.location.state.poster_url;                          // poster
         if (poster_url.length > 30) {
            poster = (
               <li className='list-group-item poster'>
                  <img src={this.props.location.state.poster_url} className='info-poster'
                     onLoad={this.scaleMovie}
                     alt='Poster'/>
               </li>
            );
            side_poster = (
               <div className='info-left-col'>
                  <img src={this.props.location.state.poster_url} className='side_poster' alt='Poster'/>
               </div>
            );
         }

         if (movie.info.title !== '')                                                      // title
            title = (
               <li className='list-group-item active info-title'>{movie.info.title}</li>
            );

         if (this.state.runtime !== '') {                                                  // EDITABLE PROPERTY 'RUNTIME'
            runtime = <li className='list-group-item'                                      // if runtime was updated by the user
               name='runtime'
               value={this.state.runtime}
               onClick={this.handleClick}> {this.state.runtime} minutes</li>;
         }
         else if (movie.info.runtime !== '') {                                             // if runtime was not updated by the user
            runtime = <li className='list-group-item'
               name='runtime'
               value={movie.info.runtime}
               onClick={this.handleClick}>{movie.info.runtime} minutes</li>;
         }

         if (movie.info.tagline !== '')                                                    // tagline
            tagline = <li className='list-group-item'>"{movie.info.tagline}"</li>;

         if (movie.info.release_date !== '')                                               // release date
            year = (
               <li className='list-group-item'>{movie.info.release_date.substring(0, 4)}</li>
            );

         if (movie.info.overview !== '')                                                   // overview
            overview = (
               <li className='list-group-item info-overview bottom-li'>{movie.info.overview}</li>
            );

         if(movie.info.homepage)                                                           // home page
            homepage = (
               <li className='list-group-item'>
                  <a href={movie.info.homepage}>Home Page</a>
               </li>
            );

         if (movie.info.genres.length > 0) {                                               // genres
            genres = movie.info.genres;
            genres.forEach((genre, index) => {
               genreString = genreString + genre.name;
               if (genres[index + 1] != null)
                  genreString = genreString + ' | ';
            });
            genres = (<span> {genreString} </span>);
         }

         if (movie.info.production_countries.length > 0) {                                 // countries
            countries = movie.info.production_countries;
            countries.forEach((country, index) => {
               countryString = countryString + country.name;
               if (genres[index + 1] != null)
                  countryString = countryString + ' | ';
            });
            countries = (<span> {countryString} </span>);
         }
      }

      return (                                                                             // return the prepared elements
         <div className='info-wrapper'>
            <div className='info-content'>
               {side_poster && side_poster}
               <div className={'info-right-col'}>
                  <ul className='list-group panel-body' name='movie-list'>
                     {title && title}
                     {genres && <li className='list-group-item'> {genres} </li>}
                     {runtime && runtime}
                     {poster && poster}
                     {tagline && tagline}
                     {homepage && homepage}
                     {countries && <li className='list-group-item'> {countries} </li>}
                     {year && year}
                     {overview && overview}
                  </ul>
               </div>
            </div>
         </div>
      );
   }
}

export default Info;