import Image from "next/image"
import {Link} from '@/src/i18n/routing'
import { MapPin, Wifi, Zap, Clock, ShieldCheck, Monitor, Coffee } from "lucide-react"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IHub } from "@/data/hubs"

interface IHubCardProps {
  hub: IHub & { slug?: string }
}

const serviceIcons: Record<string, React.ReactNode> = {
  Internet: <Wifi className="h-4 w-4" />,
  Electricity: <Zap className="h-4 w-4" />,
  Workspace: <Monitor className="h-4 w-4" />,
  "Coffee/Tea": <Coffee className="h-4 w-4" />,
}

function getServiceIcon(name: string): React.ReactNode {
  const n = name.toLowerCase();
  if (n.includes("internet") || n.includes("wifi") || n.includes("web")) return <Wifi className="h-4 w-4" />;
  if (n.includes("electric") || n.includes("power") || n.includes("solar")) return <Zap className="h-4 w-4" />;
  if (n.includes("workspace") || n.includes("desk") || n.includes("monitor")) return <Monitor className="h-4 w-4" />;
  if (n.includes("coffee") || n.includes("tea")) return <Coffee className="h-4 w-4" />;
  return serviceIcons[name] || null;
}

/** Resolve image src — handles both Next.js static imports and URL strings */
function resolveImageSrc(imageUrl: any): string | undefined {
  if (!imageUrl) return undefined;
  if (typeof imageUrl === "string") return imageUrl;
  // Static import object has a `src` string property
  if (typeof imageUrl === "object" && imageUrl.src) return imageUrl.src;
  return undefined;
}

export function HubCard({ hub }: IHubCardProps) {
  const imageSrc = resolveImageSrc(hub.imageUrl);
  // Use slug if available (API hubs), otherwise fall back to id
  const detailHref = `/hubs/${(hub as any).slug || hub.id}`;

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-md group">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={hub.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={imageSrc.startsWith("http")}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
            No image
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent pointer-events-none" />
        {hub.verificationStatus === "Verified" && (
          <div className="absolute top-3 right-3 z-10">
            <Badge className="bg-emerald-500/90 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1 backdrop-blur-sm">
              <ShieldCheck className="h-3 w-3" />
              Verified
            </Badge>
          </div>
        )}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 z-10">
          {(hub.services || []).slice(0, 3).map((service: string, index: number) => (
            <Badge key={`${service}-${index}`} variant="secondary" className="bg-background/90 backdrop-blur-sm hover:bg-background shadow-[0_2px_10px_rgba(0,0,0,0.1)] flex items-center gap-1.5 py-1">
              {getServiceIcon(service)}
              {service}
            </Badge>
          ))}
          {(hub.services || []).length > 3 && (
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm hover:bg-background shadow-sm">
              +{hub.services.length - 3}
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-4">
          <div className="w-full">
            <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {hub.name}
            </h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1.5 line-clamp-1">
              <MapPin className="h-3.5 w-3.5 mr-1 shrink-0" />
              {hub.governorate}{hub.location ? ` • ${hub.location}` : ""}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 grow">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {hub.description}
        </p>
        
        <div className="flex flex-col gap-2 text-sm">
          {hub.pricing && (
            <div className="flex items-center text-foreground font-medium">
              <span className="text-primary font-bold mr-1">{hub.pricing.split('/')[0]}</span>
              {hub.pricing.includes('/') && (
                <span className="text-muted-foreground font-normal">/{hub.pricing.split('/').slice(1).join('/')}</span>
              )}
            </div>
          )}
          {hub.operatingHours && (
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-3.5 w-3.5 mr-1.5 shrink-0" />
              <span className="line-clamp-1">{hub.operatingHours}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link 
          href={detailHref}
          className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground h-10 px-4 py-2"
        >
          View Details
        </Link>
      </CardFooter>
    </Card>
  )
}