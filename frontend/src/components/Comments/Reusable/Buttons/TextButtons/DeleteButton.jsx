import { Delete } from "@mui/icons-material";
import { Button } from "@mui/material";

const DeleteButton = ({ functionality }) => {
  return (
    <Button
      startIcon={<Delete />}
      sx={{
        color: "custom.softRed",
        fontWeight: 500,
        textTransform: "capitalize",
      }}
      onClick={() => {
        functionality();
      }}
    >
      删除
    </Button>
  );
};

export default DeleteButton;
