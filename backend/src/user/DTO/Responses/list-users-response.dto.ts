import { UserResponsedto } from './user-response.dto';

export class ListUsersResponsedto {
  users: UserResponsedto[];
  total: number;
}
