import express from 'express';
import { addressController } from '../controllers/addressController.js';
import { validateAddress } from '../middleware/addressValidation.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate); // 需要登入才能訪問

router.get('/', addressController.getAddresses);
router.post('/', validateAddress, addressController.addAddress);
router.put('/:id', validateAddress, addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);
router.post('/:id/default', addressController.setDefaultAddress);

export default router; 