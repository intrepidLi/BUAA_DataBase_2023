import { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Grid, Input, TextField, Select, MenuItem,
Dialog, DialogActions, DialogTitle, Button, DialogContent } from '@mui/material';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { ToastContainer, toast } from 'react-toastify';

const NewProduct = ({props, isOpen, onOpen, onClose}) => {
    const [name, setName] = useState();
    const [price, setPrice] = useState();
    const [category, setCategory] = useState("书籍文具");
    const [description, setDescription] = useState();
    const [files, setFiles] = useState([]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    };

    const resetForm = () => {
        setName('');
        setPrice('');
        setCategory('书籍文具');
        setDescription('');
        setFiles([]);
    };

    const submit = async (e) => {
        e.preventDefault();
    
        const formData = new FormData();
        console.log(name);
        console.log(category);
        console.log(description);
        console.log(price);
        // console.log(props.token);
        console.log(props.userId);
        formData.append('ProductName', name);
        formData.append('ProductCategory', category);
        formData.append('Description', description);
        formData.append('Price', price);
        formData.append('SellerID', props.userId);
        files.forEach((file, index) => {
          formData.append(`file${index}`, file);
        });
    
        // if (props.listing) {
          // console.log(formData);
          // axios.put(
          //   "http://localhost:5000/product/add",
          //   formData,
          //   {
          //     headers: {
          //       'Content-Type': 'multipart/form-data',
          //       Authorization: `Bearer ${props.token}`,
          //     },
          //   }
          // );
        // } else {
        for (let pair of formData.entries()) {
          console.log(pair[0], pair[1]);
        }
        axios.post('http://localhost:5000/product/add',
         formData, 
         {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${props.token}`,
          },
        })
        .then((res) => {
          toast.success(`你成功添加商品--${name}!`, {
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
        })
        .catch((e) => {
          alert(e.response.data.message);
          console.log(e); 
        });
        // }
        
        resetForm();
        onClose();
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

    return (
      <Dialog open={isOpen} onClose={onClose}>
       <DialogTitle>
        {/* {props.listing ? 'Edit Listing' : 'Add Listing'} */}
        添加商品
        </DialogTitle>
       <DialogContent>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            id="name"
            name="name"
            label="商品名称"
            fullWidth
            autoComplete="product name"
            variant="standard"
            onChange={(e) => setName(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
        <Select
          id="category"
          name="category"
          label="商品类别"
          fullWidth
          variant="standard"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
        <MenuItem value="书籍文具">书籍文具</MenuItem>
        <MenuItem value="服装配饰">服装配饰</MenuItem>
        <MenuItem value="电子设备">电子设备</MenuItem>
        <MenuItem value="家具装饰">家具装饰</MenuItem>
        <MenuItem value="生活用品">生活用品</MenuItem>
        <MenuItem value="活动票券">活动票券</MenuItem>
        <MenuItem value="交通工具">交通工具</MenuItem>
        <MenuItem value="其他">其他</MenuItem>
        </Select>
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            id="price"
            name="price"
            label="商品价格"
            fullWidth
            autoComplete="product price"
            variant="standard"
            onChange={(e) => {
              console.log(e.target.value);
              setPrice(e.target.value)
              }}
            onKeyDown={handleKeyDown}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            id="description"
            name="description"
            label="请描述一下商品吧"
            fullWidth
            multiline
            inputProps={{ style: { resize: "both" } }}
            autoComplete="product description"
            variant="standard"
            onChange={(e) => {
              console.log(e.target.value);
              setDescription(e.target.value)
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
            请上传商品图片（至少一张）
            </Button>
            {files.length > 0 && (
            <Grid item>
          {files.map((file, index) => (
            <span key={index}>{file.name}</span>
          ))}
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
        添加商品
        {/* {props.listing ? 'Update Listing' : 'Add Listing'} */}
        </Button>
      </DialogActions>
    </Dialog>
    );
    

}
export default NewProduct;