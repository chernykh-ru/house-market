import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentData,
} from 'firebase/firestore'
import { db } from '../firebase.config'
import { toast } from 'react-toastify'
import Spinner from '../components/Spinner'
import { IListing } from '../types/types'
import ListingItem from '../components/ListingItem'

export interface MyParams {
  categoryName: string
}

export interface IListings {
  id: string
  data: IListing
}

const Category = () => {
  const [listings, setListings] = useState<IListings[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [lastFetchedListing, setLastFetchedListing] =
    useState<DocumentData | null>(null)
  const params = useParams<keyof MyParams>() as MyParams

  useEffect(() => {
    const fetchListings = async () => {
      try {
        // Get reference
        const listingsRef = collection(db, 'listings')

        // Create a query
        const q = query(
          listingsRef,
          where('type', '==', params.categoryName),
          orderBy('timestamp', 'desc'),
          limit(1)
        )

        // Execute query
        const querySnap = await getDocs(q)

        const lastVisible = querySnap.docs[querySnap.docs.length - 1]
        setLastFetchedListing(lastVisible)

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
          toast.error('Could not fetch listings')
        }
      }
    }
    fetchListings()
  }, [params.categoryName])

  // Pagination / Load More
  const handleFetchMoreListings = async () => {
    try {
      // Get reference
      const listingsRef = collection(db, 'listings')

      // Create a query
      const q = query(
        listingsRef,
        where('type', '==', params.categoryName),
        orderBy('timestamp', 'desc'),
        startAfter(lastFetchedListing),
        limit(1)
      )

      // Execute query
      const querySnap = await getDocs(q)

      const lastVisible = querySnap.docs[querySnap.docs.length - 1]
      setLastFetchedListing(lastVisible)

      const listings: IListings[] = []

      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data() as IListing,
        })
      })

      setListings((prevState) => {
        if (prevState) {
          return [...prevState, ...listings]
        }
        if (prevState === null) {
          return [...listings]
        }
        return null
      })
      setLoading(false)
    } catch (error) {
      if (error instanceof Error) {
        setLoading(false)
        toast.error('Could not fetch listings')
      }
    }
  }

  return (
    <div className='category'>
      <header>
        <p className='pageHeader'>
          {params.categoryName === 'rent'
            ? 'Places for rent'
            : 'Places for sale'}
        </p>
      </header>

      {loading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <>
          <main>
            <ul className='categoryListings'>
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                />
              ))}
            </ul>
          </main>

          <br />
          <br />

          {lastFetchedListing && (
            <p className='loadMore' onClick={handleFetchMoreListings}>
              Load More
            </p>
          )}
        </>
      ) : (
        <p>No listings for {params.categoryName}</p>
      )}
    </div>
  )
}

export default Category
