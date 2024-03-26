import { UserResponsedto } from './user-response.dto';

export class ListUsersResponsedto {
  users: UserResponsedto[];
  total: number; // Optionnel, si vous voulez inclure le nombre total d'utilisateurs pour la pagination
}
