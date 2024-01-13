import React, { useContext, useEffect, useState } from "react";
import { Box, Card, Stack, Avatar } from "@mui/material";
import ConfirmDelete from "./ConfirmDelete";
import Username from "./Reusable/Username";
import CreatedAt from "./Reusable/CreatedAt";
import DeleteButton from "./Reusable/Buttons/TextButtons/DeleteButton";
import EditButton from "./Reusable/Buttons/TextButtons/EditButton";
import ReplyText from "./Reusable/Reply/ReplyText";
import UpdateReplyButton from "./Reusable/Buttons/BgButtons/UpdateReplyButton";
import EditableReplyField from "./Reusable/Reply/EditableReplyField";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const OwnReply = ({ rep, onTar, onDel, curUserId, authorUserId, token, tarUsername, updateReply, fetchSecondComments }) => {
  const comId = rep.ReplyID;
  const onContent = rep.ReplyText;
  const onTime = rep.ReplyDate;
  // const onTar = onTar;
  // const onDel = deleteReply;
  // const curUserId = curUserId;
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
  // const { IMGOBJ } = useContext(CommentContext);
  const prsAva = `http://localhost:5000/images/users/${curUserId}`;

  const [clicked, setClicked] = useState(false);
  const [editingRep, setEditingRep] = useState(false);
  const [repText, setRepText] = useState(onContent);
  const [openModal, setOpenModal] = useState(false);

  const handleOpen = () => {
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  const handleEdit = () => {
    setClicked(!clicked);
    setEditingRep(!editingRep);
  };

  return (
    <>
      <ConfirmDelete
        onOpen={openModal}
        onClose={handleClose}
        comId={comId}
        onDel={onDel}
      />
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
                  <Avatar src={`${prsAva}?timestamp=${Date.now()}`} onClick={() => {navigate(`/users/${authorUserId}`)}} 
                  sx={{cursor: 'pointer'}}></Avatar>
                  <Username userName={authorUsername} />
                  <CreatedAt createdAt={onTime} />
                </Stack>
                <Stack direction="row" spacing={1}>
                  <DeleteButton functionality={() => handleOpen()} />
                  <EditButton
                    editingComm={clicked}
                    functionality={handleEdit}
                  />
                </Stack>
              </Stack>
              {editingRep ? (
                <>
                  <EditableReplyField
                    repText={repText}
                    setText={setRepText}
                    placeHolder={repText}
                  />
                  <UpdateReplyButton
                    clicked={clicked}
                    editingRep={editingRep}
                    repText={repText}
                    setClicked={setClicked}
                    setEditingRep={setEditingRep}
                    updateReply={updateReply}
                    fetchSecondComments={fetchSecondComments}
                    comId={comId}
                  />
                </>
              ) : (
                <ReplyText onTar={tarUsername} repText={repText} />
              )}
            </Box>
          </Stack>
        </Box>
      </Card>
    </>
  );
};

export default OwnReply;
