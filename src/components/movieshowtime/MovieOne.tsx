import { Tab } from "@headlessui/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Dialog } from "@headlessui/react";
import React, { useEffect, useState } from "react";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";
import { Select as AntSelect, Space, DatePicker, Pagination } from "antd";
import dayjs from "dayjs";

interface Showtime {
  id?: number;
  startTime: string;
  endTime: string;
  roomId: number;
  price: number;
}

// Update Movie interface to only use genre IDs
interface Movie {
  id: number;
  title: string;
  originalTitle?: string | null;
  trailerUrl?: string | null;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  duration: number;
  description?: string | null;
  shortDescription?: string | null;
  director?: string | null;
  cast?: string | null;
  productionCompany?: string | null;
  productionCountry?: string | null;
  releaseDate: string;
  endDate?: string | null;
  ageRating: "P" | "C13" | "C16" | "C18"; // Changed to match enum values
  language?: string | null;
  subtitles?: string | null;
  rating: number;
  ratingCount: number;
  status: "COMING_SOON" | "NOW_SHOWING" | "ENDED"; // Update to match backend enum
  genres: number[]; // Change to array of IDs only
  showtimes: Showtime[];
}

// Add this interface near the top with other interfaces
interface Genre {
  id: number;
  name: string;
}

const formTabs = [
  { name: "Thông tin cơ bản", icon: "info" },
  { name: "Chi tiết sản xuất", icon: "film" },
  { name: "Nội dung & Media", icon: "description" },
];

