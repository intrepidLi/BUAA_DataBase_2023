import React, { useEffect } from 'react';
import Cookies from 'universal-cookie';
import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import { Box, Divider, Stack, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

const Homepage = () => {
    const cookies = new Cookies();
    const token = cookies.get('TOKEN');
    
    const [username, setUsername] = useState('');
    const userId = cookies.get('USERID');

    const navigate = useNavigate();

    const fetchUsername = async() => {
      await axios
      .get(`http://localhost:5000/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUsername(res.data.UserName);
        console.log("getUsername success");
      })
      .catch((e) => {
        console.log(e);
        console.log("getUsername failed");
      });
    }

    useEffect (() => {
      fetchUsername();
    }, [userId, token]);
  

    return(
        <React.Fragment>

        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', margin: '20px' }}>
            <Typography variant='h3' fontWeight="bold" textAlign="Center">
            {token ? `欢迎来到我们的跳蚤市场${username ? ' ' + username : ''}!🤗` : '亲🥰，请先注册或登录哦！'}
            </Typography>


        </Box>

        {!token && <Stack direction="row" spacing={5} justifyContent="center" sx={{margin: '5vh'}}>
      <Button variant="outlined" onClick={(e) => {
        navigate('/signup');
      }}>
        注册
      </Button>
      <Button variant="outlined" onClick={(e) => {
        navigate('/');
      }}>
        登录
      </Button>
    </Stack>}

        {token && <Typography variant='h5' textAlign="Center">
            你可以在这里和其他人交易你的二手商品，快去探索一下吧。
        </Typography>}
        
        </React.Fragment>
    );
}  

export default Homepage;
