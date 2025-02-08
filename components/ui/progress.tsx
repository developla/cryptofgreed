"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: number }
>(({ className, value = 0, ...props }, ref) => {
  const percentage = Math.max(0, Math.min(100, value));

  return (
    <div
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
        className
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-primary transition-all duration-200"
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  );
});

Progress.displayName = "Progress";

export { Progress };
