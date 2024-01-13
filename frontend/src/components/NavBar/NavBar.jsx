import { Link } from 'react-router-dom';
import Cookies from 'universal-cookie';

import { Badge, AppBar, Avatar, Box, Toolbar, IconButton, Typography, InputBase, MenuItem, Menu, Tooltip, Button, Container, ListItemIcon, ListItemText } from "@mui/material";

import * as React from 'react';
    
import MenuIcon from '@mui/icons-material/Menu';
import AdbIcon from '@mui/icons-material/Adb';
import StoreIcon from '@mui/icons-material/Store';

import { useNavigate } from 'react-router-dom';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import DescriptionIcon from '@mui/icons-material/Description';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

const pages = ['商品', '收藏', '购物车', '订单', '浏览记录', '好评榜'];
const settings = ['我的主页', '登出'];


const NavBar = () => {
    const cookies = new Cookies();
    const token = cookies.get('TOKEN');
    const userId = cookies.get('USERID');

    const avatarUrl = `http://localhost:5000/images/users/${userId}`;
    // 处理跳转逻辑
    const history = useNavigate();

    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);

    const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = (event) => {
        if (event.currentTarget.textContent === '商品') { history('/products', {}); }
        else if (event.currentTarget.textContent === '收藏') { history('/favorites', {}); }
        else if (event.currentTarget.textContent === '购物车') { history('/carts', {}); }
        else if (event.currentTarget.textContent === '订单') { history('/orders', {}); }
        else if (event.currentTarget.textContent === '浏览记录') { history('/historys', {}); }
        else if (event.currentTarget.textContent === '好评榜') { history('/topRating', {}); }

    setAnchorElNav(null);
    };

    const handleCloseUserMenu = (event) => {
        if (event.currentTarget.textContent === '登出') {
            cookies.remove('TOKEN', { path: '/' });
            cookies.remove('USERNAME', { path: '/' });
            cookies.remove('USERID', { path: '/' });
            history('/home', {});
        }
        else if (event.currentTarget.textContent === '我的主页') {
            history(`/users/${userId}`, {});
        }
    setAnchorElUser(null);
    };

    return (
    <AppBar position="static">
        <Container maxWidth="xl">
        <Toolbar disableGutters>
            <StoreIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
            <Typography
            variant="h6"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
            }}
            onClick={() => { history('/home', {}); }}
            >
            BUAA跳蚤市场
            </Typography>
            
        {token && (
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
            >
            <MenuIcon />
            </IconButton>
            <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                display: { xs: 'block', md: 'none' },
                }}
            >
                {pages.map((page) => (
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                    <ListItemIcon>
                    {page === '商品' && <ShoppingBasketIcon fontSize="small" />}
                    {page === '收藏' && <FavoriteIcon fontSize="small" />}
                    {page === '购物车' && <ShoppingCartIcon fontSize="small" />}
                    {page === '订单' && <DescriptionIcon fontSize="small" />}
                    {page === '浏览记录' && <HistoryEduIcon fontSize="small" />}
                    {page === '好评榜' && <ThumbUpIcon fontSize="small" />}
                    </ListItemIcon>           
                    {/* <ListItemText primary="Inbox" />         */}
                    <Typography textAlign="center">{page}</Typography>
                </MenuItem>
                ))}
            </Menu>
            </Box>
            )}

            <StoreIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
            <Typography
            variant="h5"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
            }}
            >
            BUAA跳蚤市场
            </Typography>

        {token && (    
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
                <Button
                key={page}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white'}}
                // color='white'
                component="span"
                startIcon={
                        page === '商品' ? <ShoppingBasketIcon fontSize="small" /> : page === '收藏' ? <FavoriteIcon fontSize="small" /> : page === '购物车' ? <ShoppingCartIcon fontSize="small" /> : page === '订单' ? <DescriptionIcon fontSize="small" /> : page === '浏览记录' ?<HistoryEduIcon fontSize="small" /> : <ThumbUpIcon fontSize="small" />
                    }
                >
                {page}
                </Button>
            ))}
            </Box>
        )}
        {token && (
            <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="打开设置">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt={userId} src={`${avatarUrl}?timestamp=${Date.now()}`} />
                </IconButton>
            </Tooltip>
            <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
            >
                {settings.map((setting) => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                    <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
                ))}
            </Menu>
            </Box>
        )}
        </Toolbar>
        </Container>
    </AppBar>
    );
}
export default NavBar;