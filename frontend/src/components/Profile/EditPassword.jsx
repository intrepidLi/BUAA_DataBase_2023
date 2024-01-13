import { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Grid, Input, TextField, Select, MenuItem,
Dialog, DialogActions, DialogTitle, Button, DialogContent, Box } from '@mui/material';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { ToastContainer, toast } from 'react-toastify';
import { literal, object, string, TypeOf } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PasswordInput } from '../PasswordInput/PasswordInput';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';

const EditPassword = ({isOpen, onClose, onOpen, token, userId}) => {
    const [formData, setFormData] = useState({});
    const onSubmitHandler = async (values) => {
    
        console.log(values['password']);
    await axios.post(`http://localhost:5000/password/update/${userId}`,
         {
            password: values['password']
         }, 
         {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          toast.success(`成功修改密码!`, {
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
          // resetFormNew();
          onClose();
        })
        .catch((e) => {
          alert(e.response.data.message);
          console.log(e); 
          // resetFormOld();
          onClose();
        });
        // }
      };

    const editPasswordSchema = object({
        password: string()
          .nonempty('密码不能为空')
          .min(8, '密码至少8位')
          .max(32, '密码至多32位'),
        passwordConfirm: string().nonempty('请再次输入密码'),
      }).refine((data) => data.password === data.passwordConfirm, {
        path: ['passwordConfirm'],
        message: '密码不匹配',
      });
      
    const methods = useForm({
        resolver: zodResolver(editPasswordSchema),
      });

    const {
        reset,
        handleSubmit,
        register,
        formState: { isSubmitSuccessful, errors },
      } = methods;

    useEffect(() => {
        if (isSubmitSuccessful) {
          reset();
        }
      }, [isSubmitSuccessful]);

    const handleInputChange = (event) => {
        const { target } = event;
        const { name, value } = target;
    
        setFormData({
          ...formData, 
          [name]: value 
        });
      }

    return (
        <Dialog open={isOpen} onClose={onClose}>
         <DialogTitle>
          修改密码
          </DialogTitle>
          <FormProvider {...methods}>
         <DialogContent>
         
        <Box component="form" noValidate sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
          <PasswordInput label="新密码(8-32位)" name="password" handleInputChange={handleInputChange} id={"password1"}/>
          </Grid>
          <Grid item xs={12}>
          <PasswordInput label="请再次输入密码" name="passwordConfirm" handleInputChange={handleInputChange} id={"password2"}/>
          </Grid>
        </Grid>
        </Box>
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
            type='submit'
            onClick={handleSubmit(onSubmitHandler)}
          >
          保存修改
          {/* {props.listing ? 'Update Listing' : 'Add Listing'} */}
          </Button>
        </DialogActions>
        </FormProvider>
      </Dialog>
      );
}

export default EditPassword;