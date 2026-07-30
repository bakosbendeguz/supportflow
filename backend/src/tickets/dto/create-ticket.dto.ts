import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketPriority } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateTicketDto {
  @ApiProperty({
    example: 'Cannot access my account',
  })
  @IsString()
  @MinLength(3)
  title!: string;

  @ApiProperty({
    example: 'I tried to log in, but the application rejects my credentials.',
  })
  @IsString()
  @MinLength(10)
  description!: string;

  @ApiPropertyOptional({
    enum: TicketPriority,
    example: TicketPriority.MEDIUM,
    description:
      'Internal support priority. Customers cannot set this field directly.',
  })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiPropertyOptional({
    example: 'agent-user-uuid',
    description: 'Only ADMIN can assign a ticket during creation.',
  })
  @IsOptional()
  @IsUUID()
  assigneeId?: string;
}
