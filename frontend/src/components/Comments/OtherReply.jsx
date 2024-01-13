import React, { useContext, useEffect, useState } from "react";
import { Box, Card, Stack, Avatar,Typography, Button } from "@mui/material";
import axios from "axios";
import replyArrow from "../../assets/comments_img/icon-reply.svg";
import { useNavigate } from "react-router-dom";

const OtherReply = ({ rep, authorUserId, tarUsername, token}) => {
    const comId = rep.ReplyID;
    const replyText = rep.ReplyText;
    const replyDate = rep.ReplyDate;
    // const onTar = onTar;
    // const onDel = deleteReply;
    const [authorUsername, setAuthorUsername] = useState('');

    const fetchCommentUserName = async () => {
        await axios
            .get(`http://localhost:5000/users/${authorUserId}`,{
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
              setAuthorUsername(res.data.UserName);
              console.log('Succeed fetching Author Username');
            })
            .catch((e) => {
                console.log('Error fetching Author Username');
            })
      }
    
      useEffect(
        () => {
          fetchCommentUserName();
        }, []
      )

    const navigate = useNavigate();
    return(<Card key={rep.id}>
        <Box sx={{ p: "15px" }}>
          <Stack spacing={2} direction="row">
            <Box sx={{ width: "100%" }}>
              <Stack
                spacing={2}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack spacing={2} direction="row" alignItems="center">
                  <Avatar src={`http://localhost:5000/images/users/${authorUserId}`} onClick={() => {navigate(`/users/${authorUserId}`)}} 
                  sx={{cursor: 'pointer'}}></Avatar>
                  <Typography
                    fontWeight="bold"
                    sx={{ color: "neutral.darkBlue" }}
                  >
                    {`${authorUsername}`}
                  </Typography>
                  <Typography sx={{ color: "neutral.grayishBlue" }}>
                    {replyDate}
                  </Typography>
                </Stack>
                <Button
                  variant="text"
                  sx={{
                    fontWeight: 500,
                    textTransform: "capitalize",
                    color: "custom.moderateBlue",
                  }}
                  startIcon={<img src={replyArrow} alt="reply sign" />}
                >
                  回复
                </Button>
              </Stack>
              <Typography
                component="div"
                sx={{ color: "neutral.grayishBlue", p: "20px 0" }}
              >
                <Typography
                  sx={{
                    color: "custom.moderateBlue",
                    width: "fit-content",
                    display: "inline-block",
                    fontWeight: 500,
                  }}
                >
                  {`@${tarUsername}`}
                </Typography>{" "}
                {replyText}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Card>);
}

export default OtherReply;