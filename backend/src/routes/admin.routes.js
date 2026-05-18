import { Router } from 'express';
import { getActivity, getAnalytics, globalSearch } from '../controllers/admin.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect, authorize('admin'));
router.get('/analytics', getAnalytics);
router.get('/activity', getActivity);
router.get('/search', globalSearch);

export default router;

