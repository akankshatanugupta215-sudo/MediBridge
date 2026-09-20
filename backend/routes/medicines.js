const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const {
  listMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} = require("../controllers/medicineController");

router.use(requireAuth);

router.get("/", listMedicines);
router.post("/", createMedicine);
router.put("/:id", updateMedicine);
router.delete("/:id", deleteMedicine);

module.exports = router;
