import { Router } from 'express';
import { postContact } from '../controllers/contact.controller';

const router = Router();

router.post('/', postContact);

export default router;
