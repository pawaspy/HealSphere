import * "react"
import * "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef,
  React.ComponentPropsWithoutRef
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  
    
  
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }
