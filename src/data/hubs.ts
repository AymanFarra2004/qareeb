
export interface SocialAccount {
    platform: string;
    url: string;
}

interface Icontact {
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
    services: string[];
    imageUrl: any;
    galleryUrls?: string[];
    verificationStatus: "Verified" | "Pending";
    contact:Icontact;
    activeOffer?: any;
    socialAccounts?: SocialAccount[];
}
