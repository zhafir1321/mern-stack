"use client";

import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string | null;
  email: string;
  role: Role;
  roleId: number;
}

interface Role {
  id: number;
  name: string;
}

// In a real app, you would get the user's role from a session or token.
const MOCK_USER_ROLE = 'USER'; // Change to 'ADMIN' to test admin views

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState<number | ''>('');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data);
  };

  const fetchRoles = async () => {
    const res = await fetch('/api/roles');
    const data = await res.json();
    setRoles(data);
    if (data.length > 0) {
      setRoleId(data[0].id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !roleId) {
      alert('Email and role are required');
      return;
    }

    const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
    const method = editingUser ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, roleId }),
    });

    if (res.ok) {
      fetchUsers();
      resetForm();
    } else {
      const data = await res.json();
      alert(data.error || 'Something went wrong');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name || '');
    setEmail(user.email);
    setRoleId(user.roleId);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
      }
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setRoleId(roles.length > 0 ? roles[0].id : '');
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">Worker Management</h1>

      <div className="w-full max-w-4xl">
        {MOCK_USER_ROLE === 'ADMIN' && (
          <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg">
            <h2 className="text-2xl mb-4">{editingUser ? 'Edit Worker' : 'Add Worker'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-2 border rounded"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-2 border rounded"
                required
              />
              <select
                value={roleId}
                onChange={(e) => setRoleId(Number(e.target.value))}
                className="p-2 border rounded"
                required
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 flex justify-end gap-4">
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                {editingUser ? 'Update' : 'Create'}
              </button>
              {editingUser && (
                <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Role</th>
                {MOCK_USER_ROLE === 'ADMIN' && <th className="py-2 px-4 border-b">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="py-2 px-4 border-b">{user.name}</td>
                  <td className="py-2 px-4 border-b">{user.email}</td>
                  <td className="py-2 px-4 border-b">{user.role.name}</td>
                  {MOCK_USER_ROLE === 'ADMIN' && (
                    <td className="py-2 px-4 border-b">
                      <button onClick={() => handleEdit(user)} className="text-blue-500 hover:underline mr-4">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:underline">
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
