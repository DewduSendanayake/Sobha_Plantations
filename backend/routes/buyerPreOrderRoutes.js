const express = require("express");
const router = express.Router();
const {
  getAllBuyerPreOrderRecords,
  createBuyerPreOrderRecords,
  getBuyerPreOrderRecordsById,
  updateBuyerPreOrderRecords,
  deleteBuyerPreOrderRecords,
  getBuyerPreOrderCount,
} = require("../controllers/buyerPreOrderController"); 

// Routes for PreOrder Management
router.get("/", getAllBuyerPreOrderRecords);
router.post("/", createBuyerPreOrderRecords);
router.get("/:PreOrderId", getBuyerPreOrderRecordsById); 
router.get("/count/preOrders", getBuyerPreOrderCount);  // New route for pre-order count
router.put("/:PreOrderId", updateBuyerPreOrderRecords);
router.delete("/:PreOrderId", deleteBuyerPreOrderRecords);

module.exports = router;
