import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { User } from './user.entity';
import { UserRepository } from './user.repository';

const mockUserRepository = () => ({
  findOne: jest.fn(),
});

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UserRepository,
          useFactory: mockUserRepository,
        },
      ],
    }).compile();

    jwtStrategy = await module.get<JwtStrategy>(JwtStrategy);
    userRepository = await module.get<UserRepository>(UserRepository);
  });

  describe('validate', () => {
    it('Successful validate', async () => {
      const user = new User();
      user.username = 'testUser';

      userRepository.findOne.mockResolvedValue(user);
      expect(userRepository.findOne).not.toBeCalled();
      const res = await jwtStrategy.validate({ username: 'testUser' });
      expect(userRepository.findOne).toBeCalledWith({ username: 'testUser' });
      expect(res).toEqual(user);
    });
    it('Throw unauthorized exception', () => {
      userRepository.findOne.mockResolvedValue(null);
      expect(jwtStrategy.validate({ username: 'testUser' })).rejects.toThrow(UnauthorizedException);
    });
  });
});
