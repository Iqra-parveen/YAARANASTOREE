import BottomNav from "@/components/BottomNav";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <div className="flex-1 pb-4">{children}</div>
      <WhatsAppButton />
      <BottomNav />
      <CartDrawer />
    </div>
  );
}
