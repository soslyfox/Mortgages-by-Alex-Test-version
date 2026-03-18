import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputWithAddonProps extends React.InputHTMLAttributes<HTMLInputElement> {
  addonLeft?: React.ReactNode;
  addonRight?: React.ReactNode;
}

const InputWithAddon = React.forwardRef<HTMLInputElement, InputWithAddonProps>(
  ({ className, type, addonLeft, addonRight, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {addonLeft && (
          <div className="absolute left-3 flex items-center justify-center text-muted-foreground pointer-events-none">
            {addonLeft}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-base md:text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
            addonLeft && "pl-8",
            addonRight && "pr-8",
            className
          )}
          ref={ref}
          {...props}
        />
        {addonRight && (
          <div className="absolute right-3 flex items-center justify-center text-muted-foreground pointer-events-none">
            {addonRight}
          </div>
        )}
      </div>
    )
  }
)
InputWithAddon.displayName = "InputWithAddon"

export { InputWithAddon }
