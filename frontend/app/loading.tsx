import { Loader2 } from "lucide-react"


export default function loading() {
  return (
    <div className="i-fonts w-10/12 mx-auto mt-5 flex flex-col items-center justify-center h-[calc(100vh-60px)]">
        <Loader2 className="w-6 h-6 animate-spin mr-0"></Loader2>
    </div>
  )
}
