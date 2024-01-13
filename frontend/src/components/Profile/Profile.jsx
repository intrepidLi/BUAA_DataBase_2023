import React, { useState, useEffect } from 'react';
import {Typography, Container, Card, Grid, Box, Button, Avatar, AppBar, Toolbar, TextField} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {PasswordInput} from '../../components/PasswordInput/PasswordInput';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { literal, object, string, TypeOf } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {FormInput} from '../../components/UseFormContext/UseFormContext';
import Cookies from 'universal-cookie';
import { useNavigate } from 'react-router-dom';
import { useConfirm } from "material-ui-confirm";

const Profile = () => {

  const history = useNavigate();
  const cookies = new Cookies();
  const token = cookies.get('TOKEN');
  const username = cookies.get('USERNAME');
  const confirm = useConfirm();

  const handleLogOut = () => {
    confirm({ description: "This action is permanent!" })
      .then(() => {
        // 用户点击了确认按钮
        console.log("Confirmed! Perform your action here.");
        cookies.remove('TOKEN', { path: '/' });
        cookies.remove('USERNAME', { path: '/' });
        history('/', {});
        // 可以在这里执行相应的操作，比如发送删除请求等
      })
      .catch(() => {
        // 用户点击了取消按钮
        console.log("Cancelled. No action taken.");
        // 可以在这里处理取消操作的逻辑
      });
  };

  
  const registerSchema1 = object({
    nickname: string()
      .nonempty('Name is required')
      .max(32, 'Name must be less than 100 characters'),
    email: string().nonempty('Email is required').email('Email is invalid'),
  });

  const registerSchema2 = object({
    password: string()
      .nonempty('Password is required')
      .min(8, 'Password must be more than 8 characters')
      .max(32, 'Password must be less than 32 characters'),
    passwordConfirm: string().nonempty('Please confirm your password'),
  }).refine((data) => data.password === data.passwordConfirm, {
    path: ['passwordConfirm'],
    message: 'Passwords do not match',
  });

  const methods1 = useForm({
    resolver: zodResolver(registerSchema1),
  });

  const methods2 = useForm({
    resolver: zodResolver(registerSchema2),
  });

  const {
    reset: reset1,
    handleSubmit: handleSubmit1,
    register: register1,
    formState: { isSubmitSuccessful: isSubmitSuccessful1, errors: errors1 },
  } = methods1;

  const {
    reset: reset2,
    handleSubmit: handleSubmit2,
    register: register2,
    formState: { isSubmitSuccessful: isSubmitSuccessful2, errors: errors2 },
  } = methods2;

  useEffect(() => {
    if (isSubmitSuccessful1) {
      reset1();
    }
    if (isSubmitSuccessful2) {
      reset2();
    }
  }, [isSubmitSuccessful1, isSubmitSuccessful2]);

  const [formData, setFormData] = useState({});
  const handleInputChange = (event) => {
    const { target } = event;
    const { name, value } = target;

    setFormData({
      ...formData, // Keep existing form data
      [name]: value // Update form data for the input field that changed
    });
  }


  const [userInfo, setUserInfo] = useState({ name: 'John Doe', email: 'johndoe@example.com' });
  const [avatarUrl, setAvatarUrl] = useState('/users/test1.png'); // 设置默认头像的 URL
  const onSubmitHandler1 = (values) => {
    console.log(
        values['nickname'],
        values['email'],
    );
    
  };

  const onSubmitHandler2 = (values) => {
    console.log(
        values['password'],
    );
    
  };
  
  const handleUpdateProfile = () => {
    // Implement the logic to update user's profile information.
    // You can send a request to your server here.
    
  };

  const handleUpdatePassword = () => {
    // Implement the logic to update user's password.
    // You can send a request to your server here.
  };

  const handleUploadAvatar = (event) => {
    console.log();
    var file = event.target.files[0];
    if (file == null) {
      return;
    }
    const reader = new FileReader();
    // var url = reader.readAsDataURL(file);

    reader.onloadend = () => {
        // setNewAvatar(file);
        setAvatarUrl(reader.result);
    }
    // console.log(url); // Would see a path?
    reader.readAsDataURL(file);
    console.log(avatarUrl); // Would see a path?
    // Todo: if user is using default avatar, then upload the new avatar to server
  };

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '6em' }}>
      <Card sx={{ minWidth: 300, boxShadow: 3 }}>
  
       
      <Container component="main" maxWidth="xs">
      <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
        <Box sx={{ margin: '15px' }}>
        <Typography component="h1" variant="h4">
            修改个人资料
        </Typography>
        </Box>
        <Box sx={{ padding: '15px' }}>
      <Avatar
          src={avatarUrl} // 当前头像的 URL
          alt="Avatar"
          sx={{ width: 100, height: 100 }} // 调整头像的大小
        />
        </Box>
          
         
          <Box sx={{ margin: '15px', textAlign: 'center' }}>
          <input
              accept="image/*"
              id="contained-button-file"
              multiple
              type="file"
              style={{ display: 'none' }}
              onChange={handleUploadAvatar}
              name="file"
            />
            <Button variant="contained" color="primary" component="span" startIcon={<CloudUploadIcon />}
            onClick={() => {
            // 获取 input 标签的 DOM 节点
            const input = document.getElementById('contained-button-file');
            // 触发 input 标签的点击事件
            input.click();  }} > 
            修改头像
            </Button>
            </Box>
         
          <FormProvider {...methods1}>
          <Box component="form" noValidate onSubmit={handleSubmit1(onSubmitHandler1)} >
          <Grid container spacing={3}>
          
          <Grid item xs={12}>
            <FormInput
              label="昵称"
              fullWidth
              name={"nickname"}
              value={userInfo.name}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <FormInput
              label="邮箱"
              fullWidth
              name={"email"}
              value={userInfo.email}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ margin: '15px', textAlign: 'center' }}>
            <Button variant="contained" type="submit" color="primary" onClick={handleUpdateProfile}>
              修改基本信息
            </Button>
            </Box>
          </Grid>
          </Grid>
          </Box>
        </FormProvider>
        <FormProvider {...methods2}>
        <Box component="form" noValidate onSubmit={handleSubmit2(onSubmitHandler2)} >
        <Grid container spacing={3}> 
          <Grid item xs={12}>
            <PasswordInput label={"新密码"} name={"password"} handleInputChange={handleInputChange} />
          </Grid>
          <Grid item xs={12}>
          <PasswordInput label={"请再次输入密码"} name={"passwordConfirm"}handleInputChange={handleInputChange} />
          </Grid>
          <Grid item xs={12}>
          <Box sx={{ margin: '15px', textAlign: 'center' }}>
            <Button variant="contained" type="submit" color="primary" onClick={handleUpdatePassword}>
              修改密码
            </Button>
            </Box>
          </Grid>

          <Grid item xs={12}>
          <Box sx={{ margin: '15px', textAlign: 'center' }}>
            <Button variant="contained" type="submit" color="primary" onClick={handleLogOut}>
              退出登录
            </Button>
            </Box>
          </Grid>

          </Grid> 
          </Box>
          </FormProvider>
         
          </Box> 
      </Container>
      </Card>
    </Box>
    </div>
  );
}

export default Profile;
