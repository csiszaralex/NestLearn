import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './user.entity';
import { UserRepository } from './user.repository';

const mockCredintials: AuthCredentialsDto = {
  username: 'TestUser',
  password: 'TestPassword1',
};

describe('UserRepository', () => {
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserRepository],
    }).compile();

    userRepository = await module.get<UserRepository>(UserRepository);
  });

  describe('signUp', () => {
    let save;

    beforeEach(() => {
      save = jest.fn();
      userRepository.create = jest.fn().mockReturnValue({ save });
    });

    it('SignUp succcessfull', () => {
      save.mockResolvedValue(undefined);
      expect(userRepository.signUp(mockCredintials)).resolves.not.toThrow();
    });
    it('Throw conflict error', () => {
      save.mockRejectedValue({ code: '23505' });
      expect(userRepository.signUp(mockCredintials)).rejects.toThrow(ConflictException);
    });
    it('Throw server error', () => {
      save.mockRejectedValue({ code: '123' });
      expect(userRepository.signUp(mockCredintials)).rejects.toThrow(InternalServerErrorException);
    });
  });
  describe('validateUserPassword', () => {
    let user;

    beforeEach(() => {
      userRepository.findOne = jest.fn();

      user = new User();
      user.username = 'TesztUser';
      user.validatePassword = jest.fn();
    });

    it('Validation successfull', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(true);

      const res = await userRepository.validateUserPassword(mockCredintials);
      expect(res).toEqual('TesztUser');
    });
    it('User cannot found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const res = await userRepository.validateUserPassword(mockCredintials);
      expect(user.validatePassword).not.toHaveBeenCalled();
      expect(res).toBeNull();
    });
    it('Password is incorrect', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(false);

      const res = await userRepository.validateUserPassword(mockCredintials);
      expect(user.validatePassword).toHaveBeenCalled();
      expect(res).toBeNull();
    });
  });
  describe('hashPassword', () => {
    it('Call bcrypt.hash and hash it', async () => {
      bcrypt.hash = jest.fn().mockResolvedValue('testHash');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const res = await userRepository.hashPassword('testPass', 'testSalt');
      expect(bcrypt.hash).toHaveBeenCalledWith('testPass', 'testSalt');
      expect(res).toEqual('testHash');
    });
  });
});
