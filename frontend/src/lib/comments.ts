const API_URL = import.meta.env.VITE_API_URL || '/api'

export interface Comment {
  id: number
  targetType: 'project' | 'module' | 'stage'
  targetId: number
  userId: number
  content: string
  createdAt: string
  updatedAt: string
}

export interface CreateCommentPayload {
  targetType: 'project' | 'module' | 'stage'
  targetId: number
  content: string
}

export interface UpdateCommentPayload {
  content: string
}

export class CommentsAPI {
  static async getComments(
    targetType: 'project' | 'module' | 'stage',
    targetId: number
  ): Promise<Comment[]> {
    const response = await fetch(
      `${API_URL}/comments?targetType=${targetType}&targetId=${targetId}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch comments')
    }

    return response.json()
  }

  static async createComment(
    payload: CreateCommentPayload,
    token: string
  ): Promise<Comment> {
    const response = await fetch(`${API_URL}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create comment')
    }

    return response.json()
  }

  static async updateComment(
    id: number,
    payload: UpdateCommentPayload,
    token: string
  ): Promise<Comment> {
    const response = await fetch(`${API_URL}/comments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error('Failed to update comment')
    }

    return response.json()
  }

  static async deleteComment(id: number, token: string): Promise<void> {
    const response = await fetch(`${API_URL}/comments/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to delete comment')
    }
  }
}
