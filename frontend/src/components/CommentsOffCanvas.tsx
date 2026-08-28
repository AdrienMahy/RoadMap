import React, { useEffect, useState } from 'react'
import { X, Send, Trash2, Edit2, Check, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { CommentsAPI, Comment } from '@/lib/comments'
import { Button } from '@/components/Button'
import { Textarea } from '@/components/Textarea'
import { getAvatarColor, getInitials } from '@/lib/avatar'

interface CommentsOffCanvasProps {
  isOpen: boolean
  onClose: () => void
  targetType: 'project' | 'module' | 'stage'
  targetId: number
  projectId: number
  targetName?: string
}

export function CommentsOffCanvas({
  isOpen,
  onClose,
  targetType,
  targetId,
  projectId,
  targetName,
}: CommentsOffCanvasProps) {
  const { user, getToken, isAuthenticated } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Load comments when opened
  useEffect(() => {
    if (isOpen) {
      loadComments()
    }
  }, [isOpen, targetType, targetId])

  const loadComments = async () => {
    try {
      const data = await CommentsAPI.getComments(targetType, targetId)
      setComments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments')
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !isAuthenticated) return

    const token = getToken()
    if (!token) return

    setIsLoading(true)
    try {
      const comment = await CommentsAPI.createComment(
        {
          targetType,
          targetId,
          projectId,
          content: newComment,
        },
        token
      )
      setComments([...comments, comment])
      setNewComment('')
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateComment = async (id: number) => {
    if (!editContent.trim()) return

    const token = getToken()
    if (!token) return

    setIsLoading(true)
    try {
      const updated = await CommentsAPI.updateComment(
        id,
        { content: editContent },
        token
      )
      setComments(comments.map((c) => (c.id === id ? updated : c)))
      setEditingId(null)
      setEditContent('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update comment')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteComment = async (id: number) => {
    const token = getToken()
    if (!token) return

    try {
      await CommentsAPI.deleteComment(id, token)
      setComments(comments.filter((c) => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment')
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* OffCanvas Drawer */}
      <div className="fixed right-0 top-0 h-screen w-96 bg-dark-900 border-l border-red-900/30 z-50 flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-red-900/30 bg-gradient-to-r from-red-950/40 to-dark-900 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">Comments</h2>
            {targetName && (
              <p className="text-sm text-dark-400 mt-1">{targetName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-dark-200 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {comments.length === 0 ? (
            <div className="text-center text-dark-400 py-8">
              <p>No comments yet</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-dark-800 border border-red-900/20 rounded p-3 space-y-2"
              >
                <div className="flex justify-between items-start gap-3">
                  {/* Avatar */}
                  <div className={`flex-shrink-0 ${getAvatarColor(comment.firstName).bg} w-8 h-8 rounded-full flex items-center justify-center`}>
                    <User size={16} className={getAvatarColor(comment.firstName).text} />
                  </div>

                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-dark-100">
                      @{comment.firstName || comment.userName || `User${comment.userId}`}
                    </p>
                    <p className="text-xs text-dark-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Edit/Delete buttons */}
                  {user?.id === comment.userId && editingId !== comment.id && (
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => {
                          setEditingId(comment.id)
                          setEditContent(comment.content)
                        }}
                        className="text-dark-400 hover:text-red-400 transition"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-dark-400 hover:text-red-400 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Comment content or edit mode */}
                {editingId === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Edit comment..."
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateComment(comment.id)}
                        disabled={isLoading}
                      >
                        <Check size={14} /> Save
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-dark-200 text-sm">{comment.content}</p>
                )}
              </div>
            ))
          )}
        </div>

        {/* New comment form */}
        <div className="p-6 border-t border-red-900/30 space-y-3 bg-gradient-to-b from-transparent to-red-950/10">
          {error && <div className="text-red-500 text-sm">{error}</div>}

          {!isAuthenticated ? (
            <p className="text-center text-dark-400 text-sm">
              Sign in to add comments
            </p>
          ) : (
            <>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={2}
                disabled={isLoading}
              />
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || isLoading}
                className="w-full"
              >
                <Send size={14} /> Comment
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
