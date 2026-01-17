"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

export const sendAuthEmail = action({
  args: { email: v.string(), code: v.string() },
  handler: async (ctx, args) => {
    // If we are in dev and don't have a key, just log it.
    // However, the user provided a key (or placeholders).
    // We'll try to use it if present.
    const resendKey = process.env.RESEND_API_KEY;

    if (!resendKey || resendKey.includes("replace_me")) {
        console.log("--------------------------------------------------");
        console.log(`[MOCK EMAIL] To: ${args.email}, Code: ${args.code}`);
        console.log("--------------------------------------------------");
        return { success: true, mocked: true };
    }

    const resend = new Resend(resendKey);

    try {
      const { data, error } = await resend.emails.send({
        from: "EntHub <onboarding@resend.dev>", // Default testing domain
        to: args.email,
        subject: "Your EntHub Login Code",
        html: `<p>Your login code is: <strong>${args.code}</strong></p><p>It expires in 10 minutes.</p>`,
      });

      if (error) {
        console.error("Resend Error:", error);
        throw new Error("Failed to send email");
      }

      return { success: true, id: data?.id };
    } catch (err) {
      console.error(err);
      throw new Error("Failed to send email");
    }
  },
});
