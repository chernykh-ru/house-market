import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Explore from './pages/Explore'
import Profile from './pages/Profile'
import Offers from './pages/Offers'
import { NotFound } from './pages/NotFound'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import Navbar from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'
import Category from './pages/Category'

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Explore />} />
        <Route path='offers' element={<Offers />} />
        <Route path='category/:categoryName' element={<Category />} />
        <Route path='profile' element={<PrivateRoute />}>
          <Route path='/profile' element={<Profile />} />
        </Route>
        <Route path='sign-in' element={<SignIn />} />
        <Route path='sign-up' element={<SignUp />} />
        <Route path='forgot-password' element={<ForgotPassword />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
      <Navbar />
      <ToastContainer limit={3} autoClose={3000} />
    </>
  )
}

export default App
