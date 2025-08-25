import React, { createContext, useContext, useState, useEffect } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const queryClient = useQueryClient()

  // Get user data
  const { data: userData, isLoading } = useQuery(
    'user',
    () => api.get('/auth/me').then(res => res.data.data),
    {
      enabled: !!token,
      onSuccess: (data) => {
        setUser(data)
      },
      onError: () => {
        logout()
      }
    }
  )

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials)
      const { token: newToken, user: userData } = response.data
      
      setToken(newToken)
      setUser(userData)
      localStorage.setItem('token', newToken)
      
      // Set default authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      
      return response.data
    } catch (error) {
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      const { token: newToken, user: newUser } = response.data
      
      setToken(newToken)
      setUser(newUser)
      localStorage.setItem('token', newToken)
      
      // Set default authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      
      return response.data
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    queryClient.clear()
  }

  // Set authorization header on mount if token exists
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }, [token])

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}