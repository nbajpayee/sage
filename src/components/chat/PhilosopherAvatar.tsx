'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface PhilosopherAvatarProps {
  name: string
  avatar?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16'
}

export function PhilosopherAvatar({ 
  name, 
  avatar, 
  size = 'md', 
  className 
}: PhilosopherAvatarProps) {
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()

  // If we have an avatar URL, use a simple img tag instead of AvatarImage
  if (avatar) {
    return (
      <div className={cn("relative overflow-hidden rounded-full", sizeClasses[size], className)}>
        <img 
          src={avatar} 
          alt={name} 
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  // Fallback to Avatar component with initials
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarFallback className="bg-gradient-to-br from-sage-500 to-sage-600 text-white font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
