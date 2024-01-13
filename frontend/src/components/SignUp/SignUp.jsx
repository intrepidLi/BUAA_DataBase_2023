import * as React from 'react';
import {Avatar, Button, CssBaseline, FormControlLabel, Checkbox, Link, Grid, Box, Typography, Container, Tooltip} from '@mui/material';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { createTheme, ThemeProvider } from '@mui/material/styles';

import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

import {Card} from '@mui/material';
import { useForm, FormProvider } from 'react-hook-form';
import { object, string} from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput } from '../UseFormContext/UseFormContext';

import { PasswordInput } from '../PasswordInput/PasswordInput';
import Cookies from 'universal-cookie';
import axios from 'axios';

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

const SignUp = () => {
    const [formData, setFormData] = useState({});
    const navigate = useNavigate();

    const cookies = new Cookies();
    const token = cookies.get('TOKEN');

    useEffect(() => {
      if (token) {
        navigate('/home');
      }
    }, [navigate, token]);
  


    const registerSchema = object({
        nickname: string()
          .nonempty('用户名不能为空')
          .max(32, '用户名至多32位'),
        email: string().nonempty('邮箱不能为空').email('无效邮箱'),
        password: string()
          .nonempty('密码不能为空')
          .min(8, '密码至少8位')
          .max(32, '密码至多32位'),
        passwordConfirm: string().nonempty('请再次输入密码'),
      }).refine((data) => data.password === data.passwordConfirm, {
        path: ['passwordConfirm'],
        message: '密码不匹配',
      });

      // const [loading, setLoading] = useState(false);

      const methods = useForm({
        resolver: zodResolver(registerSchema),
      });

      const {
        reset,
        handleSubmit,
        formState: { isSubmitSuccessful, errors },
      } = methods;

      useEffect(() => {
        if (isSubmitSuccessful) {
          reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [isSubmitSuccessful]);

  const onSubmitHandler = async (values) => {
    console.log(
        values['nickname'],
        values['email'],
        values['password'],
    );
    try {
      await axios
        .post('http://localhost:5000/auth/register', {
          username: values['nickname'],
          password: values['password'],
          email: values['email'],
          // school,
        })
        .then((res) => {
          console.log(res.data);
          cookies.set('TOKEN', res.data.token, {
            path: '/',
          });
          cookies.set('USERNAME', res.data.username, {
            path: '/',
          });

          cookies.set('USERID', res.data.userId, {
            path: '/',
          });

          console.log(cookies.get('USERID'));
          navigate('/home', {});
        })
        .catch((e) => {
          alert(e.response.data.message);
          console.log(e);
        });
    } catch (e) {
      console.log(e);
    }
    
    // navigate("/")
  };

  console.log(errors);

  const handleInputChange = (event) => {
    const { target } = event;
    const { name, value } = target;

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
      <Card sx={{ minWidth: 300, marginTop: '10em' }}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            注册
          </Typography>
          <FormProvider {...methods}>
          <Box component="form" noValidate onSubmit={handleSubmit(onSubmitHandler)} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormInput
                  required
                  fullWidth
                  id="nickname"
                  label="用户名"
                  name="nickname"
                  autoComplete="nickname"
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <FormInput
                  required
                  fullWidth
                  id="email"
                  label="邮箱"
                  name="email"
                  autoComplete="email"
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
            
              
              <PasswordInput label="新密码(8-32位)" name="password" handleInputChange={handleInputChange} id={"password1"}/>
              
              </Grid>
              <Grid item xs={12}>
              <PasswordInput label="请再次输入密码" name="passwordConfirm" handleInputChange={handleInputChange} id={"password2"}/>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox value="allowExtraEmails" color="primary" />}
                  label="我希望通过邮箱接收最新通知或消息"
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              注册
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link variant="body2" href="/">
                  已经有账号？登录
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

export default SignUp;