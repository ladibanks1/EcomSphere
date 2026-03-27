import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../utils/zodPipe.pipe';
import { type signInDto, signInSchema } from './dto/login.dto';
import { OtpService } from '../mail/otp.service';

@Controller('auth')
@UsePipes(new ZodValidationPipe(signInSchema))
export class AuthController {
  constructor(
    private authService: AuthService,
    private otpService: OtpService,
  ) {}

  @Get()
  test() {
    this.otpService.sendOtp('ladibanks09@gmail.com');
    return 'hello';
  }

  @Post('signin')
  async login(@Body() body: signInDto) {
    try {
      await this.authService.createUser(body);
      return {
        success: true,
        message: 'User created successfully',
      };
    } catch (e: unknown) {
      const err = e as Error;
      throw new BadRequestException({
        success: false,
        message: err?.message || 'An error occurred while creating the user',
      });
    }
  }
}
