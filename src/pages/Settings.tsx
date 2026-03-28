import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function SettingsPage() {
  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto space-y-12">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your workspace preferences and account details.</p>
        </div>

        <section className="space-y-6">
          <h2 className="text-xl font-bold border-b border-border/50 pb-4">Profile</h2>
          <div className="flex items-start gap-8">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border border-border shadow-sm">
              <img 
                src={`${import.meta.env.BASE_URL}images/avatar.png`} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-4 max-w-md">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Display Name</label>
                <Input defaultValue="Creator Profile" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Email Address</label>
                <Input type="email" defaultValue="hello@nexus.com" />
              </div>
              <Button>Save Changes</Button>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold border-b border-border/50 pb-4">Appearance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl border-2 border-primary bg-primary/5 cursor-pointer relative">
              <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-primary border-2 border-background ring-2 ring-primary" />
              <h3 className="font-bold mb-1">System Preference</h3>
              <p className="text-sm text-muted-foreground">Matches your OS setting</p>
            </div>
            <div className="p-6 rounded-2xl border-2 border-transparent bg-secondary cursor-pointer hover:border-primary/30 transition-colors">
              <h3 className="font-bold mb-1">Dark Mode</h3>
              <p className="text-sm text-muted-foreground">Always use dark theme</p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold border-b border-destructive/20 pb-4 text-destructive">Danger Zone</h2>
          <div className="p-6 rounded-2xl border border-destructive/20 bg-destructive/5 space-y-4">
            <h3 className="font-bold text-foreground">Delete Account</h3>
            <p className="text-sm text-muted-foreground max-w-xl">
              Permanently remove your personal account and all of its contents from the Nexus platform. This action is not reversible.
            </p>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </section>
      </div>
    </Layout>
  );
}
