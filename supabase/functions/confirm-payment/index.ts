import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { paymentKey, orderId, amount, courseId } = await req.json();

    console.log("결제 승인 요청:", { paymentKey, orderId, amount, courseId });

    // 필수 파라미터 검증
    if (!paymentKey || !orderId || !amount || !courseId) {
      console.error("필수 파라미터 누락");
      return new Response(
        JSON.stringify({
          success: false,
          message: "필수 파라미터가 누락되었습니다.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 토스페이먼츠 시크릿 키 가져오기
    const secretKey = Deno.env.get("TOSS_SECRET_KEY");
    if (!secretKey) {
      console.error("TOSS_SECRET_KEY가 설정되지 않음");
      return new Response(
        JSON.stringify({
          success: false,
          message: "결제 설정이 올바르지 않습니다.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Basic 인증 헤더 생성
    const encodedKey = btoa(`${secretKey}:`);

    // 토스페이먼츠 결제 승인 API 호출
    console.log("토스페이먼츠 결제 승인 API 호출 시작");
    
    const confirmResponse = await fetch(
      "https://api.tosspayments.com/v1/payments/confirm",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${encodedKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount,
        }),
      }
    );

    const confirmResult = await confirmResponse.json();

    if (!confirmResponse.ok) {
      console.error("결제 승인 실패:", confirmResult);
      return new Response(
        JSON.stringify({
          success: false,
          message: confirmResult.message || "결제 승인에 실패했습니다.",
          code: confirmResult.code,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("결제 승인 성공:", {
      paymentKey: confirmResult.paymentKey,
      orderId: confirmResult.orderId,
      method: confirmResult.method,
      totalAmount: confirmResult.totalAmount,
    });

    // Supabase 클라이언트 생성 (사용자 인증 정보 포함)
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey =
      Deno.env.get("SUPABASE_ANON_KEY") ??
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ??
      "";

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase 환경변수가 설정되지 않음", {
        hasUrl: Boolean(supabaseUrl),
        hasKey: Boolean(supabaseKey),
      });
      return new Response(
        JSON.stringify({
          success: false,
          message: "서버 설정 오류가 발생했습니다.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    });

    // 사용자 정보 가져오기
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("사용자 인증 실패:", userError);
      return new Response(
        JSON.stringify({
          success: false,
          message: "로그인이 필요합니다.",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 결제 정보를 enrollments 테이블에 저장
    console.log("결제 정보 저장 시작 - 사용자:", user.id, "강의:", courseId);

    const { data: enrollmentData, error: enrollmentError } = await supabase
      .from("enrollments")
      .insert({
        user_id: user.id,
        course_id: courseId,
        payment_key: confirmResult.paymentKey,
        order_id: confirmResult.orderId,
        amount: confirmResult.totalAmount,
        payment_method: confirmResult.method,
        status: "completed",
        approved_at: confirmResult.approvedAt,
      })
      .select()
      .single();

    if (enrollmentError) {
      console.error("결제 정보 저장 실패:", enrollmentError);
      // 이미 수강중인 강의인 경우 (unique constraint violation)
      if (enrollmentError.code === "23505") {
        return new Response(
          JSON.stringify({
            success: false,
            message: "이미 수강 중인 강의입니다.",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      return new Response(
        JSON.stringify({
          success: false,
          message: "결제 정보 저장에 실패했습니다.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("결제 정보 저장 완료:", enrollmentData);

    return new Response(
      JSON.stringify({
        success: true,
        message: "결제가 완료되었습니다.",
        payment: {
          paymentKey: confirmResult.paymentKey,
          orderId: confirmResult.orderId,
          method: confirmResult.method,
          totalAmount: confirmResult.totalAmount,
          approvedAt: confirmResult.approvedAt,
        },
        enrollment: enrollmentData,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("결제 승인 처리 오류:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "결제 처리 중 오류가 발생했습니다.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
