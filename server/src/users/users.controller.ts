import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserResponseDto } from '../auth/dto/auth-response.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get user by ID',
    description: 'Retrieve user information by user ID'
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '1234567890abcdef'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User found successfully',
    type: UserResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found'
  })
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      return { message: 'User not found' };
    }
    return {
      id: user.id,
      email: user.email,
      username: user.username,
    };
  }
}
