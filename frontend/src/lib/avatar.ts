// Generate avatar color based on name
export function getAvatarColor(name?: string): { bg: string; text: string } {
  const colors = [
    { bg: 'bg-red-500', text: 'text-white' },
    { bg: 'bg-orange-500', text: 'text-white' },
    { bg: 'bg-yellow-500', text: 'text-white' },
    { bg: 'bg-green-500', text: 'text-white' },
    { bg: 'bg-blue-500', text: 'text-white' },
    { bg: 'bg-indigo-500', text: 'text-white' },
    { bg: 'bg-purple-500', text: 'text-white' },
    { bg: 'bg-pink-500', text: 'text-white' },
  ]

  if (!name) return colors[0]

  // Generate consistent color based on name
  const hash = name.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0)
  }, 0)

  return colors[hash % colors.length]
}

// Get initials from first and last name
export function getInitials(firstName?: string, lastName?: string): string {
  let initials = ''
  if (firstName) initials += firstName[0]?.toUpperCase() || ''
  if (lastName) initials += lastName[0]?.toUpperCase() || ''
  return initials || '?'
}
