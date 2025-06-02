import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";

interface TourImage {
  id: number;
  tourId: number;
  imageUrl: string;
  isFeatured: boolean;
  featured: boolean;
}

interface Tour {
  id: number;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  discountPercent: number;
  createdAt: string;
  schedules: any[];
  images: TourImage[];
}

export default function ImgTourOne() {
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTourId, setSelectedTourId] = useState<number | null>(null);
  const [tours, setTours] = useState<Tour[]>([]);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await fetch("https://anstay.com.vn/api/tours");
        const data = await response.json();
        setTours(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error("Error fetching tours:", error);
      }
    };
    fetchTours();
  }, []);

  const handleOpenUploadModal = (tourId: number) => {
    setSelectedTourId(tourId);
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages((prev) => [...prev, ...filesArray]);

      filesArray.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrls((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleImageSubmit = async () => {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append("images", image); // key phải là "images"
    });
    formData.append("tour_id", selectedTourId?.toString() || "");

    try {
      const response = await fetch("https://anstay.com.vn/api/tour-images", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        setImages([]);
        setPreviewUrls([]);
        setIsModalOpen(false);

        // *** Refetch lại list tour sau khi upload thành công ***
        const toursResponse = await fetch("https://anstay.com.vn/api/tours");
        const data = await toursResponse.json();
        setTours(Array.isArray(data) ? data : [data]);
      }
    } catch (error) {
      console.error("Error uploading images:", error);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      const response = await fetch(
        `https://anstay.com.vn/api/tour-images/${imageId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Refresh tours data after successful deletion
        const toursResponse = await fetch("https://anstay.com.vn/api/tours");
        const data = await toursResponse.json();
        setTours(Array.isArray(data) ? data : [data]);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleToggleFeatured = async (
    imageId: number,
    currentFeatured: boolean
  ) => {
    try {
      const response = await fetch(
        `https://anstay.com.vn/api/tour-images/${imageId}/isFeatured`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isFeatured: !currentFeatured }),
        }
      );

      if (response.ok) {
        // Update state locally instead of fetching from API
        setTours((prevTours) =>
          prevTours.map((tour) => ({
            ...tour,
            images: tour.images.map((img) =>
              img.id === imageId
                ? { ...img, isFeatured: !currentFeatured }
                : img
            ),
          }))
        );
      }
    } catch (error) {
      console.error("Error toggling featured status:", error);
    }
  };

  return (
    <div className="space-y-8 p-4">
      {tours.map((tour, index) => (
        <div key={tour.id} className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              #{index + 1} - {tour.name}
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {tour.images.length} images
              </span>
              <button
                onClick={() => handleOpenUploadModal(tour.id)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Thêm ảnh</span>
              </button>
            </div>
          </div>
        </div>
      ))}

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-4xl bg-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-lg font-medium">
                Thêm ảnh và thông tin
              </Dialog.Title>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                {selectedTourId &&
                  tours
                    .find((t) => t.id === selectedTourId)
                    ?.images.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.imageUrl}
                          alt={`Tour image ${image.id}`}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                          <div className="absolute top-2 right-2 flex gap-2">
                            <button
                              onClick={() =>
                                handleToggleFeatured(image.id, image.isFeatured)
                              }
                              className={`p-1 rounded-full ${
                                image.isFeatured
                                  ? "bg-yellow-500"
                                  : "bg-gray-500"
                              } text-white`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteImage(image.id)}
                              className="p-1 bg-red-500 text-white rounded-full"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
              </div>

              <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="modal-image-upload"
                />
                <label
                  htmlFor="modal-image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <PlusIcon className="w-8 h-8 text-gray-400" />
                  <span className="text-gray-500">Thêm ảnh từ thư viện</span>
                </label>
              </div>

              {previewUrls.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={`preview-${index}`} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setImages((prev) =>
                            prev.filter((_, i) => i !== index)
                          );
                          setPreviewUrls((prev) =>
                            prev.filter((_, i) => i !== index)
                          );
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {previewUrls.length > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={handleImageSubmit}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Lưu ảnh
                  </button>
                </div>
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
