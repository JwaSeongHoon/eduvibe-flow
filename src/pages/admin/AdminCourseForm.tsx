import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  GripVertical,
  Video,
  Loader2,
  Save,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCourse, createCourse, updateCourse } from "@/hooks/useCourses";
import { useLessons, createLesson, updateLesson, deleteLesson } from "@/hooks/useLessons";

interface LessonFormData {
  id?: string;
  title: string;
  duration: string;
  is_preview: boolean;
  video_file?: File;
  video_url?: string;
  order_index: number;
  isNew?: boolean;
}

const categories = [
  { value: "development", label: "개발" },
  { value: "design", label: "디자인" },
  { value: "business", label: "비즈니스" },
  { value: "marketing", label: "마케팅" },
  { value: "data", label: "데이터" },
  { value: "ai", label: "AI/머신러닝" },
  { value: "general", label: "일반" },
];

export default function AdminCourseForm() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!courseId;

  const { course: existingCourse, loading: courseLoading } = useCourse(courseId);
  const { lessons: existingLessons, loading: lessonsLoading } = useLessons(courseId);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Course form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructor, setInstructor] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number | null>(null);
  const [category, setCategory] = useState("general");
  const [duration, setDuration] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  // Lessons state
  const [lessons, setLessons] = useState<LessonFormData[]>([]);

  // Load existing data when editing
  useEffect(() => {
    if (existingCourse) {
      setTitle(existingCourse.title);
      setDescription(existingCourse.description || "");
      setInstructor(existingCourse.instructor);
      setPrice(existingCourse.price);
      setOriginalPrice(existingCourse.original_price);
      setCategory(existingCourse.category);
      setDuration(existingCourse.duration || "");
      setThumbnailUrl(existingCourse.thumbnail_url || "");
      setIsPublished(existingCourse.is_published);
    }
  }, [existingCourse]);

  useEffect(() => {
    if (existingLessons.length > 0) {
      setLessons(
        existingLessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          duration: lesson.duration || "",
          is_preview: lesson.is_preview,
          video_url: lesson.video_url || undefined,
          order_index: lesson.order_index,
        }))
      );
    }
  }, [existingLessons]);

  const addLesson = () => {
    setLessons([
      ...lessons,
      {
        title: "",
        duration: "",
        is_preview: false,
        order_index: lessons.length,
        isNew: true,
      },
    ]);
  };

  const removeLesson = async (index: number) => {
    const lesson = lessons[index];
    if (lesson.id && !lesson.isNew) {
      try {
        await deleteLesson(lesson.id);
      } catch (error) {
        console.error("레슨 삭제 실패:", error);
        toast({
          title: "삭제 실패",
          description: "레슨을 삭제할 수 없습니다.",
          variant: "destructive",
        });
        return;
      }
    }
    setLessons(lessons.filter((_, i) => i !== index));
  };

  const updateLessonData = (index: number, field: keyof LessonFormData, value: any) => {
    const updated = [...lessons];
    updated[index] = { ...updated[index], [field]: value };
    setLessons(updated);
  };

  const handleVideoUpload = async (index: number, file: File) => {
    updateLessonData(index, "video_file", file);
    
    // Create a preview name for the file
    const fileName = file.name;
    toast({
      title: "영상 선택됨",
      description: `${fileName} 파일이 선택되었습니다. 저장 시 업로드됩니다.`,
    });
  };

  const uploadVideoToStorage = async (file: File, courseId: string, lessonIndex: number) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${courseId}/${Date.now()}-${lessonIndex}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from("course-videos")
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    return fileName;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !instructor) {
      toast({
        title: "입력 오류",
        description: "강좌명과 강사명은 필수입니다.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    setUploading(true);

    try {
      // Save or update course
      let savedCourseId = courseId;

      const courseData = {
        title,
        description: description || null,
        instructor,
        price,
        original_price: originalPrice,
        category,
        duration: duration || null,
        thumbnail_url: thumbnailUrl || null,
        is_published: isPublished,
      };

      if (isEditing && courseId) {
        await updateCourse(courseId, courseData);
      } else {
        const newCourse = await createCourse(courseData);
        savedCourseId = newCourse.id;
      }

      // Save lessons
      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];
        let videoUrl = lesson.video_url;

        // Upload video if new file selected
        if (lesson.video_file && savedCourseId) {
          const uploadedPath = await uploadVideoToStorage(lesson.video_file, savedCourseId, i);
          videoUrl = uploadedPath;
        }

        const lessonData = {
          course_id: savedCourseId!,
          title: lesson.title,
          duration: lesson.duration || null,
          is_preview: lesson.is_preview,
          video_url: videoUrl || null,
          order_index: i,
        };

        if (lesson.id && !lesson.isNew) {
          await updateLesson(lesson.id, lessonData);
        } else {
          await createLesson(lessonData);
        }
      }

      toast({
        title: isEditing ? "강좌 수정됨" : "강좌 등록됨",
        description: isEditing
          ? "강좌가 성공적으로 수정되었습니다."
          : "새 강좌가 성공적으로 등록되었습니다.",
      });

      navigate("/admin/courses");
    } catch (error) {
      console.error("저장 실패:", error);
      toast({
        title: "저장 실패",
        description: "강좌를 저장하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (courseLoading || lessonsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/courses")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "강좌 수정" : "새 강좌 등록"}
          </h1>
          <p className="text-muted-foreground">
            강좌 정보와 레슨을 {isEditing ? "수정" : "등록"}합니다.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>강좌 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">강좌명 *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="강좌 제목을 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructor">강사명 *</Label>
                <Input
                  id="instructor"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  placeholder="강사 이름을 입력하세요"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">강좌 설명</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="강좌에 대한 설명을 입력하세요"
                rows={4}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="category">카테고리</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">판매가 *</Label>
                <Input
                  id="price"
                  type="number"
                  value={price || ""}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="89000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">정가</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  value={originalPrice || ""}
                  onChange={(e) => setOriginalPrice(Number(e.target.value) || null)}
                  placeholder="149000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">총 강의 시간</Label>
                <Input
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="32시간"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">썸네일 이미지 URL</Label>
              <Input
                id="thumbnail"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              {thumbnailUrl && (
                <img
                  src={thumbnailUrl}
                  alt="썸네일 미리보기"
                  className="h-24 w-40 object-cover rounded mt-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="published"
                checked={isPublished}
                onCheckedChange={setIsPublished}
              />
              <Label htmlFor="published">강좌 공개</Label>
              {isPublished && (
                <Badge variant="default" className="ml-2">
                  공개됨
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lessons Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>레슨 목록</CardTitle>
            <Button type="button" variant="outline" onClick={addLesson}>
              <Plus className="h-4 w-4 mr-2" />
              레슨 추가
            </Button>
          </CardHeader>
          <CardContent>
            {lessons.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>등록된 레슨이 없습니다.</p>
                <p className="text-sm">레슨 추가 버튼을 클릭하여 영상을 추가하세요.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lessons.map((lesson, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 border rounded-lg bg-secondary/30"
                  >
                    <div className="flex items-center gap-2 pt-2">
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                      <span className="text-sm font-medium text-muted-foreground w-6">
                        {index + 1}
                      </span>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="grid gap-3 md:grid-cols-3">
                        <Input
                          placeholder="레슨 제목"
                          value={lesson.title}
                          onChange={(e) => updateLessonData(index, "title", e.target.value)}
                        />
                        <Input
                          placeholder="영상 시간 (예: 15:30)"
                          value={lesson.duration}
                          onChange={(e) => updateLessonData(index, "duration", e.target.value)}
                        />
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={lesson.is_preview}
                            onCheckedChange={(v) => updateLessonData(index, "is_preview", v)}
                          />
                          <Label className="text-sm">미리보기 허용</Label>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-secondary transition-colors">
                          <Upload className="h-4 w-4" />
                          <span className="text-sm">
                            {lesson.video_file
                              ? lesson.video_file.name
                              : lesson.video_url
                              ? "영상 업로드됨"
                              : "영상 업로드"}
                          </span>
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleVideoUpload(index, file);
                            }}
                          />
                        </label>
                        {(lesson.video_file || lesson.video_url) && (
                          <Badge variant="secondary">
                            <Video className="h-3 w-3 mr-1" />
                            영상 준비됨
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeLesson(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/courses")}
          >
            취소
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {uploading ? "업로드 중..." : "저장 중..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? "수정하기" : "등록하기"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
