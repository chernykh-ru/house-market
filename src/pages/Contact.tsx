import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase.config'
import { toast } from 'react-toastify'

export interface MyParams {
  landlordId: string
}

export interface ILandlord {
  email: string
  name: string
  timestamp: { seconds: number; nanoseconds: number }
}

const Contact = () => {
  const [message, setMessage] = useState<string>('')
  const [landlord, setLandlord] = useState<ILandlord | null>(null)
  const [searchParams] = useSearchParams()

  const params = useParams<keyof MyParams>() as MyParams
  const navigate = useNavigate()

  useEffect(() => {
    const getLandlord = async () => {
      const docRef = doc(db, 'users', params.landlordId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        setLandlord(docSnap.data() as ILandlord)
      } else {
        toast.error('Could not get landlord data')
      }
    }

    getLandlord()
  }, [params.landlordId])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setMessage(e.target.value)

  const handleSubmit = () => {
    toast.success('Message sent')
    setTimeout(() => navigate(-1), 1500)
  }

  return (
    <div className='pageContainer'>
      <header>
        <p className='pageHeader'>Contact Landlord</p>
      </header>

      {landlord && (
        <main>
          <div className='contactLandlord'>
            <p className='landlordName'>Contact {landlord.name}</p>
          </div>

          <form className='messageForm'>
            <div className='messageDiv'>
              <label htmlFor='message' className='messageLabel'>
                Message
              </label>
              <textarea
                name='message'
                id='message'
                className='textarea'
                value={message}
                onChange={handleChange}
              ></textarea>
            </div>

            <a
              onClick={handleSubmit}
              href={`mailto:${landlord.email}?Subject=${searchParams.get(
                'listingName'
              )}&body=${message}`}
            >
              <button type='button' className='primaryButton'>
                Send Message
              </button>
            </a>
          </form>
        </main>
      )}
    </div>
  )
}

export default Contact
