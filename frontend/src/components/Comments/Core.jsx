import React, { useEffect, useState } from "react";
import { Container, Stack } from "@mui/material";
import Comment from "./Comment";
import AddComment from "./AddComment";
import axios from 'axios';
import Cookies from 'universal-cookie';

const Core = ({userId}) => {
  console.log("userId");
  console.log(userId);
  const cookies = new Cookies();
  const token = cookies.get('TOKEN');
  const [comments, setComments] = useState([]);

  useEffect (() => {
    getAllComments();
  }, [userId, token]);

  
  const getAllComments = async () => {
    await axios
      .get(`http://localhost:5000/comments/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setComments(res.data.comment_items);
        console.log("getComments success");
      })
      .catch((e) => {
        console.log(e);
        console.log("getComments failed");
      });
  };

  const deleteComment = async (commentId) => {
    console.log("start deleteComment");

    try {
      await axios
        .delete(`http://localhost:5000/comment/${commentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          console.log("deleteComment success");
          setComments((prevComments) => {
            return prevComments.filter((comment) => comment.CommentID !== commentId);
          }
          );
        })
        .catch((e) => {
          console.log(e);
          console.log("deleteComment failed");
        });

    } catch(e) {
      console.log(e);
    }
  };

  const updateComment = async (id, updatedData) => {
    try {
      await axios
        .patch(`http://localhost:5000/comment/${id}`, 
        {CommentText: updatedData},
        { 
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          console.log("updateComment success");
          console.log(res.data.message);
        })
        .catch((e) => {
          console.log(e);
          console.log("updateComment failed");
        });

    } catch(e) {
      console.log(e);
    }
    
  };


  // const { commentSection } = useContext(CommentContext);
  return (
    <Container maxWidth="md">
      <Stack spacing={3}>
        {comments.length > 0 &&
         comments.map((comment) => {
          return (<Comment key={comment.CommentID} comment={comment} deleteComment={deleteComment} updateComment={updateComment} getAllComments={getAllComments}/>);
        })}
        <AddComment targetUserId={userId} getAllComments={getAllComments}/>
      </Stack>
    </Container>
  );
};

export default Core;
