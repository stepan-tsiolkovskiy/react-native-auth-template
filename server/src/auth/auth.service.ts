import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { AuthResult } from './interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<AuthResult> {
    const { username, email, password } = signUpDto;
    
    // Перевіряємо чи існує користувач
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Користувач з таким email вже існує');
    }

    // Створюємо нового користувача
    const user = await this.usersService.create(username, email, password);
    
    // Генеруємо токени
    const tokens = await this.generateTokens(user.id, user.email);
    
    console.log('🎉 SignUp успішний для:', email);
    console.log('🔑 Згенеровані токени:', tokens);

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
    
    // Валідуємо користувача
    const user = await this.usersService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Невірні дані для входу');
    }

    // Генеруємо токени
    const tokens = await this.generateTokens(user.id, user.email);
    
    console.log('🎉 SignIn успішний для:', email);
    console.log('🔑 Згенеровані токени:', tokens);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  async refreshTokens(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    try {
      // Верифікуємо refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken);
      
      // Перевіряємо чи користувач ще існує
      const user = await this.usersService.findByEmail(payload.email);
      if (!user) {
        throw new UnauthorizedException('Користувач не знайдений');
      }

      // Генеруємо нові токени
      const tokens = await this.generateTokens(user.id, user.email);
      
      console.log('🔄 Токени оновлені для:', payload.email);
      console.log('🔑 Нові токени:', tokens);

      return tokens;
    } catch (error) {
      console.log('❌ Помилка refresh токена:', error.message);
      throw new UnauthorizedException('Невалідний refresh token');
    }
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m', // 15 хвилин
    });
    
    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: '7d', // 7 днів
    });

    return {
      access_token,
      refresh_token,
    };
  }
}