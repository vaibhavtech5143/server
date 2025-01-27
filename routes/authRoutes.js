import express from 'express';
import { registerUser, loginUser } from '../controllers/userController.js';
import { registerSupervisor, loginSupervisor } from '../controllers/supervisorController.js';
import { registerVendor, loginVendor } from '../controllers/vendorController.js';

const router = express.Router();

router.post('/user/register', registerUser);
router.post('/user/login', loginUser);

router.post('/supervisor/register', registerSupervisor);
router.post('/supervisor/login', loginSupervisor);

router.post('/vendor/register', registerVendor);
router.post('/vendor/login', loginVendor);

export default router;
