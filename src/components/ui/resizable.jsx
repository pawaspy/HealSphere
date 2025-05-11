import { GripVertical } from "lucide-react"
import * "react-resizable-panels"

import { cn } from "@/lib/utils"

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps) => (
  
)

const ResizablePanel = ResizablePrimitive.Panel

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps & {
  withHandle?: boolean
}) => (
  div]:rotate-90",
      className
    )}
    {...props}
  >
    {withHandle && (
      
        
      
    )}
  
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
