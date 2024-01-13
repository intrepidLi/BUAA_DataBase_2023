import "./LogIn.css";

// import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

import { useForm, SubmitHandler, FormProvider, set } from 'react-hook-form';
import { literal, object, string, TypeOf } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { FormInput } from '../UseFormContext/UseFormContext';

import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import {
    userRoutePath,
    signupRoutePath
  } from "../../Constants/PathConstants";

import { userService } from '../../Redux/UserService';
import axios from "axios";
import Cookies from 'universal-cookie';

function Copyright(props) {
    return (
      <Typography variant="body2" color="text.secondary" align="center" {...props}>
        {'Copyright © '}
        <Link color="inherit" href="https://mui.com/">
          BUAA比价跳蚤市场
        </Link>{' '}
        {new Date().getFullYear()}
        {'.'}
      </Typography>
    );
  }
  

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

const registerSchema = object({
    // email: string().nonempty('Email is required').email('Email is invalid'),
    username: string().nonempty('User name is required'),
    password: string()
      .nonempty('Password is required')
      .min(5, 'Password must be more than 5 characters')
      .max(32, 'Password must be less than 32 characters'),
  });

export const LogIn = () => {
    // 处理登录逻辑
    const history = useNavigate();
    const cookies = new Cookies();
    const token = cookies.get('TOKEN');
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');



    const [email, setEmail] = useState('');
    
    const [loading, formData, setFormData] = useState({});
    const [showPassword, setShowPassword] = React.useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    
    const handleMouseDownPassword = (event) => {
        event.preventDefault();
      };


    const methods = useForm({
        resolver: zodResolver(registerSchema),
    });

    const {
        reset,
        handleSubmit,
        register,
        formState: { isSubmitSuccessful, errors },
    } = methods;
    
    useEffect(() => {
      if (token) {
        history('/home');
      }
      if (isSubmitSuccessful) {
        reset();
      }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, 
        [isSubmitSuccessful, history, token]
    );


    const  onSubmitHandler = async (event) => {
        // console.log(
        //     values['username'],
        //     values['password'],
        // );
      event.preventDefault();
  
      try {
        await axios
          .post('http://localhost:5000/auth/login', {
            username: userName.toLowerCase(),
            password,
          })
          .then((res) => {
            cookies.set('TOKEN', res.data.token, {
              path: '/',
            });
            cookies.set('USERNAME', res.data.username, {
              path: '/',
            });
            cookies.set('USERID', res.data.userId, {
              path: '/',
            });
            console.log(res.data.userId);
            // axios.post(
            //   'http://localhost:5000/notifications',
            //   {
            //     title: 'Welcome to the app!',
            //     username: res.data.username,
            //     content: `Welcome back ${res.data.username}`,
            //   },
            //   {
            //     headers: {
            //       Authorization: `Bearer ${res.data.token}`,
            //     },
            //   }
            // );
  
            history('/home', {});
          })
          .catch((e) => {
            alert(e.response.data.message);
            console.log(e);
          });
      } catch (e) {
        console.log(e);
      }
    };

    console.log(errors);

    const handleInputChange = (event) => {
        const { target } = event;
        const { name, value } = target;
        if (name === 'username') {
          setUserName(value);
        } else if (name === 'password') {
          setPassword(value);
        }
    
        setFormData({
          ...formData, // Keep existing form data
          [name]: value // Update form data for the input field that changed
        });
    }

    async function submit(e) {
      e.preventDefault();
  
      try {
        await axios
          .post('http://localhost:5000/auth/login', {
            username: userName.toLowerCase(),
            password,
          })
          .then((res) => {
            cookies.set('TOKEN', res.data.token, {
              path: '/',
            });
            cookies.set('USERNAME', res.data.username, {
              path: '/',
            });
  
            axios.post(
              'http://localhost:5000/notifications',
              {
                title: 'Welcome to the app!',
                username: res.data.username,
                content: `Welcome back ${res.data.username}`,
              },
              {
                headers: {
                  Authorization: `Bearer ${res.data.token}`,
                },
              }
            );
  
            history('/home', {});
          })
          .catch((e) => {
            alert(e.response.data.message);
            console.log(e);
          });
      } catch (e) {
        console.log(e);
      }
    }


      
    return (
      <ThemeProvider theme={defaultTheme}>
        <Grid container component="main" sx={{ height: '100vh' }}>
          <CssBaseline />
          <Grid
          item
          xs={false}
          sm={4}
          md={9}
          sx={{
            position: 'relative',
            backgroundImage: 'url(https://source.unsplash.com/random?wallpapers)',
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) => (t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900]),
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* 蒙层效果 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(17, 23, 29, 0.5)', // 半透明的背景色
            }}
          ></div>
          {/* 标题 */}
          <Typography variant="h4" sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
              fontWeight: 'bold',
              fontSize: '2.5rem', // 调整字号，例如 '2.5rem' 表示相对单位，也可以使用像素单位如 '36px'
            }}>
            我的跳蚤市场
          </Typography>
        </Grid>
         
        {/* </Grid> */}
          <Grid item xs={12} sm={8} md={3} component={Paper} elevation={6} square>
            <Box
              sx={{
                my: 12,
                mx: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: 'red' }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                登录
              </Typography>
              <FormProvider {...methods}>
              <Box component="form" noValidate onSubmit={handleSubmit(onSubmitHandler)} sx={{ mt: 1 }}>
                <FormInput
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="用户名"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  onChange={handleInputChange}
                />
                <FormInput
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="密码"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  onChange={handleInputChange}
                  InputProps={{
            endAdornment: <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>,
                    }}
                />
                <FormControlLabel
                  control={<Checkbox value="remember" color="primary" />}
                  label="记住密码"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  // onClick={submit}
                >
                  登录
                </Button>
                
                <Grid container>
                  <Grid item xs>
                    <Link href="#" variant="body2">
                      忘记密码?
                    </Link>
                  </Grid>
                  <Grid item>
                    <Link href={signupRoutePath} variant="body2">
                      {"还没有账户? 注册"}
                    </Link>
                  </Grid>
                </Grid>
                <Copyright sx={{ mt: 5 }} />
              </Box>
              </FormProvider>
            </Box>
          </Grid>
       </Grid>
      </ThemeProvider>
    );
  }
