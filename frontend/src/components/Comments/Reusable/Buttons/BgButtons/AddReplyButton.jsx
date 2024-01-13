import { Button } from "@mui/material";
import React from "react";

const AddReplyButton = ({ setReplyText, onAdd, replyText }) => {
  return (
    <Button
      size="large"
      sx={{
        bgcolor: "custom.moderateBlue",
        color: "neutral.white",
        "&:hover": {
          bgcolor: "custom.lightGrayishBlue",
        },
      }}
      onClick={(e) => {
        console.log(replyText);
        !replyText.trim() ? e.preventDefault() : onAdd(` ${replyText}`);
        setReplyText("");
      }}
    >
      回复
    </Button>
  );
};

export default AddReplyButton;
