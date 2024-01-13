// import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import {Box, Card, Grid, Link, Checkbox, CssBaseline} from '@mui/material';
import Container from '@mui/material/Container';
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
import Cookies from 'universal-cookie';
import axios from "axios";

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


const Login = () => {
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
        [isSubmitSuccessful]
    );

    const navigate = useNavigate();


    const  onSubmitHandler = async (values) => {
      // console.log(
      //     values['username'],
      //     values['password'],
      // );
    // e.preventDefault();

    try {
      await axios
        .post('http://localhost:5000/auth/login', {
          username: values['username'],
          password: values['password'],
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
          console.log("username");
          setUserName(value);
          console.log(value);
          console.log(userName);
        } else if (name === 'password') {
          console.log("password");
          setPassword(value);
          console.log(value);
          console.log(password);
        }
    
        setFormData({
          ...formData, // Keep existing form data
          [name]: value // Update form data for the input field that changed
        });
    }
    

  return (
    <ThemeProvider theme={defaultTheme}>
    <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    background:
                        'url(https://source.unsplash.com/featured/1600x900)',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                }}
            >
      <Card sx={{ minWidth: 300, marginTop: '10em', height: 'auto'}}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            // height: 'auto',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            登录
          </Typography>
          <FormProvider {...methods}>
          <Box component="form" onSubmit={handleSubmit(onSubmitHandler)} noValidate sx={{ mt: 1 }}>
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
            >
              登录
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  忘记密码？
                </Link>
              </Grid>
              <Grid item>
              <Link href="/signup" variant="body2">
                      {"还没有账户? 注册"}
                </Link>
              </Grid>
            </Grid>
          </Box>
          </FormProvider>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
      </Card>
      </Box>
    </ThemeProvider>
  );
}

export default Login;