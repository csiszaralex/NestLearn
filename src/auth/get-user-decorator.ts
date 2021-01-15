import { createParamDecorator } from '@nestjs/common';
import { User } from './user.entity';

//? NEM JÓ!
export const GetUser = createParamDecorator(
  (data, req): User => {
    console.log();

    return req.user;
  },
);
