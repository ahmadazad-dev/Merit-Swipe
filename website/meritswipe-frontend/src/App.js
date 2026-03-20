import React from 'react';
import Searchbar from './components/search/search';
import Header from './components/header/header';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <Searchbar />
    </div>
  );
}

export default App;