import TopBar from "@/components/TopBar";

export default function CustomerCarePage() {
  const faqs = [
    { q: "How do I track my order?", a: "Go to Profile → My Orders and select your order to see its live status." },
    { q: "Can I cancel an order?", a: "Contact us with your tracking ID as soon as possible and we'll help before it ships." },
    { q: "What payment methods are accepted?", a: "This is set up per your payment provider — update at launch." },
    { q: "How do promo codes work?", a: "Enter your code at checkout; the discount is validated and applied automatically." },
  ];

  return (
    <div>
      <TopBar title="Customer Care" />
      <div className="px-4 pt-4">
        <div className="flex flex-col divide-y divide-hairline border-t border-hairline">
          {faqs.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="focus-gold cursor-pointer list-none text-sm text-bone">
                {f.q}
              </summary>
              <p className="mt-2 text-sm text-bone/60">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-6 text-sm text-bone/60">
          Still need help? Reach us via the Contact Us page.
        </p>
      </div>
    </div>
  );
}
