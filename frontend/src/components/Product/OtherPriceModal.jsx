import * as React from 'react';
import {Box, Modal, Button, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody} from '@mui/material';

const OtherPriceModal = ({open, onClose, otherPrices}) => {
    return (
    <Modal open={open} onClose={onClose}>
        <TableContainer component={Paper} sx={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', minWidth: 400}}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>商品名称</TableCell>
                <TableCell align="right">商品平台</TableCell>
                <TableCell align="right">价格&nbsp;(元)</TableCell>
                <TableCell align="right">时间</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {otherPrices.map((otherPrice) => {
                const ProductName = otherPrice.ProductName.length > 30
                ? otherPrice.ProductName.substring(0, 30) + '...'
                : otherPrice.ProductName;

                const PlatformName = otherPrice.PlatformName === "jd"
                ? "京东"
                : "淘宝";
                return (
                <TableRow
                    button="true"
                  key={otherPrice.PriceID}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
                  onClick={(e) => {
                    window.open(otherPrice.ProductLink);
                  }}
                >
                  <TableCell component="th" scope="row">
                    {ProductName}
                  </TableCell>
                  <TableCell align="right">{PlatformName}</TableCell>
                  <TableCell align="right">{otherPrice.Price}</TableCell>
                  <TableCell align="right">{otherPrice.PriceDate}</TableCell>
                </TableRow>
              );
              })}
            </TableBody>
          </Table>
        </TableContainer>
    </Modal>
      );
};
export default OtherPriceModal;