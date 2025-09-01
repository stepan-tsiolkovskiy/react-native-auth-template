import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { RefreshTokenDto } from './dto/refresh.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    console.log('📝 SignUp request:', signUpDto.email);
    const result = await this.authService.signUp(signUpDto);
    return result;
  }

  @Post('signin')
  async signIn(@Body() signInDto: SignInDto) {
    console.log('🔐 SignIn request:', signInDto.email);
    const result = await this.authService.signIn(signInDto);
    return result;
  }

  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    console.log('🔄 Refresh token request');
    const result = await this.authService.refreshTokens(refreshTokenDto.refresh_token);
    return result;
  }
}