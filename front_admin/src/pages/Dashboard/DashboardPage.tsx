import React, { useEffect, useState } from 'react';
import { User } from '../../Types/User';
import { useUserStore } from '../../store/useUserStore';

const DashboardPage: React.FC = () => {
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [users, setUsers] = useState<User[]>([]);
  const BACK_URL = import.meta.env.VITE_BACK_URL || process.env.REACT_APP_BACK_URL;

  const getToken = useUserStore((state) => state.getToken);

  const fetchTotalProducts = async () => {
    const token = getToken();
    try {
      const response = await fetch(`${BACK_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Réponse réseau pour les produits non OK');
      }
      const productsData = await response.json();
      // Assurez-vous que votre API renvoie le nombre total ou une liste dont vous pouvez compter les éléments
      setTotalProducts(productsData.length);
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
    }
  };

  const fetchTotalUsers = async () => {
    const token = getToken();
    try {
      const response = await fetch(`${BACK_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Réponse réseau pour les utilisateurs non OK');
      }
      const usersData = await response.json();
      // Ici aussi, assurez-vous que votre API renvoie un format compatible
      setTotalUsers(usersData.length);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
    }
  };

  const fetchUsers = async () => {
    const token = getToken();
    try {
      const response = await fetch(`${BACK_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Réponse réseau pour la liste des utilisateurs non OK');
      }
      const data = await response.json();
      
      // Vérifiez si la réponse contient une propriété 'users' qui est un tableau
      if (data && Array.isArray(data.users)) {
        setUsers(data.users);
        setTotalUsers(data.total); // Mettez également à jour le total des utilisateurs si nécessaire
      } else {
        console.error('La réponse n\'est pas structurée comme prévu:', data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
    }
  }

  useEffect(() => {
    fetchTotalProducts();
    fetchTotalUsers();
    fetchUsers();
  }, []);

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold underline">Bienvenue sur le tableau de bord</h1>
      <div>Nombre total de produits : {totalProducts}</div>
      <div>Nombre total d'utilisateurs : {totalUsers}</div>
      <h2 className="text-2xl font-semibold mt-4 mb-2">Liste des Utilisateurs</h2>
      <table className="table-auto w-full">
  <thead>
    <tr>
      <th className="px-4 py-2">Nom</th>
      <th className="px-4 py-2">Email</th>
      <th className="px-4 py-2">Statut</th>
      <th className="px-4 py-2">Bio</th>
      <th className="px-4 py-2">Date de Naissance</th>
      <th className="px-4 py-2">Téléphone</th>
      <th className="px-4 py-2">Ville</th>
      <th className="px-4 py-2">Pays</th>
      {/* Ajoutez d'autres en-têtes de colonnes ici si nécessaire */}
    </tr>
  </thead>
  <tbody>
    {users.map((user, index) => (
      <tr key={index} className="border">
        <td className="border px-4 py-2">{user.firstName} {user.lastName}</td>
        <td className="border px-4 py-2">{user.email}</td>
        <td className="border px-4 py-2">{user.status}</td>
        <td className="border px-4 py-2">{user.bio}</td>
        <td className="border px-4 py-2">{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString("fr-FR") : ''}</td>
        <td className="border px-4 py-2">{user.phoneNumber}</td>
        <td className="border px-4 py-2">{user.city}</td>
        <td className="border px-4 py-2">{user.country}</td>
        {/* Affichez les champs supplémentaires ici */}
      </tr>
    ))}
  </tbody>
</table>
    </div>
  );
};

export default DashboardPage;
