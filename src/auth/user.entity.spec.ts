import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

describe('userEntity', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
    user.password = 'testPass';
    user.salt = 'testSalt';
    bcrypt.hash = jest.fn();
  });

  describe('validatePassword', () => {
    it('Password is valid', async () => {
      bcrypt.hash.mockReturnValue('testPass');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const res = await user.validatePassword('123');
      expect(bcrypt.hash).toHaveBeenCalledWith('123', 'testSalt');
      expect(res).toEqual(true);
    });
    it('Password is invalid', async () => {
      bcrypt.hash.mockReturnValue('wrongPass');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const res = await user.validatePassword('Wrong');
      expect(bcrypt.hash).toHaveBeenCalledWith('Wrong', 'testSalt');
      expect(res).toEqual(false);
    });
  });
});
