import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { AITutorButton } from "@/components/ai/AITutorButton";
import { CourseCard } from "@/components/course/CourseCard";
import { CategoryTabs } from "@/components/course/CategoryTabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { mockCourses, categories } from "@/data/mockData";

export default function Courses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");

  const filteredCourses = mockCourses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            전체 강의
          </h1>
          <p className="text-muted-foreground mb-8">
            1,000개 이상의 고품질 강의를 만나보세요
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          className="flex flex-col md:flex-row gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="강의명, 강사명으로 검색"
              className="pl-10 bg-card border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 bg-card border-border">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">인기순</SelectItem>
                <SelectItem value="newest">최신순</SelectItem>
                <SelectItem value="rating">평점순</SelectItem>
                <SelectItem value="price-low">가격 낮은순</SelectItem>
                <SelectItem value="price-high">가격 높은순</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-border">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              필터
            </Button>
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <CategoryTabs categories={categories} />
        </motion.div>

        {/* Course Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <CourseCard {...course} />
            </motion.div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">검색 결과가 없습니다.</p>
          </div>
        )}
      </main>

      <AITutorButton />
    </div>
  );
}
