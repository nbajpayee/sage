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

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={avatar} alt={name} />
      <AvatarFallback className="bg-gradient-to-br from-orange-400 to-yellow-500 text-white font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
