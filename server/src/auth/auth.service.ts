import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { AuthResult } from './interfaces/user.interface';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private firebaseService: FirebaseService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<AuthResult> {
    const { username, email, password } = signUpDto;
    
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    // Create a new user in Firebase
    const user = await this.usersService.create(username, email, password);
    
    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);
    
    // Store refresh token in Firebase
    await this.storeRefreshToken(user.id, tokens.refresh_token);
    
    console.log('🎉 SignUp successful for:', email);
    console.log('🔑 Generated tokens:', { access_token: '***', refresh_token: '***' });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  async signIn(signInDto: SignInDto): Promise<AuthResult> {
    const { email, password } = signInDto;
    
    // Validate user
    const user = await this.usersService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid login credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);
    
    // Store refresh token in Firebase
    await this.storeRefreshToken(user.id, tokens.refresh_token);
    
    console.log('🎉 SignIn successful for:', email);
    console.log('🔑 Generated tokens:', { access_token: '***', refresh_token: '***' });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    try {
      const tokenData = {
        refreshToken,
        createdAt: new Date().toISOString(),
        userId,
      };
      
      // Save in the refresh_tokens collection
      await this.firebaseService.createDocument('refresh_tokens', userId, tokenData);
      console.log('✅ Refresh token saved in Firebase');
    } catch (error) {
      console.error('❌ Error saving refresh token:', error);
    }
  }

  async refreshTokens(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    try {
      // Verify the refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken);
      
      // Check if the user still exists
      const user = await this.usersService.findByEmail(payload.email);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user.id, user.email);
      
      console.log('🔄 Tokens refreshed for:', payload.email);
      console.log('🔑 New tokens:', tokens);

      return tokens;
    } catch (error) {
      console.log('❌ Error refreshing token:', error.message);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m', // 15 minutes
    });
    
    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: '7d', // 7 days
    });

    return {
      access_token,
      refresh_token,
    };
  }
}