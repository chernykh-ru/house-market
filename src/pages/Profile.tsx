import React, { ChangeEvent, FC, useState } from 'react'
import { getAuth, updateProfile } from 'firebase/auth'
import { app } from '../firebase.config'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase.config'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg'
import homeIcon from '../assets/svg/homeIcon.svg'

interface IProfileFormData {
  name: string
  email: string
}

const Profile: FC = () => {
  const auth = getAuth(app)
  const [changeDetails, setChangeDetails] = useState<boolean>(false)
  const [formData, setFormData] = useState<IProfileFormData>({
    name: auth.currentUser?.displayName || '',
    email: auth.currentUser?.email || '',
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

  const handleSubmit = async () => {
    try {
      if (auth.currentUser && auth.currentUser?.displayName !== name) {
        // Update display name in fb
        await updateProfile(auth.currentUser, {
          displayName: name,
        })

        // Update in firestore
        const userRef = doc(db, 'users', auth.currentUser.uid)
        await updateDoc(userRef, {
          name,
        })
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error('Could not update profile details')
        console.log(error.message)
      }
    }
  }

  const handleChangeDetails = () => {
    changeDetails && handleSubmit()
    setChangeDetails((prev) => !prev)
  }

  const handleChangeValues = (event: ChangeEvent<HTMLInputElement>) => {
    setFormData((prevData) => ({
      ...prevData,
      [event.target.id]: event.target.value,
    }))
  }

  return (
    <div className='profile'>
      <header className='profileHeader'>
        <p className='pageHeader'>My Profile</p>
        <button className='logOut' type='button' onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main>
        <div className='profileDetailsHeader'>
          <p className='profileDetailsText'>Personal Details</p>
          <p className='changePersonalDetails' onClick={handleChangeDetails}>
            {changeDetails ? 'done' : 'change'}
          </p>
        </div>

        <div className='profileCard'>
          <form>
            <input
              type='text'
              id='name'
              className={!changeDetails ? 'profileName' : 'profileNameActive'}
              disabled={!changeDetails}
              value={name}
              onChange={handleChangeValues}
            ></input>
            <input
              type='text'
              id='email'
              className={!changeDetails ? 'profileEmail' : 'profileEmailActive'}
              disabled={!changeDetails}
              value={email}
              onChange={handleChangeValues}
            ></input>
          </form>
        </div>

        <Link to='/create-listing' className='createListing'>
          <img src={homeIcon} alt='home' />
          <p>Sell or rent your home</p>
          <img src={arrowRight} alt='arrow right' />
        </Link>
      </main>
    </div>
  )
}

export default Profile
