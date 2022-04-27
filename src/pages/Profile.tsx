import React, { FC, useState } from 'react'
import { getAuth } from 'firebase/auth'
import { app } from '../firebase.config'
import { useNavigate } from 'react-router-dom'

interface IProfileFormData {
  name: string | undefined | null
  email: string | undefined | null
}

const Profile: FC = () => {
  const auth = getAuth(app)
  const [formData, setFormData] = useState<IProfileFormData>({
    name: auth.currentUser?.displayName,
    email: auth.currentUser?.email,
  })
  const { name, email } = formData
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await auth.signOut()
      navigate('/')
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message)
      }
    }
  }

  return (
    <div className='profile'>
      <header className='profileHeader'>
        <p className='pageHeader'>My Profile</p>
        <button className='logOut' type='button' onClick={handleLogout}>
          Logout
        </button>
      </header>
    </div>
  )
}

export default Profile
