import { Star } from 'lucide-react'

type StarRatingProps = {
  rating: number
}

export function StarRating({ rating }: StarRatingProps) {
  const fillPercent = (Math.max(0, Math.min(5, rating)) / 5) * 100

  return (
    <div className="relative inline-flex">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, index) => (
          <Star key={index} className="size-3.5 shrink-0 fill-slate-200 text-slate-200" />
        ))}
      </div>
      <div
        className="absolute inset-0 flex gap-0.5 overflow-hidden"
        style={{ width: `${fillPercent}%` }}
      >
        {Array.from({ length: 5 }, (_, index) => (
          <Star key={index} className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
        ))}
      </div>
    </div>
  )
}
