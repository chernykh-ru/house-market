import React, { useEffect, useState } from 'react'
import { getAuth } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { useNavigate, useParams } from 'react-router-dom'
import { app, db } from '../firebase.config'
import Spinner from '../components/Spinner'
import shareIcon from '../assets/svg/shareIcon.svg'
import { IListing } from '../types/types'

export interface MyParams {
  listingId: string
}

const Listing = () => {
  const [listing, setListing] = useState<IListing | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [shareLinkCopied, setShareLinkCopied] = useState<boolean>(false)

  const navigate = useNavigate()
  const params = useParams<keyof MyParams>() as MyParams
  const auth = getAuth(app)

  useEffect(() => {
    const fetchListing = async () => {
      const docRef = doc(db, 'listings', params.listingId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        setListing(docSnap.data() as IListing)
        setLoading(false)
      }
    }

    fetchListing()
  }, [navigate, params.listingId])

  if (loading) {
    return <Spinner />
  }

  return <div>{listing && listing.name}</div>
}

export default Listing
