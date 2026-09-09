import { animate, useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

type CounterProps = {
  to: number
  prefix?: string
}

export function Counter({ to, prefix = '' }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  const reduceMotion = useReducedMotion()
  const [value, setValue] = useState(reduceMotion ? to : 0)

  useEffect(() => {
    if (!isInView || reduceMotion) return
    const controls = animate(0, to, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setValue(Math.round(latest)),
    })
    return () => controls.stop()
  }, [isInView, reduceMotion, to])

  return (
    <span ref={ref}>
      {prefix}
      {value}
    </span>
  )
}
