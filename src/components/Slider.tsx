import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase.config'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Scrollbar, Autoplay, A11y } from 'swiper'
import Spinner from './Spinner'
import { IListings } from '../pages/Category'
import { IListing } from '../types/types'
// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import 'swiper/css/scrollbar'

const Slider = () => {
  const [loading, setLoading] = useState<boolean>(true)
  const [listings, setListings] = useState<IListings[] | null>(null)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const listingsRef = collection(db, 'listings')
        const q = query(listingsRef, orderBy('timestamp', 'desc'), limit(5))
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
        }
      }
    }

    fetchListings()
  }, [])

  if (loading) {
    return <Spinner />
  }

  if (listings && listings.length === 0) {
    return <></>
  }

  return (
    listings && (
      <>
        <p className='exploreHeading'>Recommended</p>

        <Swiper
          slidesPerView={1}
          loop={true}
          navigation={false}
          pagination={{
            clickable: true,
          }}
          autoplay={{
            delay: 10000,
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
          {listings.map(({ data, id }) => (
            <SwiperSlide
              key={id}
              onClick={() => navigate(`/category/${data.type}/${id}`)}
            >
              <div
                style={{
                  backgroundImage: `url(${data.imgUrls[0]})`,
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  width: '100%',
                  height: '30vh',
                  backgroundSize: 'cover',
                }}
                className='swiperSlideDiv'
              >
                <p className='swiperSlideText'>{data.name}</p>
                <p className='swiperSlidePrice'>
                  ${data.discountedPrice ?? data.regularPrice}{' '}
                  {data.type === 'rent' && '/ month'}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </>
    )
  )
}

export default Slider
