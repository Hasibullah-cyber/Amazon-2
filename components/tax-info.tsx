import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function TaxInfo() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center text-xs text-gray-500 cursor-help">
            <Info className="h-3 w-3 mr-1" />
            Tax Info
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>All prices include 10% VAT as per Bangladesh government regulations.</p>
          <p className="mt-1">For business purchases, a tax invoice can be provided upon request.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
