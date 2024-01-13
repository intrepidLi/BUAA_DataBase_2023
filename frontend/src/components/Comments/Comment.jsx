import React, { useEffect, useState } from "react";
import { Avatar, Card, Stack, ThemeProvider } from "@mui/material";
import { Box } from "@mui/system";
import theme from "../../styles";
import RepliesSection from "./RepliesSection";
import ConfirmDelete from "./ConfirmDelete";
import Username from "./Reusable/Username";
import CreatedAt from "./Reusable/CreatedAt";
import CommentText from "./Reusable/Comment/CommentText";
import EditableCommentField from "./Reusable/Comment/EditableCommentField";
import EditButton from "./Reusable/Buttons/TextButtons/EditButton";
import DeleteButton from "./Reusable/Buttons/TextButtons/DeleteButton";
import ReplyButton from "./Reusable/Buttons/TextButtons/ReplyButton";
import UpdateButton from "./Reusable/Buttons/BgButtons/UpdateButton";
import Cookies from 'universal-cookie';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const Comment = ({ comment, deleteComment, updateComment, getAllComments }) => {
    const cookies = new Cookies();
    const token = cookies.get('TOKEN');
    const [curUsername, setCurUsername] = useState('');
    const curUserId = cookies.get('USERID')

    const id = comment.CommentID;
    const content = comment.CommentText;
    const authorUserId = comment.AuthorUserID;
    const targetUserId = comment.TargetUserID;
    const commendDate = comment.CommentDate;

    const [authorUsername, setAuthorUsername] = useState({});

    const fetchCurUsername = async () => {
        axios
            .get(`http://localhost:5000/users/${curUserId}`,{
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setCurUsername(res.data.UserName);
            })
            .catch((e) => {
                console.log('Error fetching Author Username');
            })
    }
    
    const fetchCommentUserName = async () => {
        axios
            .get(`http://localhost:5000/users/${authorUserId}`,{
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setAuthorUsername(res.data.UserName);
            })
            .catch((e) => {
                console.log('Error fetching Author Username');
            })
    }

    useEffect(() => {
        fetchCommentUserName();
        fetchCurUsername();
    }, [id, authorUserId, token])

    const avatarUrl = `http://localhost:5000/images/users/${authorUserId}`

    const navigate = useNavigate();

    // const { id, content, createdAt, score, replies, user } = onPass;
    // const { IMGOBJ } = useContext(CommentContext);
    // const userName = user.username;
    // const ava = IMGOBJ[`${userName}`];
    const [clicked, setClicked] = useState(false);
    const [editingComm, setEditingComm] = useState(false);
    const [commentText, setCommentText] = useState(content);
    const [openModal, setOpenModal] = useState(false);

    const handleOpen = () => {
      setOpenModal(true);
    };
  
    const handleClose = () => {
      setOpenModal(false);
    };

  return (
    <ThemeProvider theme={theme}>
      <ConfirmDelete onOpen={openModal} onClose={handleClose} id={id} deleteComment={deleteComment} />
      <Card>
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
                  <Avatar src={`${avatarUrl}?timestamp=${Date.now()}`} 
                  onClick={() => {navigate(`/users/${authorUserId}`)}} 
                  sx={{cursor: 'pointer'}}>

                  </Avatar>
                  <Username userName={authorUsername} curUsername={curUsername} />
                  <CreatedAt createdAt={commendDate} />
                </Stack>
                {curUserId === authorUserId ? (
                  <Stack direction="row" spacing={1}>
                    <DeleteButton functionality={() => handleOpen()} />
                    <EditButton
                      functionality={() => setEditingComm(!editingComm)}
                      editingComm={editingComm}
                    />
                  </Stack>
                ) : (
                  <ReplyButton functionality={() => 
                 { 
                  console.log("clicked");
                  setClicked(!clicked)
                  }} />
                )}
              </Stack>
              {editingComm ? (
                <>
                  <EditableCommentField
                    commentText={commentText}
                    setCommentText={setCommentText}
                    placeHolder={commentText}
                  />
                  <UpdateButton
                    commentText={commentText}
                    editingComm={editingComm}
                    setEditingComm={setEditingComm}
                    updateComment={updateComment}
                    id={id}
                    getAllComments={getAllComments}
                  />
                </>
              ) : (
                <CommentText commentText={commentText} />
              )}
            </Box>
          </Stack>
        </Box>
      </Card>
      <RepliesSection
        // onReplies={secondComments}
        onClicked={clicked}
        onTar={id}
        tarUsername={authorUsername}
        // fetchSecondComments={fetchSecondComments}
        // authorUserId={authorUserId}
      />
      
    </ThemeProvider>
  );
};
export default Comment;
