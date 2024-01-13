import axios from 'axios';
import React from 'react';
import { useState, useEffect } from 'react';
import { set } from 'react-hook-form';
import Cookies from 'universal-cookie';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Typography, Card, CardContent, CardActions, CardMedia, Box, Button, Grid } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import PaymentIcon from '@mui/icons-material/Payment';

const Carts = ({props}) => {
    const [carts, setCarts] = useState([]);
    const cookies = new Cookies();
    const token = cookies.get('TOKEN');
    const userId = cookies.get('USERID');
    const [dialogOpen, setDialogOpen] = React.useState(false);

    console.log(userId);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await axios.get(
                `http://localhost:5000/shoppingcart/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log(result.data.shopping_cart_items);
            setCarts(result.data.shopping_cart_items);
        } catch (error) {
            console.log(error);
        }; 
    }

        fetchData();
    }, [userId, token]);

    return (
        <React.Fragment>
            <Typography variant='h3' fontWeight="bold" textAlign="Center" sx={{margin: "20px"}}>
                购物车
            </Typography>
            <Box sx={{width: '60%', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: 'auto'}}>
                {carts.map((cart) => {
                    console.log("cart");
                    console.log(cart);
                    return (
                        <SingleCart
                            cart={cart} 
                            setCarts={setCarts} 
                            token={token}
                        />
                );
                })}
            </Box>
        </React.Fragment>
    );

}

const SingleCart = (props) => {
    const {cart, setCarts, token} = props;

    const navigator = useNavigate();

    const [product, setProduct] = useState([]);
    const [firstImage, setFirstImage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await axios.get(
                `http://localhost:5000/product/${cart.ProductID}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
                );
                console.log(result.data);
                setProduct(result.data);
            } catch (error) {
                console.log(error);
            }; 
        }

        const fetchImage = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/images/products/${cart.ProductID}`);
                // dataimages = response.data.images;
                // setImages(dataimages);
                setFirstImage(response.data.images[0]);
            } catch (error) {
                console.error('Error fetching images:', error);
            }
        };

        fetchImage();
        fetchData();
    }, [cart]);

    const handleDelete = async (e) => {
        e.stopPropagation();
        
        try {
            await axios.delete(
                `http://localhost:5000/shoppingcart/${cart.UserID}/${cart.ProductID}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            ).then((res) => {
                setCarts((prevCarts) => {
                    console.log("prevCarts");
                    console.log(prevCarts);
                    const fileteredcarts = prevCarts.filter((prevcart) => prevcart.ProductID !== cart.ProductID);
                    console.log(fileteredcarts);

                    return fileteredcarts;
                });
                toast.success(`已从购物车中删除!`, {
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
                console.log('Error deleting cart');
                console.log(e);
            });
            // console.log(result.data);
            // setProduct(result.data);
        } catch (error) {
            console.log(error);
        }; 
    }

    const handleBuy = async (e) => {
        e.stopPropagation();
        try{
            await axios.post(
                `http://localhost:5000/orders/${cart.UserID}`, 
                {
                    ProductID: product.ProductID,
                  }, 
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                }
            ).then((res) => {
                setCarts((prevCarts) => {
                    console.log("prevCarts");
                    console.log(prevCarts);
                    const fileteredcarts = prevCarts.filter((prevcart) => prevcart.ProductID !== cart.ProductID);
                    console.log(fileteredcarts);

                    return fileteredcarts;
                });
                toast.success(`已下单!`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    });
            }).catch((e) => {
                console.log('Error buying cart');

                console.log(e);
            });
        }
        catch (error) {
            console.log(error);
        };
    }

    const handleClick = (e) => {
        navigator('/products/' + e.currentTarget.id);
    };

    return (
        <Card sx={{ display: 'flex', width: '100%', cursor: 'pointer', margin: '20px', height: '300px', padding: '20px'}} onClick={handleClick} id={`${product.ProductID}`}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', minHeight: '200px', width: '80%' }}>
        <CardContent sx={{ flex: '1 0 auto', alignItems: 'center',  width: '100%'}}>
          <Typography component="div" variant="h5" sx={{width: '80%'}}>
            {`${product.ProductName}`}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" component="div">
           ￥ {`${product.Price}`}
          </Typography>
        </CardContent>
        <CardActions>
        <Button size="medium" color="primary" startIcon={<DeleteOutlineIcon/>}
         onClick={handleDelete}>
          删除
        </Button>
        <Button size="medium" color="primary" startIcon={<PaymentIcon/>}
         onClick={handleBuy}>
          结算
        </Button>
        </CardActions>
      </Box>
      
      <CardMedia
        component="img"
        sx={{width: '20%', height: 'auto'}}
        src={`data:image/jpeg;base64,${firstImage}`}
        alt="product image"
      />
      
      
    </Card>
    )

}

export default Carts;