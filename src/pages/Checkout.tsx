import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { loadTossPayments, TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCourse } from "@/hooks/useCourses";
import { Loader2, ShieldCheck, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

export default function Checkout() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { course, loading: courseLoading } = useCourse(courseId);
  
  const [ready, setReady] = useState(false);
  const [widgets, setWidgets] = useState<TossPaymentsWidgets | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const paymentMethodRef = useRef<HTMLDivElement>(null);
  const agreementRef = useRef<HTMLDivElement>(null);

  // 로그인 체크
  useEffect(() => {
    if (!authLoading && !user) {
      navigate(`/auth?redirect=/checkout/${courseId}`);
    }
  }, [user, authLoading, navigate, courseId]);

  // 토스페이먼츠 위젯 초기화
  useEffect(() => {
    if (!user || !course || courseLoading) return;

    async function initTossPayments() {
      try {
        const tossPayments = await loadTossPayments(clientKey);
        
        // 사용자 고유 키 생성 (UUID 형식)
        const customerKey = user!.id;
        
        const widgetsInstance = tossPayments.widgets({
          customerKey,
        });

        // 결제 금액 설정
        await widgetsInstance.setAmount({
          currency: "KRW",
          value: course.price,
        });

        setWidgets(widgetsInstance);

        // 결제 UI 렌더링
        await Promise.all([
          widgetsInstance.renderPaymentMethods({
            selector: "#payment-method",
            variantKey: "DEFAULT",
          }),
          widgetsInstance.renderAgreement({
            selector: "#agreement",
            variantKey: "AGREEMENT",
          }),
        ]);

        setReady(true);
      } catch (error) {
        console.error("토스페이먼츠 초기화 실패:", error);
      }
    }

    initTossPayments();
  }, [user, course, courseLoading]);

  const handlePayment = async () => {
    if (!widgets || !user || !course) return;
    
    setIsProcessing(true);
    
    try {
      // 주문 ID 생성 (고유해야 함)
      const orderId = `order_${Date.now()}_${user.id.slice(0, 8)}`;
      
      await widgets.requestPayment({
        orderId,
        orderName: course.title,
        successUrl: `${window.location.origin}/checkout/success?courseId=${course.id}`,
        failUrl: `${window.location.origin}/checkout/fail?courseId=${course.id}`,
        customerEmail: user.email || undefined,
        customerName: user.user_metadata?.display_name || user.email?.split("@")[0] || "고객",
      });
    } catch (error) {
      console.error("결제 요청 실패:", error);
      setIsProcessing(false);
    }
  };

  if (authLoading || courseLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">강좌를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const discount = course.original_price
    ? Math.round(((course.original_price - course.price) / course.original_price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
            결제하기
          </h1>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* 결제 위젯 영역 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 결제 수단 */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  결제 수단
                </h2>
                <div id="payment-method" ref={paymentMethodRef}>
                  {!ready && (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* 이용약관 */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div id="agreement" ref={agreementRef}>
                  {!ready && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* 주문 요약 */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-card rounded-xl border border-border p-6 space-y-6">
                <h2 className="text-lg font-semibold text-foreground">주문 요약</h2>
                
                {/* 강의 정보 */}
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <img
                      src={course.thumbnail_url || "/placeholder.svg"}
                      alt={course.title}
                      className="w-20 h-14 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground text-sm line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {course.instructor}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-border pt-4 space-y-3">
                  {course.original_price && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">정가</span>
                      <span className="text-muted-foreground line-through">
                        ₩{course.original_price.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">할인</span>
                      <span className="text-accent font-medium">
                        -{discount}%
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                    <span className="text-foreground">결제 금액</span>
                    <span className="text-primary">
                      ₩{course.price.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <Button
                  className="w-full gradient-vibe text-primary-foreground glow-primary h-12 text-lg"
                  onClick={handlePayment}
                  disabled={!ready || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      처리 중...
                    </>
                  ) : (
                    `₩${course.price.toLocaleString()} 결제하기`
                  )}
                </Button>
                
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="w-4 h-4" />
                  <span>안전한 결제가 보장됩니다</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
