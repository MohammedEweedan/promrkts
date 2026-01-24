import { Router } from 'express';
import { login, register, refreshToken, forgotPassword, resetPassword, revoke, sendOtp, verifyOtp, confirmAccount, resendConfirmation } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema, confirmAccountSchema, resendConfirmationSchema } from '../validations/auth.validation';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);
router.post('/refresh-token', refreshToken);
// Alias to support clients calling /auth/refresh
router.post('/refresh', refreshToken);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', validate(resetPasswordSchema), resetPassword);
router.post('/confirm', validate(confirmAccountSchema), confirmAccount);
router.post('/resend-confirmation', validate(resendConfirmationSchema), resendConfirmation);
router.post('/revoke', revoke);
// Phone OTP
router.post('/otp/send', sendOtp);
router.post('/otp/verify', verifyOtp);

export default router;
