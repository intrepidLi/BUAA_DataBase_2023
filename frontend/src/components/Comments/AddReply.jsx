import { Avatar, Card, Stack, ThemeProvider } from "@mui/material";
import { Box } from "@mui/system";
import React, { useContext, useState } from "react";
import theme from "../../styles";
import AddReplyButton from "./Reusable/Buttons/BgButtons/AddReplyButton";
import EditableReplyField from "./Reusable/Reply/EditableReplyField";

const AddReply = ({ onAdd, curUserId }) => {
  // const { IMGOBJ } = useContext(CommentContext);
  const [replyText, setReplyText] = useState("");
  return (
    <ThemeProvider theme={theme}>
      <Card>
        <Box sx={{ p: "15px" }}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Avatar
              src={`http://localhost:5000/images/users/${curUserId}`}
              variant="rounded"
              alt="user-avatar"
            />
            <EditableReplyField
              placeHolder="添加回复"
              setText={setReplyText}
              text={replyText}
            />
            <AddReplyButton
              onAdd={onAdd}
              replyText={replyText}
              setReplyText={setReplyText}
            />
          </Stack>
        </Box>
      </Card>
    </ThemeProvider>
  );
};

export default AddReply;
