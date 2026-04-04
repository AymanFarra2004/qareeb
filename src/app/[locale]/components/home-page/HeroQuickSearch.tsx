import { MapPin, Wifi, Search } from 'lucide-react'
import { useTranslations } from 'next-intl';

const HeroQuickSearch = ({setFilter}: {setFilter: React.Dispatch<React.SetStateAction<{ governorate: string, service: string }>>}) => {
    const t = useTranslations("Hero");
  return (
    <div className="bg-background rounded-3xl sm:rounded-full shadow-lg border border-border p-2 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <select onChange={(e) => setFilter(prev => ({ ...prev, governorate: e.target.value }))} className="w-full h-12 pl-12 pr-4 bg-transparent appearance-none focus:outline-none text-foreground cursor-pointer rounded-full hover:bg-muted/50 transition-colors">
                    <option value="">{t("filters.governorates.placeholder")}</option>
                    <option value="North Gaza">{t("filters.governorates.northGaza")}</option>
                    <option value="Gaza">{t("filters.governorates.gazaCity")}</option>
                    <option value="Deir al-Balah">{t("filters.governorates.deirAlBalah")}</option>
                    <option value="Khan Yunis">{t("filters.governorates.khanYunis")}</option>
                    <option value="Rafah">{t("filters.governorates.rafah")}</option>
                  </select>
                </div>
                <div className="hidden sm:block w-px bg-border my-2" />
                <div className="flex-1 relative">
                  <Wifi className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <select onChange={(e) => setFilter(prev => ({ ...prev, service: e.target.value }))} className="w-full h-12 pl-12 pr-4 bg-transparent appearance-none focus:outline-none text-foreground cursor-pointer rounded-full hover:bg-muted/50 transition-colors">
                    <option value="">{t("filters.services.placeholder")}</option>
                    <option value="Internet">{t("filters.services.internet")}</option>
                    <option value="Electricity">{t("filters.services.electricity")}</option>
                    <option value="Workspace">{t("filters.services.workspace")}</option>
                  </select>
                </div>
                <button className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 rounded-full font-medium transition-all shadow-md flex items-center justify-center gap-2">
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("searchButton")}</span>
                </button>
              </div>
  )
}

export default HeroQuickSearch