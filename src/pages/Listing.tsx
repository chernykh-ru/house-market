import React, { useEffect, useState } from 'react'
import { getAuth } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { YMaps, Map, Placemark } from 'react-yandex-maps'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Scrollbar, Autoplay, A11y } from 'swiper'
import { app, db } from '../firebase.config'
import Spinner from '../components/Spinner'
import shareIcon from '../assets/svg/shareIcon.svg'
import { IListing } from '../types/types'
// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import 'swiper/css/scrollbar'

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

  if (!listing) {
    return (
      <div className='listingDetails'>
        <p className='listingName'>Oops, something went wrong...</p>
        <button className='primaryButton' onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    )
  }

  return (
    <main>
      <Swiper
        slidesPerView={1}
        loop={true}
        navigation={true}
        pagination={{
          clickable: true,
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        scrollbar={{
          hide: true,
        }}
        a11y={{
          prevSlideMessage: 'Previous slide',
          nextSlideMessage: 'Next slide',
        }}
        modules={[Navigation, Pagination, Scrollbar, Autoplay, A11y]}
      >
        {listing.imgUrls.map((_, index) => (
          <SwiperSlide key={index}>
            <div
              style={{
                backgroundImage: `url(${listing.imgUrls[index]})`,
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                width: '100%',
                height: '30vh',
                backgroundSize: 'cover',
              }}
              className='swiperSlideDiv'
            ></div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div
        className='shareIconDiv'
        onClick={() => {
          navigator.clipboard.writeText(window.location.href)
          setShareLinkCopied(true)
          setTimeout(() => {
            setShareLinkCopied(false)
          }, 2000)
        }}
      >
        <img src={shareIcon} alt='' />
      </div>

      {shareLinkCopied && <p className='linkCopied'>Link Copied!</p>}

      <div className='listingDetails'>
        <p className='listingName'>
          {listing.name} - $
          {listing.offer
            ? listing.discountedPrice
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            : listing.regularPrice
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        </p>
        <p className='listingLocation'>{listing.location}</p>
        <p className='listingType'>
          For {listing.type === 'rent' ? 'Rent' : 'Sale'}
        </p>
        {listing.offer && (
          <p className='discountPrice'>
            $
            {(listing.regularPrice - listing.discountedPrice)
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{' '}
            discount
          </p>
        )}

        <ul className='listingDetailsList'>
          <li>
            {listing.bedrooms > 1
              ? `${listing.bedrooms} Bedrooms`
              : '1 Bedroom'}
          </li>
          <li>
            {listing.bathrooms > 1
              ? `${listing.bathrooms} Bathrooms`
              : '1 Bathroom'}
          </li>
          <li>{listing.parking && 'Parking Spot'}</li>
          <li>{listing.furnished && 'Furnished'}</li>
        </ul>

        <p className='listingLocationTitle'>Location</p>

        <div className='mapContainer'>
          <YMaps>
            <Map
              state={{
                center: [listing.geolocation.lat, listing.geolocation.lng],
                zoom: 12,
              }}
              width={'100%'}
              height={'100%'}
            >
              <Placemark
                modules={['geoObject.addon.balloon']}
                options={{
                  preset: 'islands#darkGreenIcon',
                  iconCaptionMaxWidth: '120',
                }}
                geometry={[listing.geolocation.lat, listing.geolocation.lng]}
                properties={{
                  balloonContent: `${listing.location}`,
                }}
              />
            </Map>
          </YMaps>
        </div>

        {auth && auth.currentUser?.uid !== listing.userRef && (
          <Link
            to={`/contact/${listing.userRef}?listingName=${listing.name}`}
            className='primaryButton'
          >
            Contact Landlord
          </Link>
        )}
      </div>
    </main>
  )
}

export default Listing
