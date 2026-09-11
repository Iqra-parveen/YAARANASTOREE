import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildEasyPaisaRequest, getEasyPaisaActionUrl } from "@/lib/payments/easypaisa";

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { orderId } = await req.json();
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (error || !order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const origin = new URL(req.url).origin;
  const orderRefNum = order.tracking_id.replace(/[^A-Za-z0-9]/g, "").slice(0, 20);

  const fields = buildEasyPaisaRequest({
    amountPKR: Number(order.total_amount),
    orderRefNum,
    postBackURL: `${origin}/api/payments/easypaisa/callback`,
  });

  await supabase
    .from("orders")
    .update({ payment_method: "easypaisa", payment_txn_ref: orderRefNum })
    .eq("id", order.id);

  return NextResponse.json({ actionUrl: getEasyPaisaActionUrl(), fields });
}
