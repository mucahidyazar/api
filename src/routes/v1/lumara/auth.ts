import express from 'express';
import { ROUTES } from '../../../constants';
import { signIn, signUp, signOut, refreshToken } from '../../../controller/lumara/auth';
import { tryCatch } from '../../../utils';

const router = express.Router();

router.post(ROUTES.v1.lumara.auth.signIn, tryCatch(signIn));
router.post(ROUTES.v1.lumara.auth.signUp, tryCatch(signUp));
router.post(ROUTES.v1.lumara.auth.signOut, tryCatch(signOut));
router.post(ROUTES.v1.lumara.auth.refreshToken, tryCatch(refreshToken));

export { router as authRouter };
