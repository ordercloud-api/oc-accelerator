import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const useDirection = () => {
  const params = useParams<{ direction: string }>()
  const initialDirection = params.direction || 'Incoming'
  const [direction, setDirection] = useState(
    initialDirection.charAt(0).toUpperCase() + initialDirection.slice(1)
  )
  const navigate = useNavigate()

  const updateDirection = (newDirection: string) => {
    if (newDirection !== direction) {
      setDirection(newDirection)
      navigate(`/orders/${newDirection}`)
    }
  }

  return [direction, updateDirection] as const
}

export default useDirection
