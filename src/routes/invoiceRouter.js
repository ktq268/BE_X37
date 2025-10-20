import express from "express";
import * as invoiceCtrl from "../controllers/invoiceController.js";
import { staffAuth } from "../middlewares/staffAuthMiddleware.js";

const router = express.Router();

// create invoice from order (customer or staff)
router.post("/", invoiceCtrl.createInvoiceFromOrder);

// get invoice
router.get("/:id", invoiceCtrl.getInvoice);

// export invoice as HTML file
router.get("/:id/export", invoiceCtrl.exportInvoiceHtml);

// send e-bill by email
router.post("/:id/send", invoiceCtrl.sendEbill);

// staff listing
router.get("/", staffAuth, invoiceCtrl.staffListInvoices);

// export invoice as PDF file
router.get("/:id/export-pdf", invoiceCtrl.exportInvoicePdf);

export default router;
