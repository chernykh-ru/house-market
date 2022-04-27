import React, { useState, useEffect, useRef } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { app } from '../firebase.config'

export const useAuthStatus = () => {
  const [loggedIn, setLoggedIn] = useState<boolean>(false)
  const [checkingStatus, setCheckingStatus] = useState<boolean>(true)
  const isMounted = useRef(true)

  useEffect(() => {
    if (isMounted) {
      const auth = getAuth(app)
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setLoggedIn(true)
        }
        setCheckingStatus(false)
      })
    }
    return () => {
      isMounted.current = false
    }
  }, [isMounted])

  return { loggedIn, checkingStatus }
}

// Fix memory leak warning
// in react 18 this is corrected on the assurance
// but just for best practice use useRef in this case
// https://stackoverflow.com/questions/59780268/cleanup-memory-leaks-on-an-unmounted-component-in-react-hooks
