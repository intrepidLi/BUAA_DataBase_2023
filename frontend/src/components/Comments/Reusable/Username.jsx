import { Typography } from "@mui/material";
import React from "react";
import YouTag from "../YouTag";

const Username = ({ userName, curUsername }) => {
  return (
    <>
      <Typography fontWeight="bold" sx={{ color: "neutral.darkBlue" }}>
        {`${userName}`}
      </Typography>
      {userName === curUsername ? <YouTag /> : null}
    </>
  );
};

export default Username;
