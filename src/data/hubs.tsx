import { Wifi, Zap, Monitor, Coffee, Printer, Car, Snowflake, Flame, ShieldCheck } from "lucide-react";
import React from "react";

export interface SocialAccount {
    platform: string;
    url: string;
}

export interface Icontact {
    contactNumber: string;
    links?: string[];
    email?: string;
}

export interface IHub {
    id: string;
    name: string;
    description: string;
    location: string;
    governorate: string;
    pricing: string;
    operatingHours: string;
    services: any[];
    imageUrl: any;
    galleryUrls?: string[];
    verificationStatus: "Verified" | "Pending";
    contact:Icontact;
    activeOffer?: any;
    socialAccounts?: SocialAccount[];
    review?: number;
}

export function getServiceIcon(serviceName: string, className: string = "h-5 w-5"): React.ReactNode {
    if (!serviceName) return <ShieldCheck className={className} />;
    
    const n = serviceName.toLowerCase();
    
    if (n.includes("internet") || n.includes("wifi") || n.includes("web") || n.includes("واي فاي") || n.includes("إنترنت") || n.includes("انترنت")) return <Wifi className={className} />;
    if (n.includes("electric") || n.includes("power") || n.includes("solar") || n.includes("كهرباء") || n.includes("طاقة")) return <Zap className={className} />;
    if (n.includes("workspace") || n.includes("desk") || n.includes("monitor") || n.includes("مساحة") || n.includes("عمل")) return <Monitor className={className} />;
    if (n.includes("coffee") || n.includes("tea") || n.includes("قهوة") || n.includes("مشروبات")) return <Coffee className={className} />;
    if (n.includes("print") || n.includes("طابع") || n.includes("طابعة")) return <Printer className={className} />;
    if (n.includes("park") || n.includes("موقف") || n.includes("سيار")) return <Car className={className} />;
    if (n.includes("air condition") || n.includes("ac") || n.includes("تكييف") || n.includes("مكيف")) return <Snowflake className={className} />;
    if (n.includes("heat") || n.includes("تدفئة") || n.includes("دفاية")) return <Flame className={className} />;
    
    return <ShieldCheck className={className} />;
}