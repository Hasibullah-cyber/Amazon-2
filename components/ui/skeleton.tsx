// components/ui/skeleton.tsx
import { forwardRef } from "react"
import { cn } from "@/lib/utils" // Assuming you have a cn utility for class merging

/**
 * Skeleton component props interface
 * 
 * @property {boolean} rounded - Makes the skeleton circular
 * @property {boolean} animate - Enables pulse animation (default: true)
 * @property {boolean} fit - Makes skeleton fit its content width
 * @property {number} lines - For multi-line text skeletons
 * @property {React.CSSProperties} style - Custom styles
 * @property {string} className - Additional classes
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: boolean
  animate?: boolean
  fit?: boolean
  lines?: number
}

/**
 * Skeleton component for loading states
 * 
 * Features:
 * - Pulse animation for loading indication
 * - Circular mode for avatar placeholders
 * - Multi-line text support
 * - Responsive sizing
 * - Customizable through props
 */
const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      rounded = false,
      animate = true,
      fit = false,
      lines = 1,
      style,
      ...props
    },
    ref
  ) => {
    // If multiple lines are requested, render multiple skeletons
    if (lines > 1) {
      return (
        <div className="space-y-2" {...props}>
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              ref={i === 0 ? ref : undefined}
              className={className}
              rounded={rounded}
              animate={animate}
              fit={fit}
              style={{
                ...style,
                // Make last line shorter if it's text
                width: i === lines - 1 ? "80%" : "100%",
                ...(i === 0 ? style : {}),
              }}
            />
          ))}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "bg-gray-200 dark:bg-gray-700",
          // Shape handling
          rounded ? "rounded-full" : "rounded-md",
          // Sizing
          fit ? "w-fit" : "w-full",
          // Animation
          animate && "animate-pulse",
          className
        )}
        style={{
          // Maintain aspect ratio for circular skeletons
          ...(rounded ? { aspectRatio: "1/1" } : { height: "1rem" }),
          ...style,
        }}
        {...props}
      />
    )
  }
)

Skeleton.displayName = "Skeleton"

export { Skeleton }
