import { UserResponsedto } from './user-response.dto';

export class UserDetailsResponsedto extends UserResponsedto {
  bio?: string;
  dateOfBirth?: Date;
  phoneNumber?: string;
  // Ajoutez d'autres champs détaillés spécifiques à l'utilisateur ici
}
