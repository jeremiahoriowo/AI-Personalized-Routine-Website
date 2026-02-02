import React from 'react'

export default function Header({ title }: { title: string }){
  return (
    <div className="mb-4">
      <h2 className="text-lg font-medium">{title}</h2>
    </div>
  )
}
