import React, { FC, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'
import { toast } from 'react-toastify'
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg'
import { app } from '../firebase.config'

const ForgotPassword: FC = () => {
  const [email, setEmail] = useState<string>('')

  const handleChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }

  const handlerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const auth = getAuth(app)
      await sendPasswordResetEmail(auth, email)
      toast.success('Email was sent')
    } catch (error) {
      if (error instanceof Error) {
        toast.error('Could not send reset email')
      }
    }
  }
  return (
    <div className='pageContainer'>
      <header>
        <p className='pageHeader'>Forgot Password</p>
      </header>

      <main>
        <form onSubmit={handlerSubmit}>
          <input
            onChange={handleChangeValue}
            value={email}
            id='email'
            type='email'
            className='emailInput'
            placeholder='Email'
          />

          <Link className='forgotPasswordLink' to={'/sign-in'}>
            Sign In
          </Link>

          <div className='signInBar'>
            <div className='signInText'>Send Reset Link</div>
            <button className='signInButton'>
              <ArrowRightIcon fill='#ffffff' width='34px' height='34px' />
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default ForgotPassword
