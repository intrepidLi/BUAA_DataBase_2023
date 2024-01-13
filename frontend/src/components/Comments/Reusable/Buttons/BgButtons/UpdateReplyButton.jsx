import { Button } from "@mui/material";
import React from "react";

const UpdateReplyButton = ({
  repText,
  setClicked,
  setEditingRep,
  editingRep,
  clicked,
  comId,
  updateReply,
  fetchSecondComments
}) => {
  return (
    <Button
      sx={{
        bgcolor: "custom.moderateBlue",
        color: "neutral.white",
        float: "right",
        "&:hover": {
          bgcolor: "custom.lightGrayishBlue",
        },
      }}
      onClick={() => {

        if (!repText.trim()) {
          alert("Read the placeholder.");
        } else {
          setEditingRep(!editingRep);
          updateReply(comId, repText.trim());
          fetchSecondComments();
        }
        setClicked(!clicked);
      }}
    >
      更新
    </Button>
  );
};

export default UpdateReplyButton;
