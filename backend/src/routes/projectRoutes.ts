import { Router } from 'express';
import * as projectController from '../controllers/projectController';

const router = Router();

router.post('/', projectController.createProject);
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProject);

export default router;
