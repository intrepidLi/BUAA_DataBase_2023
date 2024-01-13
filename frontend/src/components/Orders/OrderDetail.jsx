import * as React from 'react';
import {Box, Modal, List, Paper, ListItemButton, ListItemText, Grid, Input, TextField, Select, MenuItem,
    Dialog, DialogActions, DialogTitle, Button, ListItemAvatar, ListItem, Typography, Divider, Avatar, Rating, ListItemIcon} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import axios from "axios";
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';


const OrderDetail = ({open, onClose, order, seller, buyer, isSeller, product, token, setOrders, setSellOrders, fetchSellingOrders, fetchBuyingOrders}) => {
    const [score, setScore] = React.useState(0)

    const handleScore = async () => {
        try {
            console.log(score);
           await axios.post(
                `http://localhost:5000/orders/scores/${order.OrderID}`, 
                {Score: score},
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                }
            ).then((res) => {
                console.log(res);
                toast.success(`感谢您的配合!`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    });
                    fetchSellingOrders();
                    fetchBuyingOrders();
                    onClose();
            })
            .catch((e) => {
                console.log(e);
            });
            
        }
        catch (e) {
            console.log(e);
        }
    }

    const handleConfirm = async () => {
        try {
            await axios.post(
                `http://localhost:5000/orders/confirm/${order.OrderID}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            ).then((res) => {
                console.log(res);
                toast.success(`已确认卖出!`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    });
                    fetchSellingOrders();
                    fetchBuyingOrders();
                onClose();
            })
            .catch((e) => {
                console.log(e);
            });
            
        }
        catch (e) {
            console.log(e);
        }
    }

    const handleClickBuyer = () => {
        window.open(`/users/${buyer.UserID}`, '_blank');
    }

    const handleClickSeller = () => {
        window.open(`/users/${seller.UserID}`, '_blank');
    }

    return (
    <Dialog open={open} onClose={onClose}>
    <DialogTitle>
        订单详情
        </DialogTitle>
        {isSeller ? ( // 是卖家的话，显示确认或取消
        <>
            <List component={"div"}>
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
                <ListItem>
                    <ListItemButton onClick={handleClickBuyer}>
                    <ListItemAvatar>
                        <Avatar src={`http://localhost:5000/images/users/${buyer.UserID}`} alt='seller avatar' />
                    </ListItemAvatar>
                    <ListItemText primary={
                        <Typography variant="subtitle1" fontWeight="bold">
                        买家：{`${buyer.UserName}`}
                        </Typography>
                        } 
                        secondary={
                        <React.Fragment>
                        <Typography variant="subtitle2"  sx={{ display: 'inline' }}
                        component="span" >
                        买家联系方式：
                        </Typography>
                        {buyer.Email}
                        </React.Fragment>
                        }
                        />
                    </ListItemButton>
                </ListItem>
                <Divider />
                <ListItem divider>
                  <ListItemText primary={
                        <Typography variant="subtitle1" fontWeight="bold">
                        下单时间：{`${order.OrderDate}`}
                        </Typography>
                  } 
                  />
                </ListItem>
                <Divider />
                <ListItem divider>
                    <ListItemText>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'inline' }}
                        component="span"  >
                        订单状态：
                        </Typography>
                        {order.OrderStatus === "reserve" ? "未完成，正在等待您的确认" : "已完成"}
                    </ListItemText>
                    <ListItemIcon>
                        {order.OrderStatus === "reserve" ? <HourglassBottomIcon style={{ color: 'blue' }}/> : <CheckCircleOutlineIcon style={{ color: 'green' }}/>}
                        </ListItemIcon>
                </ListItem>
            </List>
            <DialogActions>
                <Button onClick={onClose}>取消</Button>
                {order.OrderStatus === "finish" ? null : <Button onClick={handleConfirm}>确认卖出</Button>}
            </DialogActions>
        </>

        ):(<>
            <List component={"div"}>
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
                <ListItem>
                    <ListItemButton onClick={handleClickSeller}>
                    <ListItemAvatar>
                        <Avatar src={`http://localhost:5000/images/users/${seller.UserID}`} alt='seller avatar' />
                    </ListItemAvatar>
                    <ListItemText primary={
                        <Typography variant="subtitle1" fontWeight="bold">
                        商家：{`${seller.UserName}`}
                        </Typography>
                        } 
                        secondary={
                        <React.Fragment>
                        <Typography variant="subtitle2"  sx={{ display: 'inline' }}
                        component="span" >
                        商家联系方式：
                        </Typography>
                        {seller.Email}
                        </React.Fragment>
                        }
                        />
                    </ListItemButton>
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
                        下单时间：{`${order.OrderDate}`}
                        </Typography>
                  } 
                  />
                </ListItem>
                <Divider />
                <ListItem divider>
                    <ListItemText>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'inline' }}
                        component="span"  >
                        订单状态：
                        </Typography>
                        {order.OrderStatus === "reserve" ? "未完成，请等待商家确认" : "已完成"}
                    </ListItemText>
                    <ListItemIcon>
                        {order.OrderStatus === "reserve" ? <HourglassBottomIcon style={{ color: 'blue' }}/> : <CheckCircleOutlineIcon style={{ color: 'green' }}/>}
                        </ListItemIcon>
                </ListItem>
                {
                (order.OrderStatus === "finish" && order.OrderScore === -1) ? 
                <>
                 <Divider />
                <ListItem divider>
                    <ListItemText>
                        <Typography variant="subtitle2"  sx={{ display: 'inline' }}
                        component="span" >
                        为这笔交易打个分吧：
                        </Typography>
                        <Rating
                        name="simple-controlled"
                        value={score}
                        precision={1}
                        onChange={(event, newValue) => {
                            if (newValue === null) {
                                setScore(0);
                            }else {
                                setScore(newValue);
                            }
                            console.log(newValue)
                        }}
                        />
                    </ListItemText>
                </ListItem>
                </> : <>
                 <Divider />
                <ListItem divider>
                    <ListItemText>
                        <Typography variant="subtitle1" fontWeight="bold"  sx={{ display: 'inline' }}
                        component="span" >
                        您的评分：
                        </Typography>
                        {order.OrderScore === -1 ? "暂无评分" : <Rating
                        name="read-only"
                        value={order.OrderScore}
                        readOnly
                        />}
                    </ListItemText>
                </ListItem>
                </> }
            </List>
            <DialogActions>
                <Button onClick={onClose}>退出</Button>
                {(order.OrderStatus === "finish" && order.OrderScore === -1) ? <Button onClick={handleScore}>确认打分</Button> : null}
            </DialogActions>
        </>)}
    </Dialog>
      );
};
export default OrderDetail;