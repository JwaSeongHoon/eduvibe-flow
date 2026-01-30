import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard, CourseCardProps } from "./CourseCard";
import { motion } from "framer-motion";

interface CourseCarouselProps {
  title: string;
  subtitle?: string;
  courses: CourseCardProps[];
  showViewAll?: boolean;
}

export function CourseCarousel({ title, subtitle, courses, showViewAll = true }: CourseCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-8">
      {/* Header */}
      <div className="container flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showViewAll && (
            <Button variant="ghost" className="text-muted-foreground hover:text-primary">
              전체보기
            </Button>
          )}
          <div className="hidden md:flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="border-border hover:border-primary hover:text-primary"
              onClick={() => scroll("left")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="border-border hover:border-primary hover:text-primary"
              onClick={() => scroll("right")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-4 md:px-0 md:container pb-4 snap-x snap-mandatory"
      >
        {courses.map((course, index) => (
          <motion.div
            key={course.id}
            className="flex-shrink-0 w-[280px] md:w-[300px] snap-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <CourseCard {...course} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
