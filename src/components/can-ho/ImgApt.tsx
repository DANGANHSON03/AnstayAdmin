import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";

interface ApartmentImage {
  id: number;
  apartmentId: number;
  imageUrl: string;
  featured: boolean;
}

interface Owner {
  id: number;
  name: string;
  phone: string | null;
  email: string;
  address: string | null;
}

interface Apartment {
  id: number;
  name: string;
  location: string;
  ownerId: number;
  pricePerDay: number;
  pricePerMonth: number;
  discountPercent: number;
  description: string;
  maxAdults: number;
  maxChildren: number;
  numRooms: number;
  status: string;
  owners: Owner[];
  images: ApartmentImage[];
}

export default function ImgApt() {
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTourId, setSelectedTourId] = useState<number | null>(null);
  const [apartments, setApartments] = useState<Apartment[]>([]);

  const fetchApartments = async () => {
    try {
      const response = await fetch("https://anstay.com.vn/api/apartments");
      if (response.ok) {
        const data = await response.json();
        setApartments(data);
      }
    } catch (error) {
      console.error("Error fetching apartments:", error);
    }
  };

  useEffect(() => {
    fetchApartments();
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
      formData.append("images", image);
    });
    formData.append("apartmentId", selectedTourId?.toString() || "");

    try {
      const response = await fetch(
        "https://anstay.com.vn/api/apartment-images",
        {
          method: "POST",
          body: formData,
        }
      );
      if (response.ok) {
        setImages([]);
        setPreviewUrls([]);
        setIsModalOpen(false);

        // REFRESH lại apartments để cập nhật ảnh mới!
        await fetchApartments();
      }
    } catch (error) {
      console.error("Error uploading images:", error);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      const response = await fetch(
        `https://anstay.com.vn/api/apartment-images/${imageId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Refresh the apartments data after successful deletion
        await fetchApartments();
      } else {
        console.error("Failed to delete image:", await response.text());
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  return (
    <div className="space-y-8 p-4">
      {apartments.map((apartment, index) => (
        <div key={apartment.id} className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              #{index + 1} - {apartment.name}
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {apartment.images.length} images
              </span>
              <button
                onClick={() => handleOpenUploadModal(apartment.id)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Manage Images</span>
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
                Manage Tour Images
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
                  apartments
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
                              className={`p-1 rounded-full ${
                                image.featured ? "bg-yellow-500" : "bg-gray-500"
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
                  <span className="text-gray-500">Add More Images</span>
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
                    Save Changes
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
