const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

type CloudinaryResourceType = 'image' | 'raw' | 'auto';

const getCloudinaryUrl = (resourceType: CloudinaryResourceType) => {
  if (!cloudName) {
    throw new Error('Missing VITE_CLOUDINARY_CLOUD_NAME');
  }

  return `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
};

const uploadToCloudinary = async (
  file: File,
  options: { resourceType: CloudinaryResourceType; folder: string }
): Promise<string> => {
  if (!uploadPreset) {
    throw new Error('Missing VITE_CLOUDINARY_UPLOAD_PRESET');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', options.folder);

  const response = await fetch(getCloudinaryUrl(options.resourceType), {
    method: 'POST',
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.error?.message || 'Cloudinary upload failed';
    throw new Error(message);
  }

  if (!data?.secure_url) {
    throw new Error('Cloudinary upload did not return a secure URL');
  }

  return data.secure_url;
};

export const uploadImage = async (file: File): Promise<string> => {
  return uploadToCloudinary(file, {
    resourceType: 'image',
    folder: 'interview-platform/hiring-posts',
  });
};

export const uploadResume = async (file: File): Promise<string> => {
  return uploadToCloudinary(file, {
    resourceType: 'raw',
    folder: 'interview-platform/resumes',
  });
};
