import { useEffect, useState } from 'react';

import Section from '../../../../components/ui/Section';

export default function ProductImageSection({ images, onChange, errors = {} }) {
  const setImage = (type, file) => {
    onChange((current) => ({
      ...current,
      [type]: file,
    }));
  };

  const addSecondaryImages = (files) => {
    onChange((current) => ({
      ...current,
      secondary: [...current.secondary, ...files],
    }));
  };

  const removeSecondary = (index) => {
    onChange((current) => ({
      ...current,
      secondary: current.secondary.filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  return (
    <Section
      title="PRODUCT IMAGES"
      description="Upload product imagery"
      contentClassName="space-y-7 p-5 sm:p-6 md:p-7"
    >
      <ImageUpload
        label="PRIMARY IMAGE"
        description="Main product image"
        file={images.primary}
        onChange={(file) => setImage('primary', file)}
        required
        error={errors.primaryImage}
      />

      <ImageUpload
        label="DETAIL IMAGE"
        description="Secondary detail view"
        file={images.detail}
        onChange={(file) => setImage('detail', file)}
        required
        error={errors.detailImage}
      />

      <SecondaryImages
        files={images.secondary}
        onAdd={addSecondaryImages}
        onRemove={removeSecondary}
      />
    </Section>
  );
}

function ImageUpload({ label, description, file, onChange, required, error }) {
  const previewUrl = useObjectUrl(file);

  return (
    <div>
      <p className="font-label-caps text-text-muted">
        {label}

        {required && <span className="text-error ml-1">*</span>}
      </p>

      <p className="font-technical-data text-text-muted mt-1">{description}</p>

      <label
        className={`bg-surface-container-low hover:bg-surface-container mt-3 block cursor-pointer border border-dashed transition-colors ${error ? 'border-error' : 'border-border-subtle'} `}
      >
        {file ? (
          <div className="flex items-center gap-4 p-4">
            {previewUrl ? (
              <img src={previewUrl} alt={file.name} className="h-20 w-16 shrink-0 object-cover" />
            ) : (
              <div className="bg-surface-container h-20 w-16 shrink-0" />
            )}

            <div className="min-w-0">
              <p className="font-label-caps text-primary truncate">{file.name}</p>

              <p className="font-technical-data text-text-muted mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>

              <p className="font-label-caps text-text-muted mt-2">CLICK TO REPLACE</p>
            </div>
          </div>
        ) : (
          <div className="flex min-h-32 flex-col items-center justify-center px-4 py-6 text-center">
            <span className="material-symbols-outlined text-text-muted !text-[28px]">
              cloud_upload
            </span>

            <p className="font-label-caps text-primary mt-2">UPLOAD IMAGE</p>

            <p className="font-technical-data text-text-muted mt-1">Click to select an image</p>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              onChange(file);
            }

            event.target.value = '';
          }}
        />
      </label>

      {error && <p className="font-technical-data text-error mt-2">{error}</p>}
    </div>
  );
}

function SecondaryImages({ files, onAdd, onRemove }) {
  return (
    <div>
      <p className="font-label-caps text-text-muted">SECONDARY IMAGES</p>

      <p className="font-technical-data text-text-muted mt-1">Additional product images</p>

      <label className="border-border-subtle bg-surface-container-low hover:border-primary hover:bg-surface-container mt-3 flex min-h-32 cursor-pointer items-center justify-center border border-dashed px-4 py-6 text-center transition-colors">
        <div>
          <span className="material-symbols-outlined text-text-muted !text-[28px]">
            add_photo_alternate
          </span>

          <p className="font-label-caps text-primary mt-2">ADD IMAGES</p>

          <p className="font-technical-data text-text-muted mt-1">Select multiple images</p>
        </div>

        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);

            if (files.length) {
              onAdd(files);
            }

            event.target.value = '';
          }}
        />
      </label>

      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {files.map((file, index) => (
            <UploadedImage
              key={`${file.name}-${index}`}
              file={file}
              label={`SECONDARY ${index + 1}`}
              onRemove={() => onRemove(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function UploadedImage({ file, label, onRemove }) {
  const previewUrl = useObjectUrl(file);

  return (
    <div className="relative">
      {previewUrl ? (
        <img src={previewUrl} alt={file.name} className="aspect-[3/4] w-full object-cover" />
      ) : (
        <div className="bg-surface-container aspect-[3/4] w-full" />
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/70 px-2 py-2">
        <span className="font-label-caps truncate text-white">{label}</span>

        <button
          type="button"
          onClick={onRemove}
          className="text-white transition-colors hover:text-gray-300"
          aria-label={`Remove ${label}`}
        >
          <span className="material-symbols-outlined !text-[16px]">close</span>
        </button>
      </div>
    </div>
  );
}

function useObjectUrl(file) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (!file) {
      setUrl('');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return url;
}
