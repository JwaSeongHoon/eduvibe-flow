import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Loader2, XCircle, BookOpen, Home } from "lucide-react";
import { motion } from "framer-motion";
import { mockCourses } from "@/data/mockData";

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  
  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const courseId = searchParams.get("courseId");
  
  const course = mockCourses.find((c) => c.id === courseId) || mockCourses[0];

  useEffect(() => {
    async function confirmPayment() {
      if (!paymentKey || !orderId || !amount) {
        setStatus("error");
        setErrorMessage("결제 정보가 올바르지 않습니다.");
        return;
      }

      try {
        // Edge Function 호출하여 결제 승인
        const { data, error } = await supabase.functions.invoke("confirm-payment", {
          body: {
            paymentKey,
            orderId,
            amount: Number(amount),
            courseId,
          },
        });

        if (error) {
          console.error("결제 승인 에러:", error);
          setStatus("error");
          setErrorMessage(error.message || "결제 승인에 실패했습니다.");
          return;
        }

        if (data?.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMessage(data?.message || "결제 승인에 실패했습니다.");
        }
      } catch (error) {
        console.error("결제 승인 처리 오류:", error);
        setStatus("error");
        setErrorMessage("결제 처리 중 오류가 발생했습니다.");
      }
    }

    confirmPayment();
  }, [paymentKey, orderId, amount, courseId]);

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
            {status === "loading" && (
              <>
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  결제 확인 중...
                </h1>
                <p className="text-muted-foreground">
                  잠시만 기다려주세요.
                </p>
              </>
            )}
            
            {status === "success" && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="w-16 h-16 mx-auto mb-6 rounded-full gradient-vibe flex items-center justify-center"
                >
                  <CheckCircle className="w-8 h-8 text-primary-foreground" />
                </motion.div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  결제가 완료되었습니다!
                </h1>
                <p className="text-muted-foreground mb-6">
                  {course.title} 강의를 수강하실 수 있습니다.
                </p>
                
                <div className="bg-secondary/50 rounded-lg p-4 mb-6 text-left">
                  <div className="flex gap-4">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-20 h-14 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-medium text-foreground text-sm">
                        {course.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {course.instructor}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Link to={`/learn/${course.id}/1-1`}>
                    <Button className="w-full gradient-vibe text-primary-foreground glow-primary">
                      <BookOpen className="w-4 h-4 mr-2" />
                      지금 바로 학습하기
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button variant="outline" className="w-full">
                      <Home className="w-4 h-4 mr-2" />
                      대시보드로 이동
                    </Button>
                  </Link>
                </div>
              </>
            )}
            
            {status === "error" && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="w-16 h-16 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center"
                >
                  <XCircle className="w-8 h-8 text-destructive" />
                </motion.div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  결제 승인 실패
                </h1>
                <p className="text-muted-foreground mb-6">
                  {errorMessage}
                </p>
                
                <div className="space-y-3">
                  <Link to={`/checkout/${course.id}`}>
                    <Button className="w-full gradient-vibe text-primary-foreground">
                      다시 시도하기
                    </Button>
                  </Link>
                  <Link to={`/courses/${course.id}`}>
                    <Button variant="outline" className="w-full">
                      강의 페이지로 돌아가기
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
