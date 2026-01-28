import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function RewardVoucher({ user }: { user: any }) {
  const [rank, setRank] = useState<number | null>(null);
  const [redeemed, setRedeemed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadRewardStatus() {
      // Check Top 3 rank
      const { data: rankData } = await supabase
        .from("top_3_users")
        .select("rank")
        .eq("id", user.id)
        .single();

      if (rankData) setRank(rankData.rank);

      // Check redeem status
      const { data: profile } = await supabase
        .from("profiles")
        .select("gift_redeemed")
        .eq("id", user.id)
        .single();

      setRedeemed(profile?.gift_redeemed);
    }

    loadRewardStatus();
  }, [user.id]);

  async function redeemGift() {
    setLoading(true);
    const { data, error } = await supabase.rpc("redeem_gift");
    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert(data);
      setRedeemed(true);
    }
  }

  // Not in Top 3 → don’t show anything
  if (!rank) return null;

  return (
    <div className="mt-6 rounded-xl border border-yellow-300 bg-yellow-50 p-4">
      <h2 className="text-lg font-bold">🏆 Reward Voucher</h2>

      <p className="mt-1">
        Congratulations! You are <b>Rank #{rank}</b>
      </p>

      {!redeemed ? (
        <button
          onClick={redeemGift}
          disabled={loading}
          className="mt-3 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          {loading ? "Processing..." : "🎁 Redeem Gift"}
        </button>
      ) : (
        <p className="mt-3 font-semibold text-green-700">
          ✅ Gift already redeemed
        </p>
      )}
    </div>
  );
}
