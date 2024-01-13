import React, { useEffect, useState } from 'react';
import Cookies from 'universal-cookie';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardMedia, CardContent, CardActions, Collapse, Avatar, IconButton, Typography, Grid, Button, Box, TextField, InputAdornment, Divider, Paper, Stack, List, ListItem, ListItemText, ListItemAvatar, ListItemButton, ListItemIcon, Badge, Container, Chip, Fab, Tooltip, Dialog, DialogActions, DialogTitle } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import NewProduct from './NewProduct';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const Products = () => {
    const cookies = new Cookies();
    const token = cookies.get('TOKEN');
    const userId = cookies.get('USERID');

    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [min, setMin] = useState('');
    const [max, setMax] = useState('');
    const [filterApplied, setFilterApplied] = useState(false);

    // const [isDialogOpen, setDialogOpen] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);

    const handleOpenDialog = () => {
        setOpenDialog(true);
      };
    
    const handleCloseDialog = () => {
        setOpenDialog(false);
      };

    useEffect(() => {
        axios
          .get(`http://localhost:5000/products`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
            setProducts(res.data.products);
            setFilteredProducts(res.data.products);
            // getSchoolsList();
          })
          .catch((e) => {
            console.log('Error fetching listings data');
          });
    }, [openDialog]);

    const handleFilter = (e) => {
        if (search !== '' || min || max) {
          setFilterApplied(true);
        }
        const filtered = products.filter(
          (product) =>
            (product.ProductName.toLowerCase().includes(search.toLowerCase()) || product.ProductCategory.toLowerCase().includes(search.toLowerCase()))&&
            (!min || product.Price >= parseFloat(min)) &&
            (!max || product.Price <= parseFloat(max))
        );
        setFilteredProducts(filtered);
    };

    const clearFilters = (e) => {
        setFilterApplied(false);
        setSearch('');
        setMin('');
        setMax('');
        setFilteredProducts(products);
    };

    const handleKeyDown = (e) => {
        if (
          e.keyCode === 69 || // 'e' key
          e.keyCode === 187 || // '+' key
          e.keyCode === 189 // '-' key
        ) {
          e.preventDefault(); // Prevent the input of these characters
        }
      };

    return(
        <>
    {/* Filter Bar */}
    <Grid container alignItems= "center" justifyContent="center" sx={{   
        display: "flex",
        width: '60%',
        margin: 'auto',
        padding: '30px',
        }} 
        spacing={3}>
        <Grid item xs={12} md={4} sm={6}>
        <TextField
          required
          id="outlined-required"
          label="搜索商品"
          // defaultValue=""
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        />
        </Grid>
        <Grid item xs={12} md={2} sm={3}>
        <TextField
          id="outlined-disabled"
          label="Min"
          // defaultValue=""
          onChange={(e) => setMin(e.target.value)}
            onKeyDown={handleKeyDown}
          InputProps={{
            startAdornment:(
            <InputAdornment position="start">￥</InputAdornment>)}}
        />
        </Grid>
        <Grid item xs={12} md={2} sm={3}>
        <TextField
          id="outlined-disabled"
          label="Max"
          // defaultValue=""
          onChange={(e) => setMax(e.target.value)}
            onKeyDown={handleKeyDown}
          InputProps={{
            startAdornment:(
            <InputAdornment position="start">￥</InputAdornment>)}}
        />
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
    {/* Products */}
    <Grid container spacing={3} justifyContent="center">
    {filteredProducts
    .filter((product) => product.ProductState === 'available')
    .map((product) => (
      <Grid item key={product.ProductID} style={{ minWidth: '350px' }}>
        <SingleProduct
          productId={product.ProductID}
          productName={product.ProductName}
          price={product.Price}
          sellerId={product.SellerID}
          releaseDate={product.ReleaseDate}
          description={product.Description}
          productCategory={product.ProductCategory}
          userId={userId}
          setProducts={setProducts}
          setFilteredProducts={setFilteredProducts}
          token={token}
        />
      </Grid>
  ))}
    </Grid>
    <Box sx={{position:"fixed", right:"40px", bottom:"30px", zIndex: 100}}>
    <Tooltip title="添加商品" arrow>
        <Fab color="primary" aria-label="add" onClick={handleOpenDialog}>
            <AddIcon />  
            {/* 添加商品 */}
        </Fab>
    </Tooltip>
    </Box>

    <NewProduct 
        props={{userId, token}}
        isOpen={openDialog}
        onOpen={handleOpenDialog} 
        onClose={handleCloseDialog} />
    </>
    );
}



const SingleProduct = ({ productId, productName, price, sellerId, releaseDate, description, productCategory, userId, setProducts, setFilteredProducts, token}) => {
    const navigate = useNavigate();

    const handleClick = (e) => {
        navigate(e.currentTarget.id);
    };

    const [images, setImages] = useState([]);
    const [firstImage, setFirstImage] = useState(null);

    let dataimages = [];
    useEffect(() => {
        // 在组件挂载时从后端获取图片数据
        const fetchImages = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/images/products/${productId}`);
                dataimages = response.data.images;
                setImages(dataimages);
                setFirstImage(dataimages[0]);
        } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
    }, [productId]);

    const sellerAvatar = `http://localhost:5000/images/users/${sellerId}`;

    const [dialogOpen, setDialogOpen] = React.useState(false);

    const handleClickOpen = (e) => {
      e.stopPropagation();
      setDialogOpen(true);
    };

    const handleClose = () => {
      setDialogOpen(false);
    };

    const handleDelete = async () => {
      try {
        await axios
          .delete(`http://localhost:5000/product/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
            console.log('deleted');
            setProducts((prev) => prev.filter((product) => product.ProductID !== productId));
            setFilteredProducts((prev) => prev.filter((product) => product.ProductID !== productId));
          })
          .catch((e) => {
            console.log(e);
          });
      } catch (e) {
        console.log(e);
      }
    }

    return (
      <>
    <Card sx={{ maxWidth: 345, cursor: "pointer" }} id={productId} onClick={handleClick}>
      <CardHeader
        avatar={
          <Avatar src={sellerAvatar} alt={`${sellerId}`}/>
        }
        title={`${productName}`}
        subheader={`${releaseDate}`}
      />
      <CardMedia
        component="img"
        height="250"
        src={`data:image/jpeg;base64,${firstImage}`}
        alt={`${productName}`}
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
            {`${description}`}
        </Typography>
      </CardContent>
      
      <Divider />
      <CardContent>
      <Chip label={`${productCategory}`} color="primary" variant="outlined" />
      </CardContent>
      <Divider />
      <CardContent>
      <Typography variant="body1" gutterBottom>
        价格: {`${price}`}元
        </Typography>
        </CardContent>
      <CardActions>
      {sellerId === userId ? (
      <Button size="small" color="primary" startIcon={<DeleteOutlineIcon/>} onClick={handleClickOpen}>
        删除
      </Button>
    ) : (
      <div style={{ width: 48, height: 30 }} /> // 占位
    )}
      </CardActions>
    </Card>
    <Dialog
        open={dialogOpen}
        onClose={handleClose}
        maxWidth="md" // 调整对话框的最大宽度
        fullWidth // 设置为 true 以确保对话框占满整个宽度
      >
        <DialogTitle id="alert-dialog-title">
          {"确定删除这件商品?"}
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button onClick={handleDelete}>
            确定
          </Button>
        </DialogActions>
      </Dialog>
    </>
    );
}

export default Products;