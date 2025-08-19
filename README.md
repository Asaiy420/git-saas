# Git-SaaS

A modern SaaS platform for collaborative GitHub project management, code Q&A, and AI-powered meeting analysis.

## Features

- **GitHub Integration:** Connect and manage your repositories, view commit logs, and collaborate with your team.
- **AI Meeting Analysis:** Upload and analyze meeting audio files using AI, with storage powered by Supabase.
- **Code Q&A:** Ask questions about your codebase and get instant answers.
- **Team Collaboration:** Manage team members, invite collaborators, and track project activity.
- **Customizable UI:** Light/dark mode toggle and responsive design.
- **Secure Auth:** User authentication powered by Clerk.

## Tech Stack

- **Next.js** – React framework for server-side rendering and routing
- **Prisma** – Type-safe ORM for PostgreSQL
- **Supabase** – File storage and real-time database
- **Clerk** – Authentication and user management
- **tRPC** – End-to-end typesafe APIs
- **Tailwind CSS** – Utility-first CSS framework
- **Radix UI** – Accessible UI primitives
- **Lucide React** – Icon library
- **React Query** – Data fetching and caching
- **Sonner** – Toast notifications

## Getting Started

1. **Clone the repo:**

   ```sh
   git clone https://github.com/your-username/git-saas.git
   cd git-saas
   ```

2. **Install dependencies:**

   ```sh
   bun install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in your Supabase, Clerk, and database credentials.

4. **Run database migrations:**

   ```sh
   bun run db:generate
   ```

5. **Start the development server:**

   ```sh
   bun dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

## File Uploads

- Audio files are uploaded to Supabase Storage and analyzed by AI.
- Supported formats: `.mp3`, `.wav`, `.m4a` (max 50MB).

## Deployment

- Deploy easily to [Vercel](https://vercel.com/), [Netlify](https://www.netlify.com/), or Docker.
- See the official Next.js and T3 deployment docs for more.

## License

MIT
