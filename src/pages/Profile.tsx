import React, { ChangeEvent, FC, useState, useEffect } from 'react'
import { getAuth, updateProfile } from 'firebase/auth'
import { app } from '../firebase.config'
import {
  updateDoc,
  doc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
} from 'firebase/firestore'
import { db } from '../firebase.config'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg'
import homeIcon from '../assets/svg/homeIcon.svg'
import { IListings } from './Category'
import { IListing } from '../types/types'
import ListingItem from '../components/ListingItem'

interface IProfileFormData {
  name: string
  email: string
}

const Profile: FC = () => {
  const auth = getAuth(app)
  const [changeDetails, setChangeDetails] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [listings, setListings] = useState<IListings[] | null>(null)
  const [formData, setFormData] = useState<IProfileFormData>({
    name: auth.currentUser?.displayName || '',
    email: auth.currentUser?.email || '',
  })
  const { name, email } = formData
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserListings = async () => {
      try {
        const listingsRef = collection(db, 'listings')

        const q = query(
          listingsRef,
          where('userRef', '==', auth.currentUser?.uid),
          orderBy('timestamp', 'desc')
        )

        const querySnap = await getDocs(q)

        const listings: IListings[] = []

        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data() as IListing,
          })
        })

        setListings(listings)
        setLoading(false)
      } catch (error) {
        if (error instanceof Error) {
          setLoading(false)
          toast.error('Could not get user listings')
        }
      }
    }

    fetchUserListings()
  }, [auth.currentUser?.uid])

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

  const handleDelete = async (listingId: string) => {
    if (window.confirm('Are you sure you want to delete?')) {
      await deleteDoc(doc(db, 'listings', listingId))
      const updatedListings =
        listings && listings.filter((listing) => listing.id !== listingId)
      setListings(updatedListings)
      toast.success('Successfully deleted listing')
    }
  }

  const handleEdit = (listingId: string) =>
    navigate(`/edit-listing/${listingId}`)

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

        {!loading && listings && listings.length > 0 && (
          <>
            <p className='listingText'>Your Listings</p>
            <ul className='listingsList'>
              {listings.map(({ id, data }) => (
                <ListingItem
                  key={id}
                  listing={data}
                  id={id}
                  onDelete={() => handleDelete(id)}
                  onEdit={() => handleEdit(id)}
                />
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  )
}

export default Profile
