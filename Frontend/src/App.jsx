import React from 'react';
import Navbar from './components/Navbar';
import PlanTrip from './components/PlanTrip';
import Blog from './pages/Blog';
import Home from './pages/Home';
import Feedback from './components/Feedback/Feedback';
import Itinerary from './components/Itinerary';
import HomePage from './components/HomePage/HomePage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import ConfirmedItinerary from './components/ConfirmedItinerary';

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/plan" element={<PlanTrip />} />
          <Route path="/blog" exact element={<Home />} />
          <Route path="/blog-details/:id" element={<Blog />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/Itinerary" element={<Itinerary />} />
          <Route path="/confirmed-itinerary" element={<ConfirmedItinerary />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route path="/reset-password/:userId" element={<ResetPassword />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
