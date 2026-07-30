import { ApiPropertyOptional } from '@nestjs/swagger';
import { TicketPriority } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateTicketDto {
  @ApiPropertyOptional({
    example: 'Updated ticket title',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @ApiPropertyOptional({
    example: 'Updated ticket description with more context.',
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @ApiPropertyOptional({
    enum: TicketPriority,
    example: TicketPriority.HIGH,
    description: 'Internal support priority. Customers cannot update this.',
  })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiPropertyOptional({
    example: 'agent-user-uuid',
    nullable: true,
    description:
      'ADMIN can assign/unassign. AGENT can only assign an unassigned ticket to themselves.',
  })
  @ValidateIf((_object, value) => value !== undefined && value !== null)
  @IsUUID()
  assigneeId?: string | null;
}
