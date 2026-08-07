import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tickets/:ticketId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiOperation({
    summary: 'List comments for an accessible ticket',
  })
  @ApiOkResponse({
    description: 'Comments created successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired token.',
  })
  @ApiNotFoundResponse({
    description: 'Ticket not found or not visible to current user.',
  })
  findAll(
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.commentsService.findAll(ticketId, user);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a comment on an accessible ticket',
  })
  @ApiOkResponse({
    description: 'Comments created successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired token.',
  })
  @ApiNotFoundResponse({
    description: 'Ticket not found or not visible to current user.',
  })
  create(
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.commentsService.create(ticketId, createCommentDto, user);
  }
}
