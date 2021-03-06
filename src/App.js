import React, { Component } from 'react'
import { Backdrop, CircularProgress } from '@material-ui/core';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import PhotoGallery from './components/Photos/PhotoGallery'
import { Header, Footer } from './Layouts'
import Unsplash, { toJson } from 'unsplash-js';
import './App.css';


const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#5380ab'
    },
    secondary: {
      main: '#8cafd0'
    }
  }
})


const unsplash = new Unsplash({
  accessKey: "cnDKzdyQV7xzUw7pU9UWini2PMmw0qdBEgNUYpoKMOY",
  secret: "FGOUrTjAhyvxDU2IqZnV4ln4LpZEg7YsP0s-hCi9iZU"
});


class App extends Component {
  state = {
    photos: [],
    search: '',
    favorites: [],
    isUpdating: false,
    theme: 'dark'
  };

  toggleTheme = () => {
    this.setState(({ theme }) => ({
      theme: theme === 'light' ? 'dark' : 'light',
    }))
  }


  componentDidMount() {
    this.SearchPhotos();
  }


  SearchPhotos = () => {
    this.setState({ isUpdating: true })
    unsplash
      .photos.getRandomPhoto({ "query": this.state.search, "count": 15 })
      .then(toJson)
      .then(json => {
        let photos = this.updateDescriptions(json);
        this.setState({ photos })
      })
      .catch(() => {
        console.log('error!');
      })
      .finally(() => {
        this.setState({ isUpdating: false })
      })
  }


  // Clean up alt / descriptions, check for null + duplicates  
  updateDescriptions = photos => {
    for (let p of photos) {
      let desc = p.description ? p.description : p.alt_description ? p.alt_description : this.state.search;

      if (!desc) {
        desc = 'A cool Photo!'
      }

      if (p.alt_description === desc) {
        p.alt_description = '';
      }

      p.description = desc;
    }
    return photos
  }


  UpdateSearch = val => {
    this.setState({ search: val }, () => {
      this.SearchPhotos();
    });
  }


  AddFavorite(fav) {
    this.setState({ favorites: this.state.favorites.concat(fav) });
  }


  RemoveFavorite(id) {
    this.setState({ favorites: this.state.favorites.filter(f => f.id !== id) });
  }


  ToggleFavorite = fav => {
    // If fav exists then remove
    if (this.state.favorites.find(f => f.id === fav.id)) {
      this.RemoveFavorite(fav.id);
    }
    // else add it
    else {
      this.AddFavorite(fav);
    }
  }


  IsFavorite = favID => {
    return this.state.favorites.find(f => f.id === favID);
  }


  DeletePhoto = id => {
    this.setState({
      photos: [...this.state.photos.filter(p => p.id !== id)]
    });
    this.RemoveFavorite(id);
    //);
  };


  render() {
    return (
      <MuiThemeProvider theme={theme}>

        <div className={'app ' + this.state.theme}>

          <Header photos={this.state.photos.length} favorites={this.state.favorites} toggleTheme={this.toggleTheme} toggleFavorite={this.ToggleFavorite} removeFavorite={this.RemoveFavorite} handleSearch={this.UpdateSearch} />

          <Backdrop open={this.state.isUpdating} style={{ color: '#111', zIndex: 9 }}>
            <CircularProgress color="inherit" />
          </Backdrop>

          {this.state.photos.length > 0
            // show photo results
            ? <PhotoGallery photos={this.state.photos} favorites={this.state.favorites} removeFavorite={this.AadFavorite} deletePhoto={this.DeletePhoto} toggleFavorite={this.ToggleFavorite} isFavorite={this.IsFavorite} />

            // no results message 
            : <div className='text-info'>
              {this.state.isUpdating
                ? <span></span>
                : <h3>No matching photos found!</h3>
              }
            </div>
          }

          <Footer />

        </div>

      </MuiThemeProvider>
    );
  }
}

export default App;
