import express from 'express';
import { ROUTES } from '../../../constants';
import { signIn, signUp, signOut, refreshToken } from '../../../controller/home-hub/auth';
import { tryCatch } from '../../../utils';

const router = express.Router();

router.post(ROUTES.v1.homeHub.auth.signIn, tryCatch(signIn));
router.post(ROUTES.v1.homeHub.auth.signUp, tryCatch(signUp));
router.post(ROUTES.v1.homeHub.auth.signOut, tryCatch(signOut));
router.post(ROUTES.v1.homeHub.auth.refreshToken, tryCatch(refreshToken));

export { router as authRouter };
