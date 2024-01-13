import { Avatar, Card, Stack, ThemeProvider } from "@mui/material";
import { Box } from "@mui/system";
import React, { useContext, useState } from "react";
import theme from "../../styles";
import EditableCommentField from "./Reusable/Comment/EditableCommentField";
import SendButton from "./Reusable/Buttons/BgButtons/SendButton";
import Cookies from 'universal-cookie';

const AddComment = ({targetUserId, getAllComments}) => {
  const cookies = new Cookies();
  const token = cookies.get('TOKEN');
  const curUserId = cookies.get('USERID');

  // const { IMGOBJ } = useContext(CommentContext);
  const [commentTxt, setCommentTxt] = useState("");

  return (
    <ThemeProvider theme={theme}>
      <Card>
        <Box sx={{ p: "15px" }}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Avatar
              src={`http://localhost:5000/images/users/${curUserId}?timestamp=${Date.now().toString()}`}
              variant="rounded"
              alt="user-avatar"
            />
            <EditableCommentField
              commentText={commentTxt}
              setCommentText={setCommentTxt}
              placeHolder="添加你的评论"
            />
            <SendButton commentTxt={commentTxt} setCommentTxt={setCommentTxt} curUserId={curUserId} targetUserId={targetUserId} token={token} getAllComments={getAllComments}/>
          </Stack>
        </Box>
      </Card>
    </ThemeProvider>
  );
};

export default AddComment;
