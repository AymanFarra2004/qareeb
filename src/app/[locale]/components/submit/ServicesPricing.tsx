import React from "react";

const ServicesPricing = () => {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold border-b border-border pb-2">2. Services & Contact</h2>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Contact Number</label>
        <input
          name="contact"
          type="tel"
          dir="ltr"
          required
          className="w-full md:w-1/2 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-left"
          placeholder="e.g. 0591234567"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Facebook URL</label>
          <input
            name="facebook_url"
            type="url"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-left"
            placeholder="https://facebook.com/..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Twitter (X) URL</label>
          <input
            name="twitter_url"
            type="url"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-left"
            placeholder="https://twitter.com/..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Available Services Overview</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {["Internet", "Electricity", "Workspace", "Coffee/Tea"].map((service) => (
            <label
              key={service}
              className="flex items-center space-x-2 border border-border p-3 rounded-lg cursor-pointer hover:bg-muted transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <input name="services_enabled" value={service.toLowerCase()} type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <span className="text-sm font-medium">{service}</span>
            </label>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesPricing;