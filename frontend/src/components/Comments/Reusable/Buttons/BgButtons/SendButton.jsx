import { Button } from "@mui/material";
import React, { useContext } from "react";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { wait } from "@testing-library/user-event/dist/utils";

const SendButton = ({ setCommentTxt, commentTxt, curUserId, targetUserId, token, getAllComments }) => {
  // const { addComment } = useContext(CommentContext);

  const formatTime = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const addComment = async () => {
    const now = new Date();
    const formattedTime = formatTime(now);
    await axios.post(`http://localhost:5000/comment/${targetUserId}`,
    {
      AuthorUserID: curUserId,
      TargetUserID: targetUserId,
      CommentText: commentTxt.trim(),
      CommentDate: formattedTime
    }, 
    {
     headers: {
       'Content-Type': 'multipart/form-data',
       Authorization: `Bearer ${token}`,
     },
   })
   .then((res) => {
      getAllComments();
     toast.success(`你已成功评论!`, {
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
  }

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
        !commentTxt.trim() ? e.preventDefault() : addComment(commentTxt.trim());
        setCommentTxt("");
      }}
    >
      发送
    </Button>
  );
};

export default SendButton;