interface MovieCategory {
  id?: number;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export default function MovieOne() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenreModalOpen, setIsGenreModalOpen] = useState(false);
  // Update initial state
  const [newMovie, setNewMovie] = useState<Partial<Movie>>({
    status: "COMING_SOON",
    ageRating: "P", // Set default to P
    genres: [], // This remains an empty array, but now it's an array of numbers
  });
  const [newGenre, setNewGenre] = useState({ name: "" });
  const [newCategory, setNewCategory] = useState<
    Omit<MovieCategory, "id" | "created_at" | "updated_at">
  >({
    name: "",
    description: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  // Update age rating options to match backend enum descriptions
  const ageRatingOptions = [
    { value: "P", label: "P - Phim dành cho mọi lứa tuổi" },
    { value: "C13", label: "C13 - Cấm khán giả dưới 13 tuổi" },
    { value: "C16", label: "C16 - Cấm khán giả dưới 16 tuổi" },
    { value: "C18", label: "C18 - Cấm khán giả dưới 18 tuổi" },
  ];

  // Update status options to match backend enum
  const statusOptions = [
    { value: "COMING_SOON", label: "Sắp chiếu" },
    { value: "NOW_SHOWING", label: "Đang chiếu" },
    { value: "ENDED", label: "Đã kết thúc" },
  ];

  const countryOptions = [
    { value: "US", label: "Mỹ" },
    { value: "KR", label: "Hàn Quốc" },
    { value: "JP", label: "Nhật Bản" },
    { value: "VN", label: "Việt Nam" },
    { value: "GB", label: "Anh" },
  ];

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8085/api/movies/all?pageNo=${pagination.current - 1}&pageSize=${pagination.pageSize}&sortBy=title&sortDir=asc`
      );
      
      if (!response.ok) throw new Error('Failed to fetch movies');
      const data = await response.json();
      setMovies(data.content || []);
      setPagination(prev => ({
        ...prev,
        total: data.totalElements || 0
      }));
    } catch (error) {
      console.error('Error fetching movies:', error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  // Update fetchMovieDetails to format genres as array of IDs
  const fetchMovieDetails = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8085/api/movies/all/${id}`);
      if (!response.ok) throw new Error('Failed to fetch movie details');
      const data = await response.json();
      const formattedData = {
        ...data,
        genres: data.genres?.map((g: any) => g.id) || [] // Only keep the IDs
      };
      setNewMovie(formattedData);
      setIsEditing(true);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [pagination.current, pagination.pageSize]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const url = isEditing 
      ? `http://localhost:8085/api/movies/all/${newMovie.id}`
      : 'http://localhost:8085/api/movies/create';
      
    try {
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMovie)
      });
  
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      setIsModalOpen(false);
      setIsEditing(false);
      setNewMovie({ 
        status: 'COMING_SOON', 
        ageRating: 'P',
        genres: [] // Make sure to reset genres array
      });
      fetchMovies();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleGenreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8085/api/genres/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGenre)
      });

      if (!response.ok) throw new Error('Failed to create genre');
      
      // Refresh genres list
      await fetchGenres();
      setIsGenreModalOpen(false);
      setNewGenre({ name: '' });
    } catch (error) {
      console.error('Error creating genre:', error);
    }
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit new category:", newCategory);
    setIsGenreModalOpen(false);
    setNewCategory({ name: "", description: "" });
  };

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genreOptions, setGenreOptions] = useState<Array<{value: number, label: string}>>([]);
  const [genres, setGenres] = useState<Genre[]>([]);

  // Add this function to fetch genres
  const fetchGenres = async () => {
    try {
      const response = await fetch('http://localhost:8085/api/genres');
      if (!response.ok) throw new Error('Failed to fetch genres');
      const data: Genre[] = await response.json();
      setGenreOptions(data.map(genre => ({
        value: genre.id,
        label: genre.name
      })));
      setGenres(data); // Add this line
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  // Add useEffect to fetch genres when component mounts
  useEffect(() => {
    fetchGenres();
  }, []);

  const handlePaginationChange = (page: number, pageSize?: number) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize
    }));
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="p-4 flex items-center justify-end gap-4 border-b border-gray-200 dark:border-white/[0.05]">
        <div className="w-64">
          <Input
            type="text"
            placeholder="Tìm kiếm phim..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Thêm phim mới</span>
        </button>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1400px]">
          {" "}
          {/* Increased minimum width */}
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {/* Fixed Columns */}
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 sticky left-0 bg-white dark:bg-gray-800 z-20"
                >
                  STT
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 sticky left-[50px] bg-white dark:bg-gray-800 z-20"
                >
                  Tên phim
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 sticky left-[250px] bg-white dark:bg-gray-800 z-20"
                >
                  Thể loại
                </TableCell>
                {/* Scrollable Columns */}
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Thời lượng
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Quốc gia
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Đạo diễn
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Diễn viên
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Độ tuổi
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Ngày chiếu
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Trạng thái
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-4">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : movies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-4">
                    Không có dữ liệu phim
                  </TableCell>
                </TableRow>
              ) : (
                movies.map((movie, index) => (
                  <TableRow key={movie.id}>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400 sticky left-0 bg-white dark:bg-gray-800 z-10">
                      {index + 1}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 text-theme-sm dark:text-white/90 sticky left-[50px] bg-white dark:bg-gray-800 z-10">
                      {movie.title}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 sticky left-[250px] bg-white dark:bg-gray-800 z-10">
                      {movie.genres.map((genreId) => genreOptions.find(g => g.value === genreId)?.label).join(", ")}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {movie.duration} phút
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {movie.productionCountry}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {movie.director || "Chưa cập nhật"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {movie.cast || "Chưa cập nhật"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Badge size="sm" color="primary">
                        {ageRatingOptions.find(opt => opt.value === movie.ageRating)?.label || movie.ageRating}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {dayjs(movie.releaseDate).format("DD/MM/YYYY")}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge
                        size="sm"
                        color={
                          movie.status === "NOW_SHOWING"
                            ? "success"
                            : movie.status === "COMING_SOON"
                            ? "warning"
                            : "error"
                        }
                      >
                        {statusOptions.find(opt => opt.value === movie.status)?.label || movie.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => fetchMovieDetails(movie.id)}
                          className="p-1 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => console.log("Delete:", movie.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="p-4 flex justify-end border-t border-gray-200">
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          showTotal={(total, range) => `${range[0]}-${range[1]} trên ${total} phim`}
          onChange={handlePaginationChange}
          onShowSizeChange={handlePaginationChange}
          showSizeChanger
          defaultPageSize={10}
          pageSizeOptions={['10', '20', '50']}
        />
      </div>

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-2xl w-full rounded-lg bg-white p-6 dark:bg-gray-800">
            <Dialog.Title className="text-lg font-medium mb-4">
              {isEditing ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
            </Dialog.Title>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
                <Tab.List className="flex space-x-2 rounded-xl bg-gray-100 p-1">
                  {formTabs.map((tab) => (
                    <Tab
                      key={tab.name}
                      className={({ selected }) =>
                        `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                         ${
                           selected
                             ? "bg-white text-blue-600 shadow"
                             : "text-gray-600 hover:text-gray-800"
                         }`
                      }
                    >
                      {tab.name}
                    </Tab>
                  ))}
                </Tab.List>

                <Tab.Panels className="mt-4">
                  {/* Basic Info Panel */}
                  <Tab.Panel className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Tên phim*</Label>
                        <Input
                          type="text"
                          id="title"
                          required
                          value={newMovie.title || ""}
                          onChange={(e) =>
                            setNewMovie({ ...newMovie, title: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>Thể loại*</Label>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <AntSelect
                              mode="multiple"
                              style={{ width: "100%", height: "40px" }}
                              dropdownStyle={{ minWidth: "200px" }}
                              className="rounded-lg border border-gray-300"
                              placeholder="Chọn thể loại"
                              value={newMovie.genres || []}
                              onChange={(values: number[]) =>
                                setNewMovie({
                                  ...newMovie,
                                  genres: values // Just use the IDs directly
                                })
                              }
                              options={genreOptions}
                              optionRender={(option) => (
                                <Space>
                                  {option.data.label}
                                  <span className="text-gray-500 text-sm">
                                    {option.data.desc}
                                  </span>
                                </Space>
                              )}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsGenreModalOpen(true)}
                            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                          >
                            <PlusIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="duration">Thời lượng (phút)*</Label>
                        <Input
                          type="number"
                          id="duration"
                          required
                          value={newMovie.duration || ""}
                          onChange={(e) =>
                            setNewMovie({
                              ...newMovie,
                              duration: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Quốc gia*</Label>
                        <Select
                          options={countryOptions}
                          value={newMovie.country}
                          onChange={(value) =>
                            setNewMovie({ ...newMovie, country: value })
                          }
                          placeholder="Chọn quốc gia"
                        />
                      </div>
                      <div>
                        <Label>Giới hạn độ tuổi*</Label>
                        <Select
                          options={ageRatingOptions}
                          value={newMovie.ageRating || "P"}
                          onChange={(value) =>
                            setNewMovie({
                              ...newMovie,
                              ageRating: value as Movie["ageRating"],
                            })
                          }
                          placeholder="Chọn giới hạn độ tuổi"
                        />
                      </div>
                      <div>
                        <Label>Trạng thái</Label>
                        <Select
                          options={statusOptions}
                          value={newMovie.status}
                          onChange={(value) =>
                            setNewMovie({
                              ...newMovie,
                              status: value as Movie["status"],
                            })
                          }
                          placeholder="Chọn trạng thái"
                        />
                      </div>
                    </div>
                  </Tab.Panel>

                  {/* Production Details Panel */}
                  <Tab.Panel className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="director">Đạo diễn</Label>
                        <Input
                          type="text"
                          id="director"
                          value={newMovie.director || ""}
                          onChange={(e) =>
                            setNewMovie({
                              ...newMovie,
                              director: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="cast">Diễn viên</Label>
                        <Input
                          type="text"
                          id="cast"
                          value={newMovie.cast || ""}
                          onChange={(e) =>
                            setNewMovie({ ...newMovie, cast: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="releaseDate">Ngày khởi chiếu*</Label>
                        <DatePicker
                          style={{ width: "100%", height: "40px" }}
                          format="YYYY-MM-DD"
                          placeholder="Chọn ngày khởi chiếu"
                          value={
                            newMovie.releaseDate
                              ? dayjs(newMovie.releaseDate)
                              : null
                          }
                          onChange={(date, dateString) =>
                            setNewMovie({
                              ...newMovie,
                              releaseDate: dateString,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">Ngày kết thúc</Label>
                        <DatePicker
                          style={{ width: "100%", height: "40px" }}
                          format="YYYY-MM-DD"
                          placeholder="Chọn ngày kết thúc"
                          value={
                            newMovie.endDate
                              ? dayjs(newMovie.endDate)
                              : null
                          }
                          onChange={(date, dateString) =>
                            setNewMovie({
                              ...newMovie,
                              endDate: dateString,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="trailerUrl">Đường dẫn Trailer</Label>
                        <Input
                          type="url"
                          id="trailerUrl"
                          value={newMovie.trailerUrl || ""}
                          onChange={(e) =>
                            setNewMovie({
                              ...newMovie,
                              trailerUrl: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </Tab.Panel>

                  {/* Content & Media Panel */}
                  <Tab.Panel className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="description">Mô tả</Label>
                        <textarea
                          id="description"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 transition-all duration-200"
                          rows={3}
                          placeholder="Nhập mô tả phim"
                          value={newMovie.description || ""}
                          onChange={(e) =>
                            setNewMovie({
                              ...newMovie,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="synopsis">Nội dung phim</Label>
                        <textarea
                          id="synopsis"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 transition-all duration-200"
                          rows={4}
                          placeholder="Nhập nội dung phim"
                          value={newMovie.synopsis || ""}
                          onChange={(e) =>
                            setNewMovie({
                              ...newMovie,
                              synopsis: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="posterUrl">Đường dẫn Poster</Label>
                        <Input
                          type="url"
                          id="posterUrl"
                          value={newMovie.posterUrl || ""}
                          onChange={(e) =>
                            setNewMovie({
                              ...newMovie,
                              posterUrl: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Lưu
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Add Genre Modal */}
      <Dialog
        open={isGenreModalOpen}
        onClose={() => setIsGenreModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md w-full rounded-lg bg-white p-6 dark:bg-gray-800">
            <Dialog.Title className="text-lg font-medium mb-4">
              Thêm thể loại phim
            </Dialog.Title>

            {/* Genre List */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Danh sách thể loại hiện tại:</h3>
              <div className="max-h-40 overflow-y-auto border rounded-lg divide-y">
                {genres.map((genre) => (
                  <div key={genre.id} className="px-3 py-2 text-sm flex items-center justify-between">
                    <span>{genre.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Genre Form */}
            <form onSubmit={handleGenreSubmit} className="space-y-4">
              <div>
                <Label htmlFor="genreName">Tên thể loại mới*</Label>
                <Input
                  type="text"
                  id="genreName"
                  required
                  maxLength={50}
                  placeholder="Nhập tên thể loại"
                  value={newGenre.name}
                  onChange={(e) =>
                    setNewGenre({ ...newGenre, name: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsGenreModalOpen(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Thêm
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
