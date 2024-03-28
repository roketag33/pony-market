import React, { useEffect, useState } from 'react';
import { User } from '../../Types/Type';
import { ProductsResponseSchema } from '../../Types/schemas/Responses/product.response';
import { Product } from '../../Types/Type';
import fetchWithAuth   from '../../utils/api';
import { UsersResponseSchema } from '../../Types/schemas/Responses/UserResponseSchema';

const DashboardPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const BACK_URL = import.meta.env.VITE_BACK_URL || 'http://localhost:3000';

  const fetchProducts = async () => {
    try {
      const response = await fetchWithAuth(`${BACK_URL}/products`);
      if (!response.ok) throw new Error('Réponse réseau pour les produits non OK');
      const rawData = await response.json();
      const validatedData = ProductsResponseSchema.parse(rawData);
      setProducts(validatedData.map(product => ({
        ...product,
      })));
    } catch (error) {
      console.error('Erreur lors de la récupération ou de la validation des produits:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetchWithAuth(`${BACK_URL}/users`);
      if (!response.ok) throw new Error('Réponse réseau pour les utilisateurs non OK');
      const rawData = await response.json();
      const validatedData = UsersResponseSchema.parse(rawData);
      setUsers(validatedData.users.map(user => ({
        ...user,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt)
      })));
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchUsers();
  }, []);


  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold underline">Bienvenue sur le tableau de bord</h1>
      {/* <div>Nombre total de produits : {products}</div>
      <div>Nombre total d'utilisateurs : {totalUsers}</div> */}
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
      <th className="px-4 py-2">Créé le</th>
      <th className="px-4 py-2">Mis à jour le</th>
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
        <td className="border px-4 py-2">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "Non défini"}</td>
        <td className="border px-4 py-2">{user.updatedAt ? new Date(user.updatedAt).toLocaleDateString("fr-FR") : "Non défini"}</td>


      </tr>
    ))}
  </tbody>
</table>
<table className="table-auto w-full">
  <thead>
    <tr>
      <th className="px-4 py-2">Nom</th>
      <th className="px-4 py-2">Prix</th>
      <th className="px-4 py-2">Description</th>
      <th className="px-4 py-2">Créé le</th>
      <th className="px-4 py-2">Mis à jour le</th>
    </tr>
  </thead>
  <tbody>
    {products.map((product, index) => (
      <tr key={index}>
        <td className="border px-4 py-2">{product.name}</td>
        <td className="border px-4 py-2">{product.price}</td>
        <td className="border px-4 py-2">{product.description}</td>
        <td className="border px-4 py-2">{product.createdAt ? new Date(product.createdAt).toLocaleDateString("fr-FR") : "Non défini"}</td>
        <td className="border px-4 py-2">{product.updatedAt ? new Date(product.updatedAt).toLocaleDateString("fr-FR") : "Non défini"}</td>
      </tr>
    ))}
  </tbody>
</table>
    </div>
  );
};

export default DashboardPage;
