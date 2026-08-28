import { useState, useEffect } from 'react'
import { Trash2, Save, UserPlus, AlertCircle } from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'
import { Card } from './Card'
import { fetchAllUsers, updateUserRole, deleteUser } from '../lib/api'

interface User {
  id: number
  username: string
  email: string
  role: string
  createdAt: string
}

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingRole, setEditingRole] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState('Board')

  // Load all users
  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      setLoading(true)
      setError('')
      const data = await fetchAllUsers()
      setUsers(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load users'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRoleChange(userId: number, newRole: string) {
    try {
      setError('')
      await updateUserRole(userId, newRole)
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
      setEditingId(null)
      setSuccess('Role updated successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update role'
      setError(message)
    }
  }

  async function handleDeleteUser(userId: number, username: string) {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) return

    try {
      setError('')
      await deleteUser(userId)
      setUsers(users.filter(u => u.id !== userId))
      setSuccess(`User "${username}" deleted successfully`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete user'
      setError(message)
    }
  }

  async function handleAddUser() {
    if (!newUsername || !newPassword) {
      setError('Username and password are required')
      return
    }

    try {
      setError('')
      const response = await fetch('http://localhost:3101/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          email: newRole,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create user')
      }

      setNewUsername('')
      setNewPassword('')
      setNewRole('Board')
      setSuccess('User created successfully')
      await loadUsers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create user'
      setError(message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <UserPlus size={24} className="text-red-400" />
        <h2 className="text-2xl font-bold">User Management</h2>
      </div>

      {/* Alerts */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/30 p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-300">{error}</p>
        </Card>
      )}

      {success && (
        <Card className="bg-green-500/10 border-green-500/30 p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-green-300">{success}</p>
        </Card>
      )}

      {/* Add New User Form */}
      <Card className="p-6 bg-dark-900 border-dark-700">
        <h3 className="text-lg font-semibold mb-4 text-dark-50">Create New User</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <Input
            label="Username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Enter username"
          />
          <Input
            label="Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter password"
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-dark-300">Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 hover:border-dark-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            >
              <option value="Board">Board</option>
              <option value="Administrateur">Administrateur</option>
            </select>
          </div>
          <Button
            onClick={handleAddUser}
            variant="primary"
            className="w-full"
          >
            Add User
          </Button>
        </div>
      </Card>

      {/* Users List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-dark-50">Users ({users.length})</h3>

        {loading ? (
          <Card className="p-6 text-center text-dark-400">
            Loading users...
          </Card>
        ) : users.length === 0 ? (
          <Card className="p-6 text-center text-dark-400">
            No users found
          </Card>
        ) : (
          <div className="grid gap-3">
            {users.map((user) => (
              <Card key={user.id} className="p-4 bg-dark-900 border-dark-700">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-semibold text-dark-50">{user.username}</p>
                        <p className="text-sm text-dark-400">
                          {user.email} • ID: {user.id}
                        </p>
                        <p className="text-xs text-dark-500">
                          Created: {new Date(user.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Role Selector */}
                  <div className="flex items-center gap-2">
                    {editingId === user.id ? (
                      <>
                        <select
                          value={editingRole}
                          onChange={(e) => setEditingRole(e.target.value)}
                          className="px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 hover:border-dark-500 focus:outline-none focus:border-red-500"
                        >
                          <option value="Board">Board</option>
                          <option value="Administrateur">Administrateur</option>
                        </select>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleRoleChange(user.id, editingRole)}
                          className="flex items-center gap-2"
                        >
                          <Save size={16} />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <span
                          className={`px-3 py-2 rounded-lg text-sm font-medium cursor-pointer hover:opacity-80 ${
                            user.role === 'Administrateur'
                              ? 'bg-red-600/40 text-red-200 border border-red-500/50'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}
                          onClick={() => {
                            setEditingId(user.id)
                            setEditingRole(user.role)
                          }}
                        >
                          {user.role}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Delete Button */}
                  {user.username !== 'admin' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 size={18} />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
