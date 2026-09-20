const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const {
  listCaregivers,
  addCaregiver,
  updateCaregiver,
  revokeCaregiver,
  deleteCaregiver,
} = require("../controllers/caregiverController");

router.use(requireAuth);

router.get("/", listCaregivers);
router.post("/", addCaregiver);
router.put("/:id", updateCaregiver);
router.post("/:id/revoke", revokeCaregiver);
router.delete("/:id", deleteCaregiver);

module.exports = router;
