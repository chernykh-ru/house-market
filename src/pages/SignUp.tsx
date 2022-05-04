import React, { ChangeEvent, FC, FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'
import { setDoc, doc, serverTimestamp, FieldValue } from 'firebase/firestore'
import { app, db } from '../firebase.config'
import { toast } from 'react-toastify'
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg'
import visibilityIcon from '../assets/svg/visibilityIcon.svg'
import OAuth from '../components/OAuth'

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>
interface ISignUpFormData {
  name: string
  email: string
  password: string
}

const SignUp: FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [formData, setFormData] = useState<ISignUpFormData>({
    name: '',
    email: '',
    password: '',
  })
  const { name, email, password } = formData
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

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      const user = userCredential.user

      if (auth.currentUser) {
        updateProfile(auth.currentUser, {
          displayName: name,
        })
      }

      const formDataCopy = { ...formData } as Optional<
        ISignUpFormData,
        'password'
      > & { timestamp: FieldValue }
      delete formDataCopy.password
      formDataCopy.timestamp = serverTimestamp()

      await setDoc(doc(db, 'users', user.uid), formDataCopy)

      navigate('/')
    } catch (error) {
      if (error instanceof Error) {
        toast.error('Something went wrong with registration')
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
          type='text'
          className='nameInput'
          placeholder='Name'
          id='name'
          value={name}
          onChange={onChange}
        />

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

        <div className='signUpBar'>
          <p className='signUpText'>Sign Up</p>
          <button className='signUpButton'>
            <ArrowRightIcon fill='#ffffff' width='34px' height='34px' />
          </button>
        </div>
      </form>

      <OAuth />

      <Link to='/sign-in' className='registerLink'>
        Sign In Instead
      </Link>
    </div>
  )
}

export default SignUp
