import axios from 'axios';
import React from 'react';
import { useState, useEffect } from 'react';
import { set } from 'react-hook-form';
import Cookies from 'universal-cookie';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Typography, Card, CardContent, CardActions, CardMedia, Box, Button, Grid } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import DetailsIcon from '@mui/icons-material/Details';
import OrderDetail from './OrderDetail';


const Order = ({ order, isSeller, token, handleOpenDialog, handleCloseDialog, openDialog, setOrders, setSellOrders, userId, fetchBuyingOrders, fetchSellingOrders }) => {


    const [product, setProduct] = useState({});
    const [firstImage, setFirstImage] = useState('');
    const [seller, setSeller] = useState({});
    const [buyer, setBuyer] = useState({});

    const fetchData = async () => {
        console.log("enter fetchData order")
        try {
            const result = await axios.get(
            `http://localhost:5000/product/${order.ProductID}`, {
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
            const response = await axios.get(`http://localhost:5000/images/products/${order.ProductID}`);
            // dataimages = response.data.images;
            // setImages(dataimages);
            setFirstImage(response.data.images[0]);
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    };

    const fetchSellerData = async () => {
        try {
            await axios.get(
                `http://localhost:5000/orders/seller/${order.OrderID}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            ).then((res) => {
                setSeller(res.data);
            })
            .catch((e) => {
                console.log(e);
            });
        }
        catch (e) {
            console.log(e);
        }
    }

    const fetchBuyerData = async () => {
        try {
            await axios.get(
                `http://localhost:5000/users/${order.UserID}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            ).then((res) => {
                setBuyer(res.data);
            })
            .catch((e) => {
                console.log(e);
            });
        }
        catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        fetchImage();
        fetchData();
        if (!isSeller) {
            fetchSellerData();
        } else {
            fetchBuyerData();
        }
        // fetchSellerData();
    }, [openDialog, order]);


    const content = () => {
        if (!isSeller) {
            return(
            <React.Fragment>
            <Typography component="div" variant="h5" sx={{width: '80%'}}>
                {product.ProductName}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" component="div">
               ￥ {product.Price}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" component="div">
               订单状态：{order.OrderStatus === "reserve" ? "未完成，请等待商家确认" : "已完成"}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" component="div">
               商家联系方式：{seller.Email}
              </Typography>
              {(order.OrderStatus === "reserve" || order.OrderScore !== -1) ? null : <Typography variant="subtitle1" color="text.secondary" component="div"> 您还没有评分哦，点击订单给这笔交易评个分吧 </Typography>}
              </React.Fragment>
            )
        } else {
            return(<React.Fragment>
                <Typography component="div" variant="h5" sx={{width: '80%'}}>
                    买家{buyer.UserName} 求购了您的好物：{product.ProductName}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary" component="div">
                   订单状态：{order.OrderStatus === "reserve" ? "未完成，请确认是否出售" : "已完成"}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary" component="div">
                   买家联系方式：{buyer.Email}
                  </Typography>
                </React.Fragment>
                  );
        }
    }

    

    return (
    <>
        <Card sx={{ display: 'flex', width: '100%', cursor: 'pointer', margin: '20px', height: '300px', padding: '20px'}} onClick={handleOpenDialog} id={`${product.ProductID}`}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', minHeight: '200px', width: '80%' }}>
        <CardContent sx={{ flex: '1 0 auto', alignItems: 'center',  width: '100%'}}>
        {content()}
        </CardContent>
      </Box>
      
      <CardMedia
        component="img"
        sx={{width: '20%', height: 'auto'}}
        src={`data:image/jpeg;base64,${firstImage}`}
        alt="product image"
      />
    </Card>
    <OrderDetail
    open={openDialog}
    onClose={handleCloseDialog}
    order={order}
    seller={seller}
    buyer={buyer}
    isSeller={isSeller}
    product={product}
    token={token}
    setOrders={setOrders}
    setSellOrders={setSellOrders}
    fetchBuyingOrders={fetchBuyingOrders}
    fetchSellingOrders={fetchSellingOrders}
     ></OrderDetail>
    </>
    )
}

export default Order;