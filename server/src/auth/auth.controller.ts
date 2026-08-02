import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginDto, signInDto } from './dto/auth.dto';
import { OtpService } from './otp.service';
import { sendOtpDto, verifyOtpDto } from './dto/otp.dto';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import { SuccessResponseSchema } from '../response.type';
import { type Response, type Request } from 'express';
import { AuthGuard } from '../auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private otpService: OtpService,
  ) {}

  // User registration endpoint
  @Post('signin')
  @ApiOperation({
    summary: 'User sign registration',
  })
  @ApiCreatedResponse({
    description: 'User created successfully',
  })
  async createUser(@Body() body: signInDto) {
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

  @Post('login')
  async login(
    @Body() body: loginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const data = await this.authService.login(body);

      res.cookie('refreshToken', data.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7days
        signed: true,
      });
      return {
        success: true,
        message: 'User logged in successfully',
        data: {
          accessToken: data.accessToken,
        },
      };
    } catch (e) {
      const err = e as Error;
      throw new BadRequestException({
        success: false,
        message: err?.message || 'An error occurred while trying to login',
      });
    }
  }

  // OTP endpoints
  // Send OTP endpoint
  @HttpCode(HttpStatus.OK)
  @Post('send-otp')
  @ApiOperation({
    summary: 'Send OTP to user email',
  })
  @ZodResponse({
    status: HttpStatus.OK,
    type: SuccessResponseSchema,
  })
  async sendOtp(@Body() body: sendOtpDto) {
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

  // Verify OTP endpoint
  @HttpCode(HttpStatus.OK)
  @Post('verify-otp')
  @ApiOperation({
    summary: 'Verify sent OTP',
  })
  @ZodResponse({
    status: HttpStatus.OK,
    type: SuccessResponseSchema,
  })
  async verifyOtp(@Body() body: verifyOtpDto) {
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

  @Get('refresh')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const cookie = req.signedCookies;
      const refreshToken = cookie['refreshToken'] as string | undefined;

      if (!refreshToken) {
        throw new BadRequestException({
          success: false,
          message: 'Session Timeout',
        });
      }

      const token = await this.authService.refresh(refreshToken);

      res.cookie('refreshToken', token.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7days
        signed: true,
      });

      return {
        success: true,
        message: 'Successful',
        data: {
          accessToken: token.accessToken,
        },
      };
    } catch (e) {
      const err = e as Error;
      throw new BadRequestException({
        success: false,
        message: err?.message,
      });
    }
  }

  @UseGuards(AuthGuard)
  @Get()
  dashboard() {
    return 'dashboard';
  }
}
