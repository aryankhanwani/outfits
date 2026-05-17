export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200/60 bg-white/30 py-10 backdrop-blur dark:border-zinc-800/60 dark:bg-zinc-950/20">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
              OutfitAI
            </div>
            <p className="mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
              Virtual try-on and cloth ideas powered by fast image editing. Built
              for creators, shoppers, and teams.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
                Product
              </div>
              <div className="space-y-2 text-sm">
                <a className="block text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white" href="/studio">
                  Studio
                </a>
                <a className="block text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white" href="/pricing">
                  Pricing
                </a>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
                Account
              </div>
              <div className="space-y-2 text-sm">
                <a className="block text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white" href="/login">
                  Log in
                </a>
                <a className="block text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white" href="/account">
                  Profile
                </a>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
                Legal
              </div>
              <div className="space-y-2 text-sm">
                <span className="block text-zinc-500 dark:text-zinc-500">
                  Privacy / Terms (add pages)
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-zinc-200/60 pt-6 text-xs text-zinc-500 dark:border-zinc-800/60 dark:text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} OutfitAI. All rights reserved.</span>
          <span>Secure payments · Private workspace</span>
        </div>
      </div>
    </footer>
  );
}

