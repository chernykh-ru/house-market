import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Explore from './pages/Explore'
import Profile from './pages/Profile'
import Offers from './pages/Offers'
import { NotFound } from './pages/NotFound'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import Navbar from './components/Navbar'

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Explore />} />
        <Route path='offers' element={<Offers />} />
        <Route path='profile' element={<SignUp />} />
        <Route path='sign-in' element={<SignIn />} />
        <Route path='sign-up' element={<SignUp />} />
        <Route path='forgot-password' element={<ForgotPassword />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
      <Navbar />
    </>
  )
}

export default App
