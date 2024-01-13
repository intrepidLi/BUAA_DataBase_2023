import React, { useContext } from "react";
import {
  Button,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

const ConfirmDelete = ({ onOpen, onClose, id, onDel, comId, deleteComment }) => {
  // const { deleteComment } = useContext(CommentContext);
  // onDel是删除二级评论的函数, comId是回复的Id
  const deleteComment1 = deleteComment;
  // console.log(comId)
  // console.log(onDel)
  return (
    <Dialog open={onOpen} onClose={onClose}>
      <DialogContent sx={{ maxWidth: "450px" }}>
        <DialogTitle>
          删除评论
        </DialogTitle>
        <DialogContent>
        <Typography>
          您确定要删除这条评论？该操作不可逆。
        </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
          color="primary"
          onClick={onClose}>
            取消
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              onDel ? onDel(comId) : (deleteComment1 && deleteComment1(id));
              onClose();
              }} // 注意不能直接设置成函数
          >
            确定
          </Button>
        </DialogActions>
        {/* <Stack direction="row" display="flex" justifyContent="space-between">
          <Button
            variant="contained"
            disableElevation
            sx={{
              bgcolor: "neutral.grayishBlue",
              "&:hover": { bgcolor: "neutral.grayishBlue" },
            }}
            onClick={onClose}
          >
            取消
          </Button>
          <Button
            variant="contained"
            disableElevation
            sx={{
              bgcolor: "custom.softRed",
              "&:hover": { bgcolor: "custom.softRed" },
            }}
            onClick={() => {
              deleteComment1(id);
              onClose();
              }} // 注意不能直接设置成函数
          >
            确定
          </Button>
        </Stack> */}
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDelete;
