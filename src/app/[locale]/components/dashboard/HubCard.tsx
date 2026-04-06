import { Link } from "@/src/i18n/routing";
import { Settings, MapPin, ExternalLink } from "lucide-react";

type HubCardProps = {
  hub: any;
};

export function HubCard({ hub }: HubCardProps) {
  // Gracefully handle translations inside name or fallback formats
  const hubName = hub.name?.en || hub.name?.ar || hub.name || "Unnamed Hub";
  const desc = hub.description?.en || hub.description?.ar || hub.description || "No description provided.";
  
  return (
    <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md group">
      <div className="h-48 bg-muted relative overflow-hidden">
        {hub.main_image ? (
          <img 
            src={hub.main_image} 
            alt={hubName} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-primary/10 text-primary/40 font-semibold">
            No Image
          </div>
        )}
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-foreground line-clamp-1">{hubName}</h3>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${hub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
            {hub.status || 'Active'}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {desc}
        </p>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <MapPin className="h-4 w-4" />
          <span className="truncate">{hub.address_details?.en || hub.address || "Location unavailable"}</span>
        </div>
        
        <div className="pt-4 border-t border-border mt-auto flex gap-3">
          <Link 
            href={`/dashboard/hubs/${hub.id}`} 
            className="flex-1 flex justify-center items-center gap-2 py-2.5 px-4 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors text-sm"
          >
            <Settings className="h-4 w-4" />
            Manage Hub
          </Link>
          <button className="p-2.5 border border-input rounded-xl hover:bg-muted text-muted-foreground transition-colors">
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
