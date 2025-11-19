'use client'

import { useState } from 'react'

export default function TestComponent() {
  const [count, setCount] = useState(0)
  return <div>Count: {count}</div>
}