import { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Grid, Input, TextField, Select, MenuItem,
Dialog, DialogActions, DialogTitle, Button, DialogContent, Avatar } from '@mui/material';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { ToastContainer, toast } from 'react-toastify';
import { set } from 'zod';

const EditProfile = ({email, description, username, isOpen, onClose, onOpen, token, userId, setAvatarUrl}) => {
    const [newUsername, setNewUsername] = useState(username);
    const [newEmail, setNewEmail] = useState(email);
    const [newDescription, setNewDescription] = useState(description);
    const [newAvatar, setNewAvatar] = useState(null);

    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');


    const handleFileChange = (e) => {
        setNewAvatar(e.target.files[0])
    };

    const resetFormNew = () => {
        setNewUsername(newUsername);
        setNewEmail(newEmail);
        setNewDescription(newDescription);
        setNewAvatar(null);
    };

    const resetFormOld = () => {
      setNewUsername(username);
      setNewEmail(email);
      setNewDescription(description);
      setNewAvatar(null);
  };


    const submit = async (e) => {
        e.preventDefault();

        // console.log(newEmail)
        // 邮箱格式验证
        
        if (!newDescription || newDescription.trim() === '') {
          setNewDescription(description);
        }
        
    
        const formData = new FormData();
        
        // console.log(props.username);
        // console.log(props.token);
        if (!newUsername || newUsername.trim() === '') {
          setNewUsername(username);
          formData.append('username', username);
        } else {
          formData.append('username', newUsername);
        }
        
        if (!newEmail || newEmail.trim() === '') {
          setNewEmail(email);
          formData.append('email', email);
        } else {
          const emailRegex = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
          if (emailRegex.test(newEmail.trim())) {
            formData.append('email', newEmail);
          } else {
            alert('请输入有效的邮箱地址');
            return;
          }
        }
        if (!newDescription || newDescription.trim() === '') {
          setNewDescription(description);
          formData.append('description', description);
        } else {
          formData.append('description', newDescription);
        }
        
        formData.append('avatar', newAvatar);
      
        console.log(userId)
        axios.post(`http://localhost:5000/users/update/${userId}`,
         formData, 
         {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          toast.success(`成功修改个人资料!`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            });
          console.log(res.data.message);
          // setAvatarUrl(`http://localhost:5000/images/users/${userId}`);
          resetFormNew();
          onClose();
        })
        .catch((e) => {
          alert(e.response.data.message);
          console.log(e); 
          resetFormOld();
          onClose();
        });
        // }
      };

      const getDescriptionLabel = (description) => {
        // 截取前15个字符
        const truncatedDescription = description.slice(0, 15);
      
        return truncatedDescription;
      };

    return (
        <Dialog open={isOpen} onClose={onClose}>
         <DialogTitle>
          修改个人信息
          </DialogTitle>
         <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              id="username"
              name="username"
              label={"用户名"}
              fullWidth
              autoComplete="username"
              variant="standard"
              onChange={(e) => setNewUsername(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              id="email"
              name="email"
              label={"邮箱"}
              fullWidth
              autoComplete="email"
              variant="standard"
              onChange={(e) => {
                console.log(e.target.value);
                setNewEmail(e.target.value)
                }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              id="description"
              name="description"
              label={"个人简介"}
              fullWidth
              multiline
            inputProps={{ style: { resize: "both" } }}
              autoComplete="user description"
              variant="standard"
              onChange={(e) => {
                console.log(e.target.value);
                setNewDescription(e.target.value)
                }}
            />
          </Grid>
          <Grid item xs={12}>
          <Input
              type="file"
              id="imageInput"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              multiple
              accept="image/*"
          />
          <Button variant="contained" color="primary" component="span" startIcon={<CloudUploadIcon />}
              onClick={() => {
              // 获取 input 标签的 DOM 节点
              const input = document.getElementById('imageInput');
              // 触发 input 标签的点击事件
              input.click();  }} > 
              请上传头像
              </Button>
              {newAvatar !== null && (
              <Grid item>
                <span key={0}>{newAvatar.name}</span>
              </Grid>
            )}
          </Grid>
          
          
        </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            color="primary"
            onClick={onClose}
          >
            取消
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={(e) => {
              submit(e);
              // 添加 toast 逻辑
              
            }}
          >
          保存修改
          {/* {props.listing ? 'Update Listing' : 'Add Listing'} */}
          </Button>
        </DialogActions>
      </Dialog>
      );
}

export default EditProfile;