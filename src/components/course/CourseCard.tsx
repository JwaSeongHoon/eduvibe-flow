import { Link } from "react-router-dom";
import { Star, Clock, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export interface CourseCardProps {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  rating: number;
  reviewCount: number;
  duration: string;
  price: number;
  originalPrice?: number;
  badges?: ("BEST" | "NEW" | "인기" | "AI PICK")[];
  progress?: number;
}

const badgeStyles: Record<string, string> = {
  BEST: "bg-accent text-accent-foreground",
  NEW: "bg-primary text-primary-foreground",
  인기: "bg-destructive text-destructive-foreground",
  "AI PICK": "bg-gradient-vibe text-primary-foreground",
};

export function CourseCard({
  id,
  title,
  instructor,
  thumbnail,
  rating,
  reviewCount,
  duration,
  price,
  originalPrice,
  badges = [],
  progress,
}: CourseCardProps) {
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <Link to={`/courses/${id}`}>
      <motion.div
        className="group relative bg-card rounded-xl overflow-hidden border border-border card-hover"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full gradient-vibe flex items-center justify-center glow-primary">
              <Play className="w-6 h-6 text-primary-foreground ml-1" />
            </div>
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="absolute top-3 left-3 flex gap-1.5">
              {badges.map((badge) => (
                <Badge key={badge} className={badgeStyles[badge]}>
                  {badge}
                </Badge>
              ))}
            </div>
          )}

          {/* Progress bar */}
          {progress !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
              <div
                className="h-full gradient-vibe transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          <p className="text-sm text-muted-foreground">{instructor}</p>

          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-warning fill-warning" />
              <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({reviewCount})</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{duration}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {discount > 0 && (
              <span className="text-accent font-bold">{discount}%</span>
            )}
            <span className="font-bold text-lg text-foreground">
              ₩{price.toLocaleString()}
            </span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ₩{originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
