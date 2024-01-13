import Cookies from 'universal-cookie';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EditProfile from './EditProfile';
// import profile_Image from '../assets/temp-avatar.jpg';
import axios from 'axios';
import { Grid, Button, Box, Typography, Avatar, Stack, List, ListItem, ListItemText, Divider, Paper, Dialog, DialogActions, DialogTitle, DialogContent, DialogContentText } from '@mui/material';
import { useConfirm } from "material-ui-confirm";
import Core from "../Comments/Core";
import EditPassword from './EditPassword';

const Profile = () => {
  const [description, setDescription] = useState('');
  // const [school, setSchool] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [othername, setOthername] = useState('')
  

  const history = useNavigate();
  const cookies = new Cookies();
  const token = cookies.get('TOKEN');

  const userId = cookies.get('USERID');
  console.log("userId", userId)
  const otherUserId = parseInt(window.location.pathname.split('/')[2], 10);
  console.log("otherUserId", otherUserId)
  
  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialog = () => {
      setOpenDialog(true);
  };
    
  const handleCloseDialog = () => {
      setOpenDialog(false);
  };

  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);

  const handleOpenPasswordDialog = () => {
      setOpenPasswordDialog(true);
  };
    
  const handleClosePasswordDialog = () => {
      setOpenPasswordDialog(false);
  };

  useEffect(() => {
    console.log(openDialog);
    if (otherUserId && otherUserId !== userId) {
      setAvatarUrl(`http://localhost:5000/images/users/${otherUserId}`);
    } else {
      setAvatarUrl(`http://localhost:5000/images/users/${userId}`);
    }
  }, [otherUserId, userId, openDialog]);  

 
  let realUserId = userId;
  useEffect(() => {
    // 如果是查看别人的主页，就把userId改成otherUserId
    if (otherUserId && otherUserId !== userId) {
      realUserId  = otherUserId;
    }

    const fetchData = async () => {
      try {
        await axios
          .get(`http://localhost:5000/users/${realUserId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
            setDescription(res.data.UserDescription);
            setEmail(res.data.Email);
            setAvatar(res.data.UserAvatar);
            setOthername(res.data.UserName)
          })
          .catch((e) => {
            console.log(e);
          });
      } catch (e) {
        console.log(e);
      }
    };

    fetchData();
  }, [openDialog, otherUserId, token, userId]);

  // 删除自己的账号
  const deleteAccount = async () => {
    try {
      await axios
        .delete(`http://localhost:5000/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          console.log('deleted');
          cookies.remove('TOKEN', { path: '/' });
          cookies.remove('USERNAME', { path: '/' });
          cookies.remove('USERID', { path: '/' });
          console.log('deleted');
          history('/', {});
        })
        .catch((e) => {
          console.log(e);
        });
    } catch (e) {
      console.log(e);
    }
  };


  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleClickOpen = () => {
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  const userconfirm = useConfirm();
  const logout = () => {
    cookies.remove('TOKEN', { path: '/' });
    cookies.remove('USERNAME', { path: '/' });
    cookies.remove('USERID', { path: '/' });

    history('/', {});
  };

  const style = {
    width: '100%',
    maxWidth: 360,
    bgcolor: 'background.paper',
  };

  const commentId = (otherUserId === userId) ? userId : otherUserId;


  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };
  


  return (
    <>
      <Grid container spacing={6} component="main" sx={{margin: '5vh', marginBottom: '10vh'}}>
        <Grid item xs={12} md={4} sm={8}>
          <Avatar
            src={`${avatarUrl}?timestamp=${Date.now()}`}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'full' }}
            alt="profile"
            key={Date.now()}
          />
        </Grid>
        <Grid item xs={12} md={8} sm={4} sx={{padding: '10px'}}>
        <Paper elevation={6} square sx={{width: '50%', margin: 'auto', padding: '30px'}}>
          <Box sx={{
                my: 12,
                mx: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
            <Typography variant="h3" fontWeight="bold" sx={{margin: 0, padding: 0}} >
              {otherUserId === userId ? `${othername},你好！` : `${othername} 的个人主页`}
            </Typography>

            <Divider variant="middle" sx={{ marginY: '1rem' }}/>

            <List sx={style} component="nav" aria-label="mailbox folders">
            <ListItem>
              <ListItemText primary="电子邮箱" secondary={`${email}`} primaryTypographyProps={{fontSize: '24px'}} secondaryTypographyProps={{fontSize: '18px'}} />
            </ListItem>
            <Divider />
            <ListItem divider>
              <ListItemText primary="自我介绍" secondary={(description === "用几句话介绍一下自己吧" && otherUserId !== userId) ? "这个人什么都没有说哦" : `${description}`} primaryTypographyProps={{fontSize: '24px'}} secondaryTypographyProps={{fontSize: '18px'}} />
            </ListItem>
            </List>
          </Box>
          </Paper>
        </Grid>
      </Grid>
      {otherUserId === userId && <Stack direction="row" spacing={5} justifyContent="center" sx={{margin: '5vh'}}>
      <Button variant="outlined" onClick={handleOpenDialog}>
        修改资料
      </Button>
      <Button variant="outlined" onClick={handleDeleteDialogOpen}>
        删除账号
      </Button>
      <Button variant="outlined" onClick={handleOpenPasswordDialog}>
        修改密码
      </Button>
      <Button variant="outlined" onClick={handleClickOpen}>
        登出
      </Button>
    </Stack>}
    
    <Core userId={commentId}/>
     
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="md" // 调整对话框的最大宽度
        fullWidth // 设置为 true 以确保对话框占满整个宽度
      >
        <DialogTitle id="alert-dialog-title">
          {"确定退出登录?"}
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button onClick={logout}>
            确定
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="md" // 调整对话框的最大宽度
        fullWidth // 设置为 true 以确保对话框占满整个宽度
      >
        <DialogTitle id="alert-dialog-title">
          {"确定删除账号，该行为不可逆?"}
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>取消</Button>
          <Button onClick={deleteAccount}>
            确定
          </Button>
        </DialogActions>
      </Dialog>
      <EditProfile
        email={email}
        description={description}
        username={othername}
        isOpen={openDialog}
        onOpen={handleOpenDialog}
        onClose={handleCloseDialog}
        token={token}
        userId={userId}
        setAvatarUrl={setAvatarUrl}
        />
        <EditPassword
        isOpen={openPasswordDialog}
        onClose={handleClosePasswordDialog}
        token={token}
        userId={userId}
        onOpen={handleOpenPasswordDialog}
         />
    </>
  );
};

export default Profile;
