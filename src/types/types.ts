export interface IListing {
  type: 'rent' | 'sale'
  bedrooms: number
  geolocation: {
    lat: number
    lng: number
  }
  imgUrls: string[]
  regularPrice: number
  location: string
  timestamp: {
    seconds: number
    nanoseconds: number
  }
  userRef: string
  parking: boolean
  offer: boolean
  bathrooms: number
  name: string
  discountedPrice: number
  furnished: boolean
}
