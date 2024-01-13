import './Product.css';

import axios from 'axios';
import Cookies from 'universal-cookie';
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import {Avatar, Grid, ListItemButton, autocompleteClasses} from '@mui/material';
import { ImagesearchRollerRounded } from '@mui/icons-material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Button, Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Divider, Paper, Stack, ListItemIcon } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { background, flexbox } from '@chakra-ui/react';
import { ToastContainer, toast } from 'react-toastify';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import OtherPriceModal from './OtherPriceModal';


const Product = () => {
    const cookies = new Cookies();
    const token = cookies.get('TOKEN');
    const userId = cookies.get('USERID');

    const history = useNavigate();

    const [recordedHistory, setRecordedHistory] = useState(false);
    const [product, setProduct] = useState({});
    const [seller, setSeller] = useState({});
    const [images, setImages] = useState([]);
    const pid = window.location.pathname.split('/')[2];

    const [isFavorite, setFavorite] = useState({});
    const [favorites, setFavorites] = useState([]); // [{pid: 1, isFavorite: true}, {pid: 2, isFavorite: false}

    const [isAddedToCart, setAddedToCart] = useState({});
    const [cart, setCart] = useState([]); // [{pid: 1, isAddedToCart: true}, {pid: 2, isAddedToCart: false}

    useEffect(() => {
        getProduct();
        fetchImages();
        fetchFavorites();
        fetchCart();
        getOtherPrice();
        postHistory();
        // console.log("history");
        // fetchSeller();
        // getListingComments();
    }, []);

    // useEffect(() => {
    //   if (!recordedHistory) {
    //     // 执行历史记录的记录逻辑
    //     postHistory();
    //     // 标记为已记录过历史
    //     setRecordedHistory(true);
    //   }
    // }, [recordedHistory]);

    const settings = {
        dots: true,
        infinite: true,
        fade: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        adaptiveHeight: false,
      };

      const style = {
        width: '100%',
        maxWidth: 360,
        bgcolor: 'background.paper',
      };

    let cnt = 0;

    const postHistory = async () => {
      // cnt += 1;
      if (cnt === 0) {
        try {
          await axios.post(`http://localhost:5000/history/${userId}`, {
            ProductID: pid,
            OperationType: "browse",
          }, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}` },
        }
          ).then((res) => {
            console.log(res.data.message);
          })
          .catch((e) => {
            console.log(e);
          });
  
      } catch (e) { 
        console.log(e);
      }
      }
      cnt += 1;
  };

    // let dataimages = [];
    const fetchImages = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/images/products/${pid}`);
            // dataimages = response.data.images;
            setImages(response.data.images);
            // setFirstImage(dataimages[0]);
        } catch (error) {
        console.error('Error fetching images:', error);
            }
    };

    const fetchSeller = async (sellerID) => {
        try {
            const response = await axios.get(`http://localhost:5000/users/${sellerID}`);
            setSeller(response.data);
            // dataimages = response.data.images;
            // setImages(dataimages);
            // setFirstImage(dataimages[0]);
        } catch (error) {
        console.error('Error fetching Seller data:', error);
            }
    };

    const imageSlider = images.length !== 0 ? 
    images.map((base64Image, index) => {return(<img key={index} src={`data:image/png;base64,${base64Image}`} alt={`product-image-${index}` } style={{height: "100%"}}/>
      )}) : <img src='/good_bj1.jpg' alt="Placeholder" style={{ width: "120%", height: "120%", opacity: 1 }}></img>


    //   useEffect(() => {
    //     const slickSlider = document.querySelector('.slider');
    
    //     // 如果已经初始化过，重新刷新设置
    //     if (slickSlider && sliderRef.slick) {
    //       sliderRef.current.slickPause();
    //     }
    
    //     // 初始化或者更新slick轮播
    //     if (slickSlider) {
    //         sliderRef.current.slickPlay();
    //     }
    //   }, [images]); // 仅在images数组发生变化时执行
    let isFav = false;
    const fetchFavorites = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/favorite/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFavorites(response.data.favorite_items);
            console.log(response.data.favorite_items);

            for (let i = 0; i < response.data.favorite_items.length; i++) {
                if (response.data.favorite_items[i].ProductID === parseInt(pid, 10) && response.data.favorite_items[i].UserID === parseInt(userId, 10)) {
                    isFav = true;
                    console.log("isFav:", isFav);
                    setFavorite(true);
                    break;
                }
            }
            // setFavorite(false);
            if (!isFav) {
                setFavorite(false);
            }
        } catch (error) {
        console.error('Error fetching favorite:', error);
        }
    };

    const handleFavoriteClick = () => {
      isFav = !isFav;
        setFavorite((prevFavorite) => {
          const newIsFavorite = !prevFavorite;
          console.log("newIsFavorite:", newIsFavorite);
          if (!newIsFavorite) {
            axios.delete(`http://localhost:5000/favorite/${userId}/${pid}`, {
              headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
              console.log(res.data.message);
              toast.success(`你已取消收藏!`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                });
          })
          .catch((e) => {
              alert(e.response.data.message);
          });
          }

        else {
          axios.post(`http://localhost:5000/favorite/${userId}/${pid}`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
            console.log(res.data.message);
            toast.success(`你已添加收藏!`, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
              });
        })
        .catch((e) => {
            alert(e.response.data.message);
        });
        }

        return newIsFavorite;
      });   
    };

    let addedToCart = false;
    const fetchCart = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/shoppingcart/${userId}`, {  
                headers: { Authorization: `Bearer ${token}` },
            });
            setCart(response.data.shopping_cart_items);
            console.log(response.data.shopping_cart_items);

            for (let i = 0; i < response.data.shopping_cart_items.length; i++) {
                if (response.data.shopping_cart_items[i].ProductID === parseInt(pid, 10) && response.data.shopping_cart_items[i].UserID === parseInt(userId, 10)) {
                    addedToCart = true;
                    console.log("addedToCart:", addedToCart);
                    setAddedToCart(true);
                    break;
                }
            }
            // setAddedToCart(false);
            if (!addedToCart) {
                setAddedToCart(false);
            }
        } catch (error) {
        console.error('Error fetching cart:', error);
        }
    };
    
    const handleAddToCartClick = () => {
      if (userId === seller.UserID) {
        alert("你不能购买自己的商品!");
        return;
      }
        addedToCart = !addedToCart;
        setAddedToCart((prevAddedToCart) => {
          const newIsAddedToCart = !prevAddedToCart;
          console.log("newIsAddedToCart:", newIsAddedToCart);
          if (!newIsAddedToCart) {
            axios.delete(`http://localhost:5000/shoppingcart/${userId}/${pid}`, {
              headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
              console.log(res.data.message);
              toast.success(`你已取消添加购物车!`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                });
          })
          .catch((e) => {
              alert(e.response.data.message);
          });
        }

        else {
          axios.post(`http://localhost:5000/shoppingcart/${userId}/${pid}`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
            console.log(res.data.message);
            toast.success(`你已添加购物车!`, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
              });
        })
        .catch((e) => {
            alert(e.response.data.message);
        });
        }

        return newIsAddedToCart;
      });
    };

    const getProduct = () => {
        axios
          .get(`http://localhost:5000/product/${pid}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
            setProduct({ ...res.data });
            
            // let sellerID = product.SellerID;
            // console.log("sellerID:", sellerID);
            // console.log(product);
            fetchSeller(res.data.SellerID);
            // postHistory();
          })
          .catch((e) => console.log("error:", e));
      };


    const [otherPrices, setOtherPrices] = useState([])  
    const getOtherPrice = () => {
        axios
          .get(`http://localhost:5000/price/${pid}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
            setOtherPrices(res.data.price_items);
          })
          .catch((e) => console.log("error:", e));
      };


    const handleSellerClick = () => {
        history(`/users/${seller.UserID}`);
    };

    const [openModal, setOpenModal] = useState(false);

    const handleOpen = () => setOpenModal(true);
    const handleClose = () => setOpenModal(false);

   
      return (
        <>
          <Grid container spacing={6} component="main" sx={{margin: '5vh', marginBottom: '10vh'}}>
            <Grid item xs={12} md={4} sm={8}>
            <Slider {...settings} className='slider' sx={{display: "flex", height: '100%', justifyContent: 'center', alignItems: 'center'}}>
               {imageSlider}
            </Slider>
            </Grid>
            <Grid item xs={12} md={8} sm={4} sx={{padding: '10px', display: 'flex'}}>
            <Paper elevation={6} square sx={{width: '50%', margin: 'auto', padding: '30px', paddingTop: '1px'}}>
              <Box sx={{
                    my: 12,
                    mx: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                <Typography variant="h4" fontWeight="bold" sx={{margin: 0, padding: 0}} >
                  商品详情
                </Typography>
    
                <Divider variant="middle" sx={{ marginY: '1rem' }}/>
    
                <List sx={style} component="nav" aria-label="mailbox folders">
                <ListItem>
                  <ListItemText primary={
                        <Typography variant="subtitle1" fontWeight="bold"  sx={{ display: 'inline' }}
                        component="span" >
                        商品名称：{`${product.ProductName}`}
                        </Typography>
                  } 
                  />
                </ListItem>
                <Divider />
                <ListItemButton divider onClick={handleSellerClick}>
                    <ListItemAvatar>
                        <Avatar src={`http://localhost:5000/images/users/${seller.UserID}`} alt='seller avatar' />
                    </ListItemAvatar>
                    <ListItemText primary={
                        <Typography variant="subtitle1" fontWeight="bold">
                        卖家：{`${seller.UserName}`}
                        </Typography>
                        } 
                        secondary={
                        <React.Fragment>
                        <Typography variant="subtitle2"  sx={{ display: 'inline' }}
                        component="span" >
                        卖家联系方式：
                        </Typography>
                        {seller.Email}
                        </React.Fragment>
                        }
                        />
                </ListItemButton>
                <Divider />
                <ListItem divider>
                  <ListItemText primary={
                        <Typography variant="subtitle1" fontWeight="bold"  >
                        商品种类：{`${product.ProductCategory}`}
                        </Typography>
                  } 
                  />
                </ListItem>
                <Divider />
                <ListItem divider>
                  <ListItemText primary={
                        <Typography variant="subtitle1" fontWeight="bold" >
                        商品价格：{`${product.Price}`}元
                        </Typography>
                  } 
                  />
                </ListItem>
                <Divider />
                <ListItem divider>
                  <ListItemText primary={
                        <Typography variant="subtitle1" fontWeight="bold">
                        商品描述：
                        </Typography>
                  } secondary={
                        <Typography variant="body1"  sx={{ display: 'inline' }}
                        component="span" >
                        {product.Description}
                        </Typography>
                  }
                  />
                </ListItem>
                <Divider />
                <ListItem divider>
                  <ListItemText primary={
                        <Typography variant="subtitle1" fontWeight="bold">
                        发布时间：{`${product.ReleaseDate}`}
                        </Typography>
                  } 
                  />
                </ListItem>

                <Divider />
                <ListItemButton onClick={handleOpen}>
                    <ListItemText primary={
                        <Typography variant="subtitle1" fontWeight="bold">
                        其他平台价格
                        </Typography>
                  } />
                  </ListItemButton>
                </List>
              </Box>
              </Paper>
            </Grid>
          </Grid>
        
        <Stack direction="row" spacing={5} justifyContent="center" sx={{margin: '5vh'}}>
        <Button variant={isFavorite ? 'contained' : 'outlined'} onClick={handleFavoriteClick} startIcon={isFavorite ?  <FavoriteIcon /> : <FavoriteBorderIcon />}>
                收藏
        </Button>
        <Button variant={isAddedToCart ? 'contained' : 'outlined'} onClick={handleAddToCartClick} startIcon={isAddedToCart ?  <ShoppingCartIcon /> : <AddShoppingCartIcon />}>
                加入购物车
            </Button>
        </Stack>
        <OtherPriceModal open={openModal} onClose={handleClose} otherPrices={otherPrices} />
        </>
      );
}

export default Product;