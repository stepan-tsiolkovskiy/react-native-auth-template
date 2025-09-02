import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { RefreshTokenDto } from './dto/refresh.dto';
import { AuthResponseDto, RefreshResponseDto } from './dto/auth-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Register a new user',
    description: 'Create a new user account with email, username and password'
  })
  @ApiBody({ type: SignUpDto })
  @ApiResponse({ 
    status: 201, 
    description: 'User successfully registered',
    type: AuthResponseDto
  })
  @ApiResponse({ 
    status: 409, 
    description: 'User with this email already exists'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data'
  })
  async signUp(@Body() signUpDto: SignUpDto) {
    console.log('📝 SignUp request:', signUpDto.email);
    const result = await this.authService.signUp(signUpDto);
    return result;
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'User login',
    description: 'Authenticate user with email and password'
  })
  @ApiBody({ type: SignInDto })
  @ApiResponse({ 
    status: 200, 
    description: 'User successfully authenticated',
    type: AuthResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid login credentials'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data'
  })
  async signIn(@Body() signInDto: SignInDto) {
    console.log('🔐 SignIn request:', signInDto.email);
    const result = await this.authService.signIn(signInDto);
    return result;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Refresh access token',
    description: 'Get new access and refresh tokens using a valid refresh token'
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Tokens successfully refreshed',
    type: RefreshResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid refresh token'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data'
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    console.log('🔄 Refresh token request');
    const result = await this.authService.refreshTokens(refreshTokenDto.refresh_token);
    return result;
  }
}
