import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../zodPipe.pipe';
import { type signInDto, signInSchema } from './dto/login.dto';
import { OtpService } from './otp.service';

@Controller('auth')
@UsePipes(new ZodValidationPipe(signInSchema))
export class AuthController {
  constructor(
    private authService: AuthService,
    private otpService: OtpService,
  ) {}

  @Post('signin')
  async login(@Body() body: signInDto) {
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
}
