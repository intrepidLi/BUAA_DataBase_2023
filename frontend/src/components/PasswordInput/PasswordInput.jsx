import React from 'react';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { FormInput } from '../UseFormContext/UseFormContext';

export const PasswordInput = ({handleInputChange, name, label, id}) => {   
    const [showPassword0, setShowPassword0] = React.useState(false);

    const handleClickShowPassword0 = () => setShowPassword0((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
      };

      return(
        <FormInput
        required
        fullWidth
        name={name}
        label={label}
        type={showPassword0? 'text' : 'password'}
        id={id}
        autoComplete="password"
        onChange={handleInputChange}
        InputProps={{
  endAdornment: <InputAdornment position="end">
      <IconButton
        aria-label="toggle password visibility"
        onClick={handleClickShowPassword0}
        onMouseDown={handleMouseDownPassword}
        edge="end"
      >
        {showPassword0 ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>,
          }}
      />
      );
}
