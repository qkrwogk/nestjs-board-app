import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<User> {
    const { username, password } = authCredentialsDto;
    const user = this.userRepository.create({ username, password });

    try {
      await this.userRepository.save(user);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        Logger.error(`[Auth] Username ${username} already exists`);
        throw new ConflictException(`Username ${username} already exists`);
      } else {
        Logger.error(
          `[Auth] Internal Server Error while saving user ${username}`,
        );
        throw new InternalServerErrorException();
      }
    }

    return user;
  }
}
