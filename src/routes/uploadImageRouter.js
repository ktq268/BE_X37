import express from "express";
import multer from "multer";
import cloudinary from "../../config/cloudinary.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// === UPLOAD ẢNH ===
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Dùng Promise để chờ upload_stream hoàn thành
    const uploadPromise = new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "menu" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer); // dùng .end thay vì .pipe
    });

    const result = await uploadPromise;
    res.json({ url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

// === XÓA ẢNH ===
router.delete("/:public_id", async (req, res) => {
  try {
    const { public_id } = req.params;

    if (!public_id) {
      return res.status(400).json({ message: "Missing public_id" });
    }

    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === "ok") {
      return res.json({ message: "Delete image successfully", result });
    } else {
      return res.status(400).json({ message: "Cannot delete image", result });
    }
  } catch (err) {
    res.status(500).json({ message: "Delete image failed", error: err.message });
  }
});

export default router;
