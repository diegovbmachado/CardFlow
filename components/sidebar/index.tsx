import { Sheet, SheetTrigger, SheetContent} from "@/components/ui/sheet"
import { Button } from "../ui/button"
import Link from "next/link"
import { PanelBottom } from "lucide-react"
export function Sidebar() {
  return (
    <div className="flex w-full flex-col bg-muted/40">
    <div className="sm:hidden flex flex-col sm:gap-4 sm:pl-14">
<header className="sticky tiop-0 z-30 flex h-14 items-center px-4 border-b bg-background gap-4 sm:static sm:h-auto sm:border-b-0 sm:bg-transparent sm:px-6">
<Sheet>
    <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
            <PanelBottom className="h-5 w-5" />
<span className="sr-only">Abrir / fechar menu</span>
        </Button>
        </SheetTrigger>
        <SheetContent>
            <nav>
               <Link href="#">
               <span>Logo</span>
               </Link>
            </nav>
        </SheetContent>
</Sheet>
</header>
    </div>
    </div>
  )
}