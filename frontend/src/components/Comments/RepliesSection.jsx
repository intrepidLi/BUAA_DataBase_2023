import {Stack} from "@mui/material";
import React, { useEffect, useState } from "react";
import AddReply from "./AddReply";
import OwnReply from "./OwnReply";
import axios from "axios";
import Cookies from 'universal-cookie';
import OtherReply from "./OtherReply";

const RepliesSection = ({onClicked, onTar, tarUsername}) => {

  const cookies = new Cookies();
  const token = cookies.get('TOKEN');
  const curUserId = cookies.get('USERID');
  const [replies, setReplies] = useState([]);

  const fetchSecondComments = async () => {
    axios
      .get(`http://localhost:5000/reply/${onTar}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setReplies(res.data.reply_items);
        // getSchoolsList();
        console.log('Succeed fetching SecondComments');
      })
      .catch((e) => {
        console.log('Error fetching SecondComments');
      });
}

  useEffect (() => {
    fetchSecondComments();
  }, [])

  console.log("curUserID")
  console.log(curUserId);
  // const { IMGOBJ } = useContext(CommentContext);
  // const [repliess, setReplies] = useState(onReplies);
  console.log(replies)

  const formatTime = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const addReply = async (data) => {
    const now = new Date();
    const formattedTime = formatTime(now);
    const formData = new FormData();
    formData.append("CommentID", onTar);
    formData.append("AuthorUserID", curUserId);
    formData.append("ReplyText", data);
    formData.append("ReplyDate", formattedTime);

    await axios.post(
        `http://localhost:5000/reply/${curUserId}`,
        formData, {
        headers: { Authorization: `Bearer ${token}` },
        }
    ).then((response) => {
      fetchSecondComments();
      // setReplies(onReplies);
      console.log('SecondCommit Upload Success:', response.data.message);
      // 处理成功的情况，例如更新界面等
    })
    .catch((error) => {
      console.error('Error:', error);
      // 处理错误的情况
    });
  };

  const deleteReply = async (id) => {
    try {
      await axios
        .delete(`http://localhost:5000/reply/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          console.log("deleteReply success");
          setReplies((prevReplies) =>
            {
                return prevReplies.filter((reply) => reply.ReplyID !== id);
            }
          );
        })
        .catch((e) => {
          console.log(e);
          console.log("deleteReply failed");
        });

    } catch(e) {
      console.log(e);
    }
    
  };

  const updateReply = async (id, updatedData) => {
    try {
      await axios
        .patch(`http://localhost:5000/reply/${id}`, 
        {ReplyText: updatedData},
        { 
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          console.log("updateReply success");
        })
        .catch((e) => {
          console.log(e);
          console.log("updateReply failed");
        });

    } catch(e) {
      console.log(e);
    }
    
  };

  return (
    <Stack spacing={2} width="800px" alignSelf="flex-end">
      {replies.length>0 &&
       replies.map((rep) => {
        const replyId = rep.ReplyID;
        
        const authorUserId = rep.AuthorUserID;
        console.log({authorUserId});
        console.log({curUserId});
        const replyText = rep.ReplyText;
        const replyDate = rep.ReplyDate;
      
        return (curUserId === authorUserId) ? (
          <OwnReply
            key={replyId}
            rep={rep}
            // onCount={score}
            onTar={onTar}
            onDel={deleteReply}
            curUserId={curUserId}
            authorUserId={authorUserId}
            token={token}
            tarUsername={tarUsername}
            updateReply={updateReply}
            fetchSecondComments={fetchSecondComments}
          />
        ) : (
          <OtherReply 
            key={replyId}
            rep={rep}
            authorUserId={authorUserId}
            tarUsername={tarUsername}
            // deleteReply={deleteReply}
            token={token}
          />
        );
      })}
      {onClicked ? <AddReply onAdd={addReply} curUserId={curUserId} /> : null}
    </Stack>
  );
};

export default RepliesSection;
