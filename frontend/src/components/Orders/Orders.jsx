import React, { useEffect, useState } from 'react';
import Cookies from 'universal-cookie';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardMedia, CardContent, CardActions, Collapse, Avatar, IconButton, Typography, Grid, Button, Box, InputLabel, Select, MenuItem, FormControl } from '@mui/material';
import Order from './Order';
import ClearIcon from '@mui/icons-material/Clear';

const Orders = () => {
    const cookies = new Cookies();
    const token = cookies.get('TOKEN');
    const userId = cookies.get('USERID');

    const [orders, setOrders] = useState([]);
    const [buyOrders, setBuyOrders] = useState([]);
    const [sellOrders, setSellOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [sellBuy, setSellBuy] = useState('');
    const [ingOrEnd, setIngOrEnd] = useState('');
    const [filterApplied, setFilterApplied] = useState(false);

    const fetchBuyingOrders = async () => {
        try {
            await axios.get(`http://localhost:5000/orders/${userId}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setBuyOrders(res.data.orders);
                console.log("success fetch buyingOrders");
            })
            .catch((e) => {
                console.log('Error fetching buyingOrders data');
              })
        }
        catch(e) {
                console.log(e);
        }
    }

    const fetchSellingOrders = async () => {
        try {
            await axios.get(`http://localhost:5000/selling_orders/${userId}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setSellOrders(res.data.selling_orders_items);
                console.log("success fetch sellingOrders ");
            })
            .catch((e) => {
                console.log('Error fetching sellingOrders data');
              })
        }
        catch (e){
                console.log(e);
        }
    }

    useEffect(() => {
        fetchBuyingOrders();
        fetchSellingOrders();
    }, []);

    useEffect(() => {
        // 在 buyOrders 或 sellOrders 变化时更新 orders
        setOrders([...buyOrders, ...sellOrders]);
        setFilteredOrders([...buyOrders, ...sellOrders]);
      }, [buyOrders, sellOrders]);

    const handleFilter = (e) => {
        if (sellBuy !== '' || ingOrEnd !== '') {
          setFilterApplied(true);
        }
        let filtered;
        if (sellBuy === "buy") {
            if (ingOrEnd === '') {
                filtered = buyOrders;
            } else {
                filtered = buyOrders.filter((order) => order.OrderStatus === ingOrEnd);
            }
        } else if (sellBuy === "sell") {
            if (ingOrEnd === '') {
                filtered = sellOrders;
            } else {
                filtered = sellOrders.filter((order) => order.OrderStatus === ingOrEnd);
            }
        } else {
            if (ingOrEnd === '') {
                filtered = orders;
            } else {
                filtered = orders.filter((order) => order.OrderStatus === ingOrEnd);
            }
        }

        setFilteredOrders(filtered);
    };

    const clearFilters = (e) => {
        setFilterApplied(false);
        setSellBuy('');
        setIngOrEnd('');
        setFilteredOrders(orders);
    };

    const handleSellBuyChange = (event) => {
        setSellBuy(event.target.value);
      };

    const handleIngOrEndChange = (event) => {
        setIngOrEnd(event.target.value);
      };

      const [openDialogs, setOpenDialogs] = useState({});


      const handleOpenDialog = (orderId) => {
        setOpenDialogs((prevOpenDialogs) => ({
          ...prevOpenDialogs,
          [orderId]: true,
        }));
      };
    
      const handleCloseDialog = (orderId) => {
        setOpenDialogs((prevOpenDialogs) => ({
          ...prevOpenDialogs,
          [orderId]: false,
        }));
      };

    return (
        <>
        <Typography variant='h3' fontWeight="bold" textAlign="Center" sx={{margin: "20px"}}>
                我的订单
        </Typography>
        <Grid container alignItems= "center" justifyContent="center" sx={{   
        display: "flex",
        width: '60%',
        margin: 'auto',
        padding: '30px',
        }} 
        spacing={3}>
        <Grid item xs={12} md={4} sm={6}>
    <FormControl sx={{ width: '100%' }}>
        <InputLabel id="demo-simple-select-label">买家/卖家</InputLabel>
        <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select1"
            value={sellBuy}
            label="买家/卖家"
            onChange={handleSellBuyChange}
        >
    <MenuItem value={"buy"}>我买的</MenuItem>
    <MenuItem value={"sell"}>我卖的</MenuItem>
  </Select>
  </FormControl>
  </Grid>

  <Grid item xs={12} md={4} sm={6}>
  <FormControl sx={{ width: '100%' }}>
        <InputLabel id="demo-simple-select-label1">未完成/已完成</InputLabel>
        <Select
            labelId="demo-simple-select-label1"
            id="demo-simple-select2"
            value={ingOrEnd}
            label="未完成/已完成"
            onChange={handleIngOrEndChange}
        >
    <MenuItem value={"reserve"}>未完成</MenuItem>
    <MenuItem value={"finish"}>已完成</MenuItem>
  </Select>
  </FormControl>
        </Grid>
      <Grid item xs={12} md={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleFilter}
        >
          筛选结果
        </Button>
      </Grid>
      {filterApplied && (
        <Grid item xs={12} md={2}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={clearFilters}
          >
            <ClearIcon />
            清除筛选
          </Button>
        </Grid>
      )}
    </Grid>
    <Box sx={{width: '60%', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: 'auto'}}>
                {filteredOrders.map((filteredOrder) => {
                    return (
                        <Order
                            key={filteredOrder.OrderID}
                            order={filteredOrder}
                            isSeller={userId === filteredOrder.UserID ? false: true}
                            token={token}
                            openDialog={openDialogs[filteredOrder.OrderID] || false}
                            handleCloseDialog={() => handleCloseDialog(filteredOrder.OrderID)}
                            handleOpenDialog={() => handleOpenDialog(filteredOrder.OrderID)}
                            setSellOrders={setSellOrders}
                            setOrders={setOrders}
                            userId={userId}
                            fetchBuyingOrders={fetchBuyingOrders}
                            fetchSellingOrders={fetchSellingOrders}
                        />
                );
                })}
    </Box>


        </>
    )
    
}

export default Orders;