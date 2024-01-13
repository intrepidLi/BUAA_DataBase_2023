import { Button } from "@mui/material";
import React from "react";

const UpdateButton = ({ commentText, editingComm, setEditingComm, updateComment, id, getAllComments }) => {
  return (
    <Button
      sx={{
        float: "right",
        bgcolor: "custom.moderateBlue",
        color: "neutral.white",
        "&:hover": {
          bgcolor: "custom.lightGrayishBlue",
        },
      }}
      onClick={() => {
        if(!commentText.trim()) {
          alert("如果你想要移除这条评论，请点击右上角的删除按钮。如果你想要编辑这条评论，请先输入内容。");
        } else {
          setEditingComm(!editingComm);
          updateComment(id, commentText.trim());
          getAllComments();
        }

      }}
    >
      更新
    </Button>
  );
};

export default UpdateButton;
