import { ApiPropertyOptional } from '@nestjs/swagger';
import { TicketPriority, TicketStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

const ticketSortFields = [
  'createdAt',
  'updatedAt',
  'priority',
  'status',
  'title',
] as const;
const sortOrders = ['asc', 'desc'] as const;

export type TicketSortField = (typeof ticketSortFields)[number];
export type SortOrder = (typeof sortOrders)[number];

export class GetTicketsQueryDto {
  @ApiPropertyOptional({
    example: 'login',
    description: 'Searches in title and description.',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: TicketStatus,
  })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @ApiPropertyOptional({
    enum: TicketPriority,
  })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiPropertyOptional({
    example: 'agent-user-uuid',
    description:
      'Use an agent user id, or "unassigned" for unassigned tickets.',
  })
  @IsOptional()
  @IsString()
  assigneeId?: string;

  @ApiPropertyOptional({
    example: true,
    description:
      'For AGENT users only. When false, only assigned tickets are returned.',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  includeUnassigned?: boolean;

  @ApiPropertyOptional({
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    default: 10,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiPropertyOptional({
    enum: ticketSortFields,
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(ticketSortFields)
  sortBy?: TicketSortField = 'createdAt';

  @ApiPropertyOptional({
    enum: sortOrders,
    default: 'desc',
  })
  @IsOptional()
  @IsIn(sortOrders)
  sortOrder?: SortOrder = 'desc';
}
