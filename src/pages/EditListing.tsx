import React, { useState, useEffect, useRef } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage'
import {
  doc,
  updateDoc,
  getDoc,
  serverTimestamp,
  UpdateData,
} from 'firebase/firestore'
import { app, db } from '../firebase.config'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import Spinner from '../components/Spinner'
import { IFormData, IFormDataCopy } from './CreateListing'
import { IListing } from '../types/types'

export interface MyParams {
  listingId: string
}

const EditListing = () => {
  // eslint-disable-next-line
  const [geolocationEnabled, setGeolocationEnabled] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [listing, setListing] = useState<IListing | null>(null)
  const [formData, setFormData] = useState<IFormData>({
    type: 'rent',
    name: '',
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: '',
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: {} as FileList,
    latitude: 0,
    longitude: 0,
    userRef: '',
  })

  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    offer,
    regularPrice,
    discountedPrice,
    images,
    latitude,
    longitude,
  } = formData

  const auth = getAuth(app)
  const navigate = useNavigate()
  const params = useParams<keyof MyParams>() as MyParams
  const isMounted = useRef(true)

  // Redirect if listing is not user's
  useEffect(() => {
    if (listing && auth && listing.userRef !== auth.currentUser?.uid) {
      toast.error('You can not edit that listing')
      navigate('/')
    }
  })

  // Fetch listing to edit
  useEffect(() => {
    setLoading(true)
    const fetchListing = async () => {
      try {
        const docRef = doc(db, 'listings', params.listingId)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setListing(docSnap.data() as IListing)
          setFormData({
            ...docSnap.data(),
            address: docSnap.data().location,
            latitude: docSnap.data().geolocation.lat,
            longitude: docSnap.data().geolocation.lng,
          } as IFormData)
          setLoading(false)
        }
      } catch (error) {
        if (error instanceof Error) {
          navigate('/')
          toast.error('Listing does not exist')
        }
      }
    }

    fetchListing()
  }, [params.listingId, navigate])

  // Sets userRef to logged in user
  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({ ...formData, userRef: user.uid })
        } else {
          navigate('/sign-in')
        }
      })
    }

    return () => {
      isMounted.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setLoading(true)

    if (discountedPrice >= regularPrice) {
      setLoading(false)
      toast.error('Discounted price needs to be less than regular price')
      return
    }

    if (images && images.length > 6) {
      setLoading(false)
      toast.error('Max 6 images')
      return
    }

    const geolocation: { lat: number; lng: number } = {} as {
      lat: number
      lng: number
    }
    let location

    if (geolocationEnabled) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GEOCODE_API_KEY}`
      )

      const data = await response.json()

      geolocation.lat = data.results[0]?.geometry.location.lat ?? 0
      geolocation.lng = data.results[0]?.geometry.location.lng ?? 0

      location =
        data.status === 'ZERO_RESULTS'
          ? undefined
          : data.results[0]?.formatted_address

      if (location === undefined || location.includes('undefined')) {
        setLoading(false)
        toast.error('Please enter a correct address')
        return
      }
    } else {
      geolocation.lat = latitude
      geolocation.lng = longitude
      setLoading(false)
    }

    // Store image in firebase
    const storeImage = async (image: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const storage = getStorage()

        if (auth && auth.currentUser) {
          const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`
          const storageRef = ref(storage, 'images/' + fileName)
          const uploadTask = uploadBytesResumable(storageRef, image)

          uploadTask.on(
            'state_changed',
            (snapshot) => {
              // if need be for loading indicator in percent
              // eslint-disable-next-line
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              // console.log('Upload is ' + progress + '% done')
              switch (snapshot.state) {
                case 'paused':
                  // console.log('Upload is paused')
                  break
                case 'running':
                  // console.log('Upload is running')
                  break
                default:
                  break
              }
            },
            (error) => {
              reject(error)
            },
            () => {
              // Handle successful uploads on complete
              getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                resolve(downloadURL)
              })
            }
          )
        }
      })
    }

    const imgUrls = await Promise.all(
      Array.from(images).map((image) => storeImage(image))
    ).catch(() => {
      setLoading(false)
      toast.error('Images not uploaded')
      return
    })

    const formDataCopy: IFormDataCopy = {
      ...formData,
      imgUrls: imgUrls || [],
      geolocation,
      timestamp: serverTimestamp(),
    }

    formDataCopy.location = address
    delete formDataCopy.images
    delete formDataCopy.address
    delete formDataCopy.latitude
    delete formDataCopy.longitude
    !formDataCopy.offer && delete formDataCopy.discountedPrice

    // Update listing
    const docRef = doc(db, 'listings', params.listingId)
    await updateDoc(docRef, formDataCopy as UpdateData<IFormDataCopy>)
    setLoading(false)
    toast.success('Listing saved')
    navigate(`/category/${formDataCopy.type}/${docRef.id}`)
  }

  const handleMutate = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    let boolean: boolean | null = null

    if (e.target instanceof HTMLButtonElement && e.target.value === 'true') {
      boolean = true
    }
    if (e.target instanceof HTMLButtonElement && e.target.value === 'false') {
      boolean = false
    }

    // Files
    if (
      e.target instanceof HTMLInputElement &&
      e.target.type === 'file' &&
      e.target.files &&
      e.target.files.length > 0
    ) {
      const files = e.target.files

      setFormData((prevState) => ({
        ...prevState,
        images: files,
      }))
    }

    // Text/Booleans/Numbers
    if (
      (e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLButtonElement ||
        e.target instanceof HTMLTextAreaElement) &&
      e.target.type !== 'file'
    ) {
      const id = e.target.id
      const value = e.target.value

      setFormData((prevState) => ({
        ...prevState,
        [id]: boolean ?? value,
      }))
    }
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <div className='profile'>
      <header>
        <p className='pageHeader'>Edit Listing</p>
      </header>

      <main>
        <form onSubmit={handleSubmit}>
          <label className='formLabel'>Sell / Rent</label>
          <div className='formButtons'>
            <button
              type='button'
              className={type === 'sale' ? 'formButtonActive' : 'formButton'}
              id='type'
              value='sale'
              onClick={handleMutate}
            >
              Sell
            </button>
            <button
              type='button'
              className={type === 'rent' ? 'formButtonActive' : 'formButton'}
              id='type'
              value='rent'
              onClick={handleMutate}
            >
              Rent
            </button>
          </div>

          <label className='formLabel'>Name</label>
          <input
            className='formInputName'
            type='text'
            id='name'
            value={name}
            onChange={handleMutate}
            maxLength={32}
            minLength={10}
            required
          />

          <div className='formRooms flex'>
            <div>
              <label className='formLabel'>Bedrooms</label>
              <input
                className='formInputSmall'
                type='number'
                id='bedrooms'
                value={bedrooms}
                onChange={handleMutate}
                min='1'
                max='50'
                required
              />
            </div>
            <div>
              <label className='formLabel'>Bathrooms</label>
              <input
                className='formInputSmall'
                type='number'
                id='bathrooms'
                value={bathrooms}
                onChange={handleMutate}
                min={1}
                max={50}
                required
              />
            </div>
          </div>

          <label className='formLabel'>Parking spot</label>
          <div className='formButtons'>
            <button
              className={parking ? 'formButtonActive' : 'formButton'}
              type='button'
              id='parking'
              value='true'
              onClick={handleMutate}
            >
              Yes
            </button>
            <button
              className={
                !parking && parking !== null ? 'formButtonActive' : 'formButton'
              }
              type='button'
              id='parking'
              value='false'
              onClick={handleMutate}
            >
              No
            </button>
          </div>

          <label className='formLabel'>Furnished</label>
          <div className='formButtons'>
            <button
              className={furnished ? 'formButtonActive' : 'formButton'}
              type='button'
              id='furnished'
              value='true'
              onClick={handleMutate}
            >
              Yes
            </button>
            <button
              className={
                !furnished && furnished !== null
                  ? 'formButtonActive'
                  : 'formButton'
              }
              type='button'
              id='furnished'
              value='false'
              onClick={handleMutate}
            >
              No
            </button>
          </div>

          <label className='formLabel'>Address</label>
          <textarea
            className='formInputAddress'
            id='address'
            value={address}
            onChange={handleMutate}
            required
          />

          {!geolocationEnabled && (
            <div className='formLatLng flex'>
              <div>
                <label className='formLabel'>Latitude</label>
                <input
                  className='formInputSmall'
                  type='number'
                  id='latitude'
                  value={latitude}
                  onChange={handleMutate}
                  required
                />
              </div>
              <div>
                <label className='formLabel'>Longitude</label>
                <input
                  className='formInputSmall'
                  type='number'
                  id='longitude'
                  value={longitude}
                  onChange={handleMutate}
                  required
                />
              </div>
            </div>
          )}

          <label className='formLabel'>Offer</label>
          <div className='formButtons'>
            <button
              className={offer ? 'formButtonActive' : 'formButton'}
              type='button'
              id='offer'
              value='true'
              onClick={handleMutate}
            >
              Yes
            </button>
            <button
              className={
                !offer && offer !== null ? 'formButtonActive' : 'formButton'
              }
              type='button'
              id='offer'
              value='false'
              onClick={handleMutate}
            >
              No
            </button>
          </div>

          <label className='formLabel'>Regular Price</label>
          <div className='formPriceDiv'>
            <input
              className='formInputSmall'
              type='number'
              id='regularPrice'
              value={regularPrice}
              onChange={handleMutate}
              min='50'
              max='900000000'
              required
            />
            {type === 'rent' && <p className='formPriceText'>$ / Month</p>}
          </div>

          {offer && (
            <>
              <label className='formLabel'>Discounted Price</label>
              <input
                className='formInputSmall'
                type='number'
                id='discountedPrice'
                value={discountedPrice}
                onChange={handleMutate}
                min='50'
                max='900000000'
                required={offer}
              />
            </>
          )}

          <label className='formLabel'>Images</label>
          <p className='imagesInfo'>
            The first image will be the cover (max 6).
          </p>
          <input
            className='formInputFile'
            type='file'
            id='images'
            onChange={handleMutate}
            max='6'
            accept='.jpg,.png,.jpeg'
            multiple
            required
          />
          <button type='submit' className='primaryButton createListingButton'>
            Edit Listing
          </button>
        </form>
      </main>
    </div>
  )
}

export default EditListing
