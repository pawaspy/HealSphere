import * "react"
import * "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef,
  React.ComponentPropsWithoutRef
>(({ className, ...props }, ref) => {
  return (
    
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef,
  React.ComponentPropsWithoutRef
>(({ className, ...props }, ref) => {
  return (
    
      
        
      
    
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
