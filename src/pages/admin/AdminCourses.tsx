import { useState } from "react";
import { mockCourses } from "@/data/mockData";
import { CourseCardProps } from "@/components/course/CourseCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Search, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type BadgeType = "BEST" | "NEW" | "인기" | "AI PICK";

interface CourseFormData {
  id: string;
  title: string;
  instructor: string;
  description: string;
  price: number;
  originalPrice: number;
  duration: string;
  thumbnail: string;
  badges: BadgeType[];
}

const emptyFormData: CourseFormData = {
  id: "",
  title: "",
  instructor: "",
  description: "",
  price: 0,
  originalPrice: 0,
  duration: "",
  thumbnail: "",
  badges: [],
};

const validBadges: BadgeType[] = ["BEST", "NEW", "인기", "AI PICK"];

export default function AdminCourses() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState(mockCourses);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CourseFormData>(emptyFormData);
  const [badgeInput, setBadgeInput] = useState("");

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddNew = () => {
    setFormData({
      ...emptyFormData,
      id: `new-${Date.now()}`,
    });
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleEdit = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (course) {
      setFormData({
        id: course.id,
        title: course.title,
        instructor: course.instructor,
        description: "",
        price: course.price,
        originalPrice: course.originalPrice || 0,
        duration: course.duration,
        thumbnail: course.thumbnail,
        badges: course.badges || [],
      });
      setIsEditing(true);
      setIsFormOpen(true);
    }
  };

  const handleDelete = (courseId: string) => {
    setCourses(courses.filter((c) => c.id !== courseId));
    toast({
      title: "강좌 삭제됨",
      description: "강좌가 성공적으로 삭제되었습니다.",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.instructor || !formData.price) {
      toast({
        title: "입력 오류",
        description: "필수 항목을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    const courseData: CourseCardProps = {
      id: formData.id,
      title: formData.title,
      instructor: formData.instructor,
      thumbnail: formData.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=340&fit=crop",
      rating: 4.5,
      reviewCount: 0,
      duration: formData.duration || "0시간",
      price: formData.price,
      originalPrice: formData.originalPrice || undefined,
      badges: formData.badges.length > 0 ? formData.badges : undefined,
    };

    if (isEditing) {
      setCourses(courses.map((c) => (c.id === formData.id ? courseData : c)));
      toast({
        title: "강좌 수정됨",
        description: "강좌 정보가 성공적으로 수정되었습니다.",
      });
    } else {
      setCourses([...courses, courseData]);
      toast({
        title: "강좌 등록됨",
        description: "새 강좌가 성공적으로 등록되었습니다.",
      });
    }

    setIsFormOpen(false);
    setFormData(emptyFormData);
  };

  const handleAddBadge = () => {
    const trimmed = badgeInput.trim() as BadgeType;
    if (trimmed && validBadges.includes(trimmed) && !formData.badges.includes(trimmed)) {
      setFormData({
        ...formData,
        badges: [...formData.badges, trimmed],
      });
      setBadgeInput("");
    }
  };

  const handleRemoveBadge = (badge: BadgeType) => {
    setFormData({
      ...formData,
      badges: formData.badges.filter((b) => b !== badge),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="강좌명 또는 강사명으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          새 강좌 등록
        </Button>
      </div>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>강좌 목록 ({filteredCourses.length}개)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>강좌</TableHead>
                <TableHead className="hidden md:table-cell">강사</TableHead>
                <TableHead className="hidden sm:table-cell">시간</TableHead>
                <TableHead>가격</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    강좌가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="h-12 w-20 object-cover rounded hidden sm:block"
                        />
                        <div>
                          <div className="font-medium line-clamp-1">{course.title}</div>
                          <div className="flex gap-1 mt-1">
                            {course.badges?.map((badge) => (
                              <Badge key={badge} variant="secondary" className="text-xs">
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{course.instructor}</TableCell>
                    <TableCell className="hidden sm:table-cell">{course.duration}</TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium">₩{course.price.toLocaleString()}</span>
                        {course.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through ml-2">
                            ₩{course.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(course.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(course.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Course Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "강좌 수정" : "새 강좌 등록"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">강좌명 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="강좌 제목을 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructor">강사명 *</Label>
                <Input
                  id="instructor"
                  value={formData.instructor}
                  onChange={(e) =>
                    setFormData({ ...formData, instructor: e.target.value })
                  }
                  placeholder="강사 이름을 입력하세요"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">강좌 설명</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="강좌에 대한 설명을 입력하세요"
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">판매가 *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                  placeholder="89000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">정가</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  value={formData.originalPrice || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      originalPrice: Number(e.target.value),
                    })
                  }
                  placeholder="149000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">강의 시간</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="32시간"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">썸네일 이미지 URL</Label>
              <div className="flex gap-2">
                <Input
                  id="thumbnail"
                  value={formData.thumbnail}
                  onChange={(e) =>
                    setFormData({ ...formData, thumbnail: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                />
                <Button type="button" variant="outline" size="icon">
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </div>
              {formData.thumbnail && (
                <img
                  src={formData.thumbnail}
                  alt="Preview"
                  className="h-20 w-32 object-cover rounded mt-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=340&fit=crop";
                  }}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>배지</Label>
              <div className="flex gap-2">
                <Input
                  value={badgeInput}
                  onChange={(e) => setBadgeInput(e.target.value)}
                  placeholder="NEW, BEST, 인기 등"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddBadge();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddBadge}>
                  추가
                </Button>
              </div>
              {formData.badges.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {formData.badges.map((badge) => (
                    <Badge
                      key={badge}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleRemoveBadge(badge)}
                    >
                      {badge} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
              >
                취소
              </Button>
              <Button type="submit">
                {isEditing ? "수정하기" : "등록하기"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
