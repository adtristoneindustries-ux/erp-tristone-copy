const express = require('express');
const { createMaterial, getMaterials, deleteMaterial, markMaterialAsViewed, getNewMaterialsCount } = require('../controllers/materialController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getMaterials)
  .post(authorize('admin', 'staff'), upload.single('file'), createMaterial);

router.route('/mark-viewed')
  .post(markMaterialAsViewed);

router.route('/new-count')
  .get(getNewMaterialsCount);

router.route('/:id')
  .delete(authorize('admin', 'staff'), deleteMaterial);

module.exports = router;
