import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: 'I checked the logs and found the issue.',
  })
  @IsString()
  @MinLength(3)
  message!: string;
}
