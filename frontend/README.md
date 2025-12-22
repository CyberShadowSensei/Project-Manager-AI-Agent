# Dashboard PM

A modern project management dashboard built with React, TypeScript, and Vite. This application provides a comprehensive suite of tools for task management, analytics tracking, and team communication.

## Features

- **Dashboard**: Overview of key metrics and analytics with interactive charts
- **Task Management**: Create, organize, and track tasks with intuitive UI
- **Inbox**: Centralized communication hub for messages and notifications
- **Analytics**: Visual data representation using charts and graphs
- **Reports**: Generate and view detailed project reports
- **Settings**: Customizable user preferences and configurations
- **Responsive Design**: Mobile-friendly interface that adapts to all screen sizes
- **Dark Theme**: Modern dark UI built with Tailwind CSS

## Tech Stack

- **Frontend Framework**: React 19
- **Language**: TypeScript 5.9
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 3
- **Routing**: React Router 7
- **Charts**: Recharts 3
- **Icons**: Lucide React
- **Linting**: ESLint 9
- **CSS Processing**: PostCSS & Autoprefixer

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dashboardpm.git
cd dashboardpm
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start the development server with hot module replacement
- `npm run build` - Compile TypeScript and build optimized production bundle
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── Dashboard.tsx   # Main dashboard component
│   ├── TaskManager.tsx # Task management interface
│   ├── Inbox.tsx       # Inbox/messaging component
│   ├── Header.tsx      # Application header
│   ├── Sidebar.tsx     # Navigation sidebar
│   ├── Layout.tsx      # Main layout wrapper
│   └── ...
├── pages/              # Page components for routing
│   ├── DashboardPage.tsx
│   ├── TasksPage.tsx
│   ├── InboxPage.tsx
│   ├── ReportsPage.tsx
│   ├── SettingsPage.tsx
│   └── WelcomePage.tsx
├── App.tsx            # Main application component
├── main.tsx           # Entry point
└── index.css          # Global styles
```

## Configuration

- **Vite**: [vite.config.ts](vite.config.ts)
- **TypeScript**: [tsconfig.json](tsconfig.json)
- **Tailwind CSS**: [tailwind.config.js](tailwind.config.js)
- **ESLint**: [eslint.config.js](eslint.config.js)
- **PostCSS**: [postcss.config.js](postcss.config.js)

## Development

The project uses:
- **HMR (Hot Module Replacement)** for instant feedback during development
- **TypeScript** for type safety and better developer experience
- **ESLint** for code quality and consistency
- **Tailwind CSS** for utility-first styling

## Building for Production

To create an optimized production build:

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Linting

Check code quality:

```bash
npm run lint
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, issues, or feature requests, please open an issue on the GitHub repository.

---

**Built with ❤️ using React + TypeScript + Vite**
