import { useSearchParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { mockCourses } from "@/data/mockData";

export default function CheckoutFail() {
  const [searchParams] = useSearchParams();
  
  const code = searchParams.get("code");
  const message = searchParams.get("message");
  const orderId = searchParams.get("orderId");
  const courseId = searchParams.get("courseId");
  
  const course = mockCourses.find((c) => c.id === courseId) || mockCourses[0];

  // 에러 메시지 한글화
  const getErrorMessage = (code: string | null, message: string | null) => {
    switch (code) {
      case "PAY_PROCESS_CANCELED":
        return "결제가 취소되었습니다.";
      case "PAY_PROCESS_ABORTED":
        return "결제 처리 중 오류가 발생했습니다.";
      case "REJECT_CARD_COMPANY":
        return "카드사에서 결제가 거절되었습니다. 카드 정보를 확인해주세요.";
      default:
        return message || "결제 처리 중 문제가 발생했습니다.";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto"
        >
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-16 h-16 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center"
            >
              <XCircle className="w-8 h-8 text-destructive" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-foreground mb-2">
              결제 실패
            </h1>
            
            <p className="text-muted-foreground mb-6">
              {getErrorMessage(code, message)}
            </p>
            
            {code && (
              <div className="bg-secondary/50 rounded-lg p-4 mb-6 text-left">
                <p className="text-xs text-muted-foreground">
                  에러 코드: {code}
                </p>
                {orderId && (
                  <p className="text-xs text-muted-foreground mt-1">
                    주문 번호: {orderId}
                  </p>
                )}
              </div>
            )}
            
            <div className="space-y-3">
              <Link to={`/checkout/${course.id}`}>
                <Button className="w-full gradient-vibe text-primary-foreground glow-primary">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  다시 결제하기
                </Button>
              </Link>
              <Link to={`/courses/${course.id}`}>
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  강의 페이지로 돌아가기
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
