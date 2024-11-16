import express from 'express';

import { ROUTES } from '@/constants';
import { signIn, signUp } from '@/controller/lumara/auth';
import { asyncHandler } from '@/middleware';

const router = express.Router();

router.post(ROUTES.v1.lumara.auth.signIn, asyncHandler(signIn));
router.post(ROUTES.v1.lumara.auth.signUp, asyncHandler(signUp));

export { router as authRouter };
