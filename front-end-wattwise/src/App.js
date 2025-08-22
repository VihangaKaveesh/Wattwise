// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import Home from './pages/Home';
import About from './pages/AboutUs';
import Contact from './pages/ContactUs';
import Terms from './pages/Terms&Co';
import Login from './pages/Login';
import Footer from './components/Footer';

//import './App.css'; // optional global styles

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
       <Footer />
      </div>
    </Router>
  );
};

export default App;
