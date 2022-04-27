import React, { FC, useState, useEffect } from 'react'
import { getAuth, User } from 'firebase/auth'
import { app } from '../firebase.config'

const Profile: FC = () => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const auth = getAuth(app)
    setUser(auth.currentUser)
  }, [])

  return user ? (
    <div>
      <h1>{user.displayName}</h1>
    </div>
  ) : (
    <div>
      <h1>Not Logged In</h1>
    </div>
  )
}

export default Profile
