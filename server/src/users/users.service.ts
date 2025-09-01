import { Injectable } from '@nestjs/common';
import { User } from '../auth/interfaces/user.interface';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  private users: User[] = [];

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }

  async create(username: string, email: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user: User = {
      id: Date.now().toString(), // Простий ID для тестування
      username,
      email,
      password: hashedPassword,
    };
    
    this.users.push(user);
    console.log('✅ Новий користувач створений:', { username, email });
    console.log('👥 Всі користувачі:', this.users.map(u => ({ id: u.id, username: u.username, email: u.email })));
    
    return user;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      console.log('✅ Користувач валідний:', user.email);
      return user;
    }
    console.log('❌ Невірні дані для входу:', email);
    return null;
  }
}