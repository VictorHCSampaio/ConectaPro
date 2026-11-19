import { Star } from 'lucide-react'
import { useState } from 'react'

type StarRatingInputProps = {
  value: number
  onChange: (rating: number) => void
}

export function StarRatingInput({ value, onChange }: StarRatingInputProps) {
  const [hover, setHover] = useState(0)

  return (
    <div className="inline-flex gap-1">
      {Array.from({ length: 5 }, (_, index) => {
        const star = index + 1
        const filled = star <= (hover || value)

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocre-500"
            aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
          >
            <Star
              className={
                filled
                  ? 'size-6 fill-ocre-400 text-ocre-400 drop-shadow-[0_1px_0_rgba(138,110,35,0.5)]'
                  : 'size-6 fill-paper-200 text-paper-200 dark:fill-zinc-700 dark:text-zinc-700'
              }
            />
          </button>
        )
      })}
    </div>
  )
}
