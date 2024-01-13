import axios from "axios";
import React, { useEffect, useState } from 'react';
import Cookies from 'universal-cookie';
import { Grid, Button, Box, Typography, Avatar, Card, CardContent, Rating, CardMedia, CardActions } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from "react-router-dom";

const TopRating = () => {
    const [topRating, setTopRating] = useState([]);
    const cookies = new Cookies();
    const token = cookies.get('TOKEN');
    const userId = cookies.get('USERID');


    const fetchTopRating = async () => {
        axios.get(`http://localhost:5000/toprating`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
            setTopRating(res.data.toprating_items);
        })
        .catch((e) => {
            console.log('Error fetching toprating data');
            console.log(e);
        });
    }

    useEffect(() => {
        fetchTopRating();
    }, []);

    return (
        <React.Fragment>
            <Typography variant='h3' fontWeight="bold" textAlign="Center" sx={{margin: "20px"}}>
                好评榜（每天中午12点更新）
            </Typography>
            <Box sx={{width: '60%', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: 'auto'}}>
                {topRating.map((topRating) => {
                    return (
                        <SingleTopRating
                            topRating={topRating} 
                            token={token}
                        />
                );
                })}
            </Box>
        </React.Fragment>
    );
}


const SingleTopRating = ({topRating, token}) => {
    const topUserId = topRating.UserID;
    const [user, setUser] = useState({});

    const fetchUser = async () => {
        axios.get(`http://localhost:5000/users/${topUserId}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
            setUser(res.data);
            console.log('Success fetching user data ');
        })
        .catch((e) => {
            console.log('Error fetching user data');
        });
    }

    useEffect(() => {
        fetchUser();
    }, []);

    const history = useNavigate();
    const handleClick = () => {
        history(`/users/${user.UserID}`, {});
    }

    return(
        <React.Fragment>
            <Box sx={{width: '80%', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px'}}>
                <Card sx={{width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', margin: 'auto', cursor: 'pointer', padding: '20px'}} onClick={handleClick}>
                    <CardMedia
                        sx={{width: '20%'}}>
                    <Avatar src={`http://localhost:5000/images/users/${topUserId}`} alt={`${topUserId}`} sx={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: 'full' }}/>
                    </CardMedia>
                    <CardContent sx={{width: '80%', display: 'flex', alignItems: 'center'}}>
                    <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <Typography gutterBottom variant="h5" color="text.primary" fontWeight={"bold"} display={"inline"}>
                            {user.UserName}
                        </Typography>
                        </Grid>
                        <Grid item xs={4}>
                        <Typography variant="title1" color="text.secondary" fontWeight={"bold"} display={"inline"}>
                            综合评分：{topRating.AverageRating}
                        </Typography>
                        </Grid>
                        <Grid item xs={4}>
                        <Rating name="read-only" value={topRating.AverageRating} readOnly />
                        </Grid>
                    </Grid>
                    </CardContent>  
                    <CardActions>
                        <Button size="small" variant="contained" endIcon={<ArrowForwardIcon />}>
                            查看他的个人主页
                        </Button>
                    </CardActions>
                </Card>
            </Box>
        </React.Fragment>
    );
}
export default TopRating;