import Link from "next/link";
import { RotateCcw, ShieldCheck, Truck, HelpCircle, MessageCircle, Mail } from "lucide-react";
import TopBar from "@/components/TopBar";
import Reveal from "@/components/Reveal";

export default function CustomerCarePage() {
  const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923001234567";
  const cleanNumber = rawNumber.replace(/[^0-9]/g, "");
  const returnWaMessage = encodeURIComponent(
    "Hello YAARANA, I would like to request an exchange/return for my order."
  );
  const waUrl = `https://wa.me/${cleanNumber}?text=${returnWaMessage}`;

  const faqs = [
    {
      q: "What is your return & exchange policy?",
      a: "We offer a 7-day hassle-free return and exchange window from the date of delivery. Items must be unworn, unwashed, and in their original packaging with all tags attached.",
    },
    {
      q: "How do I request an exchange or return?",
      a: "Simply click the 'Request Exchange via WhatsApp' button above or email us at support@yaarana.com with your Order # and the reason. Our team responds within 24 hours.",
    },
    {
      q: "How long does nationwide delivery take?",
      a: "Standard delivery across Pakistan takes 3 to 7 working days. Major metro cities (Lahore, Karachi, Islamabad) typically arrive within 3-4 working days.",
    },
    {
      q: "Can I inspect the parcel before paying for Cash on Delivery?",
      a: "Per courier industry standards in Pakistan, riders cannot open sealed flyers prior to payment collection. However, our 7-day return guarantee completely protects your purchase.",
    },
    {
      q: "How do I track my order status?",
      a: "Go to Profile → My Orders to see real-time tracking. Guests can view their order using the link in their confirmation email.",
    },
    {
      q: "Can I cancel an order?",
      a: "Orders can be cancelled before they enter 'shipped' status. Please contact our support team immediately via WhatsApp or phone with your Order ID.",
    },
  ];

  return (
    <div>
      <TopBar title="Customer Care" />
      <div className="px-4 py-6">
        {/* Trust Badges */}
        <Reveal className="grid grid-cols-3 gap-2 border border-hairline bg-charcoal/50 p-3 text-center">
          <div className="flex flex-col items-center">
            <RotateCcw size={20} className="text-gold" />
            <span className="mt-1 text-[11px] font-medium text-bone">7-Day Return</span>
            <span className="text-[10px] text-bone/50">Hassle-free exchange</span>
          </div>
          <div className="flex flex-col items-center border-x border-hairline">
            <ShieldCheck size={20} className="text-gold" />
            <span className="mt-1 text-[11px] font-medium text-bone">100% Original</span>
            <span className="text-[10px] text-bone/50">Premium quality</span>
          </div>
          <div className="flex flex-col items-center">
            <Truck size={20} className="text-gold" />
            <span className="mt-1 text-[11px] font-medium text-bone">Nationwide</span>
            <span className="text-[10px] text-bone/50">Fast shipping</span>
          </div>
        </Reveal>

        {/* Returns & Exchange Section */}
        <div className="mt-8 rounded-sm border border-gold/30 bg-gold/5 p-4">
          <div className="flex items-center gap-2">
            <RotateCcw size={18} className="text-gold" />
            <h2 className="font-display text-lg italic text-bone">Returns & Exchanges</h2>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-bone/80">
            Ordered the wrong size or not completely satisfied? We make exchanges quick and easy.
          </p>

          <ol className="mt-3 space-y-1.5 text-xs text-bone/70 list-decimal list-inside">
            <li>Notify us within 7 days of receiving your parcel.</li>
            <li>Keep the item unworn and unwashed with all tags intact.</li>
            <li>Our team will arrange replacement or store credit.</li>
          </ol>

          <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-gold inline-flex items-center justify-center gap-2 rounded-sm bg-[#25D366] px-4 py-2.5 text-xs font-medium text-white shadow-sm hover:brightness-105 transition-all"
            >
              <MessageCircle size={15} />
              <span>Request Exchange via WhatsApp</span>
            </a>
            <Link
              href="/contact"
              className="focus-gold inline-flex items-center justify-center gap-2 rounded-sm border border-hairline bg-charcoal px-4 py-2.5 text-xs font-medium text-bone hover:border-gold/50 transition-colors"
            >
              <Mail size={15} />
              <span>Email Support</span>
            </Link>
          </div>
        </div>

        {/* FAQs */}
        <div className="mt-8">
          <div className="flex items-center gap-2 border-b border-hairline pb-2">
            <HelpCircle size={16} className="text-gold" />
            <h2 className="font-display text-lg italic text-bone">Frequently Asked Questions</h2>
          </div>

          <div className="divide-y divide-hairline">
            {faqs.map((f) => (
              <details key={f.q} className="group py-3.5">
                <summary className="focus-gold cursor-pointer list-none text-xs font-medium text-bone hover:text-gold transition-colors">
                  {f.q}
                </summary>
                <p className="mt-2 text-xs leading-relaxed text-bone/65">{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Bottom Support Banner */}
        <div className="mt-8 rounded-sm border border-hairline bg-charcoal p-4 text-center">
          <h3 className="font-display text-base italic text-bone">Still need assistance?</h3>
          <p className="mt-1 text-xs text-bone/60">
            Our support desk is active Monday to Saturday from 10:00 AM to 7:00 PM PKT.
          </p>
          <div className="mt-3 flex justify-center gap-4">
            <Link href="/contact" className="focus-gold text-xs font-medium text-gold underline">
              Contact Us
            </Link>
            <span className="text-hairline">|</span>
            <Link href="/about" className="focus-gold text-xs font-medium text-bone/70 underline">
              About YAARANA
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
