import React, { FC } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStatus } from '../hooks/useAuthStatus'
import Spinner from './Spinner'

const PrivateRoute: FC = (): JSX.Element => {
  const { loggedIn, checkingStatus } = useAuthStatus()

  if (checkingStatus) {
    return <Spinner />
  }

  return loggedIn ? <Outlet /> : <Navigate to='/sign-in' />
}

// Protected routes in r-r-d v6
// https://stackoverflow.com/questions/65505665/protected-route-with-firebase

export default PrivateRoute
