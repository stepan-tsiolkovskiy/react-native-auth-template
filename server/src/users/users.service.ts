import { Injectable } from '@nestjs/common';
import { User } from '../auth/interfaces/user.interface';
import * as bcrypt from 'bcryptjs';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class UsersService {
  constructor(private firebaseService: FirebaseService) {}
  private users: User[] = [];

  async findByEmail(email: string): Promise<User | undefined> {
    try {
      const user = await this.firebaseService.findDocumentByField('users', 'email', email);
      return user as User;
    } catch (error) {
      console.error('❌ Error finding user:', error);
      return undefined;
    }
  }

  async findById(id: string): Promise<User | undefined> {
    try {
      const user = await this.firebaseService.getDocument('users', id);
      return user as User;
    } catch (error) {
      console.error('❌ Error finding user by ID:', error);
      return undefined;
    }
  }

  async create(username: string, email: string, password: string): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Generate a unique ID
      const userId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
      const userData = {
        username,
        email,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to Firestore
      await this.firebaseService.createDocument('users', userId, userData);
      
      console.log('✅ New user created in Firebase:', { username, email });
      
      return {
        id: userId,
        username,
        email,
        password: hashedPassword,
      };
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw error;
    }
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.findByEmail(email);
      
      if (user && await bcrypt.compare(password, user.password)) {
        console.log('✅ User is valid:', user.email);
        return user;
      }
      
      console.log('❌ Invalid login credentials:', email);
      return null;
    } catch (error) {
      console.error('❌ Error validating user:', error);
      return null;
    }
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<boolean> {
    try {
      const dataWithTimestamp = {
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      
      await this.firebaseService.updateDocument('users', id, dataWithTimestamp);
      console.log('✅ User updated:', id);
      return true;
    } catch (error) {
      console.error('❌ Error updating user:', error);
      return false;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      await this.firebaseService.deleteDocument('users', id);
      console.log('✅ User deleted:', id);
      return true;
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      return false;
    }
  }
}