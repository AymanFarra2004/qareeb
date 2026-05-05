<p align="center">
  <img src="public/qareeb_logo.png" alt="Qareeb Logo" width="200" />
</p>

# Qareeb (قريب) - Connecting Gaza to Essential Services

**Qareeb** is a mission-driven platform designed to empower communities in Gaza by connecting people to essential service hubs. In an environment where reliable internet and electricity are scarce, Qareeb provides a verified directory of workspaces, cafes, and hubs equipped with the resources needed for remote work, study, and staying connected.

---

## 🌟 Key Features

### 🔍 For Users
- **Smart Discovery**: Easily find the closest workspaces and service hubs across all governorates in Gaza.
- **Advanced Filtering**: Filter hubs by essential services (Internet, Electricity, Private Rooms, etc.) and location.
- **Verified Status**: Identify "Verified Partners" to ensure a reliable and safe environment.
- **Detailed Listings**: View operating hours, pricing, available services, and high-quality galleries.
- **Multilingual Support**: Fully localized in **Arabic** and **English**.

### 🏗️ For Hub Owners
- **Easy Listing**: Add your hub to the platform with a comprehensive submission form.
- **Dynamic Dashboard**: Manage your hub's services, special offers, and gallery in real-time.
- **Subscription Management**: Create and manage flexible subscription-based offers for your community.
- **Image Optimization**: Built-in client-side image compression for fast and efficient photo uploads.

### 🛡️ For Administrators
- **Moderation Tools**: Approve or reject hub applications with feedback for owners.
- **Global Management**: Manage system-wide services, locations, and user roles.
- **Activity Monitoring**: Keep track of platform growth and user interactions.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide React](https://lucide.dev/)
- **Authentication**: Custom Auth with Google Login integration
- **Data Fetching**: [Axios](https://axios-http.com/)

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm / yarn / pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AymanFarra2004/qareeb.git
   cd qareeb
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add your configuration:
   ```env
   NEXT_PUBLIC_API_URL=your_api_url
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_id
   # Add other required variables
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## 📂 Project Structure

```text
src/
├── actions/         # Next.js Server Actions
├── app/             # Next.js App Router (i18n routes)
│   └── [locale]/    # Localized pages and components
├── components/      # Shared UI components (Shadcn/UI)
├── data/            # Static data and constants
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and shared logic
├── messages/        # Translation files (JSON)
├── store/           # Redux store and slices
└── types/           # TypeScript definitions
```

---

## 🤝 Contributing

We welcome contributions from the community! Whether it's fixing a bug, adding a feature, or improving documentation:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📞 Contact

**Qareeb Team**  
Email: [support@qareeb.cc](mailto:support@qareeb.cc)  
WhatsApp: [+970592135146](https://wa.me/970592135146)  
Instagram: [@qareeb_gaza](https://instagram.com/qareeb_gaza)

Built with ❤️ for Gaza.
