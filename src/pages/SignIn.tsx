import React, { ChangeEvent, FC, FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg'
import visibilityIcon from '../assets/svg/visibilityIcon.svg'
import { app } from '../firebase.config'

interface ISignInFormData {
  email: string
  password: string
}

const SignIn: FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [formData, setFormData] = useState<ISignInFormData>({
    email: '',
    password: '',
  })
  const { email, password } = formData
  const navigate = useNavigate()

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      [event.target.id]: event.target.value,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      const auth = getAuth(app)

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      )

      if (userCredential.user) {
        navigate('/')
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message)
      }
    }
  }

  return (
    <div className='pageContainer'>
      <header>
        <p className='pageHeader'>Welcome Back!</p>
      </header>
      <form onSubmit={handleSubmit}>
        <input
          type='email'
          className='emailInput'
          placeholder='Email'
          id='email'
          value={email}
          onChange={onChange}
        />

        <div className='passwordInputDiv'>
          <input
            type={showPassword ? 'text' : 'password'}
            className='passwordInput'
            placeholder='Password'
            id='password'
            value={password}
            onChange={onChange}
          />

          <img
            src={visibilityIcon}
            alt='show password'
            className='showPassword'
            onClick={() => setShowPassword((prev) => !prev)}
          />
        </div>

        <Link to='/forgot-password' className='forgotPasswordLink'>
          Forgot Password
        </Link>

        <div className='signInBar'>
          <p className='signInText'>Sign In</p>
          <button className='signInButton'>
            <ArrowRightIcon fill='#ffffff' width='34px' height='34px' />
          </button>
        </div>
      </form>

      {/* <Google OAuth /> */}

      <Link to='/sign-up' className='registerLink'>
        Sign Up Instead
      </Link>
    </div>
  )
}

export default SignIn
