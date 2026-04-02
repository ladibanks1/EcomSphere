import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodPipe } from '../utils/zodPipe.pipe';
import { type signInDto, signInSchema } from './dto/signin.dto';
import { OtpService } from './otp.service';
import {
  sendOtpSchema,
  type sendOtpDto,
  verifyOtpSchema,
  type verifyOtpDto,
} from './dto/otp.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private otpService: OtpService,
  ) {}

  // User registration endpoint
  @Post('signin')
  async login(@Body(ZodPipe(signInSchema)) body: signInDto) {
    try {
      await this.authService.createUser(body);
      return {
        success: true,
        message: 'User created successfully;',
      };
    } catch (e: unknown) {
      const err = e as Error;
      throw new BadRequestException({
        success: false,
        message: err?.message || 'An error occurred while creating the user',
      });
    }
  }

  @Post('send-otp')
  async sendOtp(@Body(ZodPipe(sendOtpSchema)) body: sendOtpDto) {
    try {
      const res = await this.otpService.sendOtp(body.email);
      return {
        success: true,
        message: res.message,
      };
    } catch (e) {
      const err = e as Error;
      throw new BadRequestException({
        success: false,
        message: err?.message || 'An error occurred while sending otps',
      });
    }
  }

  @Post('verify-otp')
  async verifyOtp(@Body(ZodPipe(verifyOtpSchema)) body: verifyOtpDto) {
    try {
      const res = await this.otpService.verifyOtp(body);
      return {
        success: true,
        message: res.message,
      };
    } catch (e) {
      const err = e as Error;
      throw new BadRequestException({
        success: false,
        message: err?.message || 'An error occurred while verifying otp',
      });
    }
  }
}
