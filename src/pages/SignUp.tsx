import React, { ChangeEvent, FC, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg'
import visibilityIcon from '../assets/svg/visibilityIcon.svg'

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

  return (
    <div className='pageContainer'>
      <header>
        <p className='pageHeader'>Welcome Back!</p>
      </header>
      <form>
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

      {/* <Google OAuth /> */}

      <Link to='/sign-in' className='registerLink'>
        Sign In Instead
      </Link>
    </div>
  )
}

export default SignUp
