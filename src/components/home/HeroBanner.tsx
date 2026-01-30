import { Button } from "@/components/ui/button";
import { Play, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function HeroBanner() {
  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-hero-gradient" />
      
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-gradient-radial from-primary/20 via-transparent to-transparent blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-radial from-accent/10 via-transparent to-transparent blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="container relative z-10 pt-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">AI 맞춤 학습 추천</span>
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            학습의 흐름을{" "}
            <span className="gradient-vibe-text">Vibe</span>와 함께
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            1,000개 이상의 고품질 강의와 AI 학습 도우미가 당신의 성장을 도와드립니다.
            지금 바로 학습을 시작하세요.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button size="lg" className="gradient-vibe text-primary-foreground glow-primary hover:opacity-90 transition-opacity">
              무료로 시작하기
            </Button>
            <Button size="lg" variant="outline" className="border-border hover:border-primary gap-2">
              <Play className="w-4 h-4" />
              둘러보기
            </Button>
          </motion.div>

          <motion.div
            className="flex items-center gap-8 mt-12 pt-8 border-t border-border/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div>
              <p className="text-3xl font-bold gradient-vibe-text">10만+</p>
              <p className="text-sm text-muted-foreground">수강생</p>
            </div>
            <div>
              <p className="text-3xl font-bold gradient-vibe-text">1,000+</p>
              <p className="text-sm text-muted-foreground">강의 수</p>
            </div>
            <div>
              <p className="text-3xl font-bold gradient-vibe-text">4.8</p>
              <p className="text-sm text-muted-foreground">평균 평점</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
