import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedUser } from './types/authenticated-user.type';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Log in and receive a JWT access token' })
  @ApiOkResponse({
    description: 'Login successful.',
    schema: {
      example: {
        accessToken: 'jwt-token',
        user: {
          id: 'uuid',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'ADMIN',
          createdAt: '2026-07-07T12:00:00.000Z',
          updatedAt: '2026-07-07T12:00:00.000Z',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid email or password.',
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @ApiOkResponse({
    description: 'Current user returned.',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired token.',
  })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getMe(user.id);
  }

  @Get('admin-check')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify admin-only access' })
  @ApiOkResponse({
    description: 'Admin access confirmed.',
    schema: {
      example: {
        message: 'Admin access confirmed.',
        user: {
          id: 'uuid',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'ADMIN',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired token.',
  })
  @ApiForbiddenResponse({
    description: 'Authenticated user does not have the required role.',
  })
  adminCheck(@CurrentUser() user: AuthenticatedUser) {
    return {
      message: 'Admin access confirmed.',
      user,
    };
  }
}
