import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import gsap from 'gsap';
// 👉 1. Import our new TanStack hooks
import { useGetBanner, useUpdateBanner } from '../hooks/useBanners';

const EditBanner = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 👉 2. Initialize TanStack Queries & Mutations
  const { data: banner, isLoading: isFetching } = useGetBanner(id);
  const { mutateAsync: updateBanner, isPending: isUpdating } = useUpdateBanner();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null); // Tracks NEW uploaded files

  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  // 👉 3. Pre-fill data when the query finishes loading
  useEffect(() => {
    if (banner) {
      setTitle(banner.title);
      setSubtitle(banner.subtitle || '');
      setImagePreview(banner.image?.url); // Use existing image URL as preview

      // Trigger GSAP animation only AFTER data is loaded and injected
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
  }, [banner]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); // Save the actual file for the API payload

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Show new preview
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !imagePreview) return; // Basic validation

    // 👉 4. Construct FormData
    const formData = new FormData();
    formData.append('title', title);
    if (subtitle) formData.append('subtitle', subtitle);

    // ONLY append the image if the user actually selected a NEW file!
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      await updateBanner({ id, formData });
      navigate('/banners');
    } catch (error) {
      console.error(error);
    }
  };

  // 👉 5. Show loading spinner while fetching the banner data
  if (isFetching) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-6 md:p-margin-page max-w-container-max mx-auto w-full">
      <div className="mb-stack-lg">
        <button
          onClick={() => navigate('/banners')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md mb-4 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Banners
        </button>
        <h2 className="font-heading text-headline-lg text-on-surface mb-2">Edit Banner</h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
          Update the visual or messaging for this banner. Ensure your imagery reflects the tactile warmth and premium quality of our handcrafted candles.
        </p>
      </div>

      <div ref={containerRef} className="flex flex-col lg:flex-row gap-8 opacity-0">
        {/* Sidebar - Artisanal Visuals */}
        <div className="w-full lg:w-[320px] bg-surface-container-low rounded-2xl p-8 border border-surface-container self-start">
          <h2 className="text-[24px] font-heading font-bold text-primary mb-4">Artisanal Visuals</h2>
          <p className="text-on-surface-variant leading-relaxed mb-8 font-body-md">
            Banners are the heartbeat of Lumière. Maintain clear space for the text overlay.
          </p>

          <ul className="space-y-6">
            <li className="flex gap-3 items-start">
              <span className="material-symbols-outlined text-primary shrink-0 mt-0.5 text-[20px]">check_circle</span>
              <span className="text-on-surface font-label-md leading-tight">Use high-resolution photography with natural lighting.</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="material-symbols-outlined text-primary shrink-0 mt-0.5 text-[20px]">check_circle</span>
              <span className="text-on-surface font-label-md leading-tight">Maintain clear space for the text overlay.</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="material-symbols-outlined text-primary shrink-0 mt-0.5 text-[20px]">check_circle</span>
              <span className="text-on-surface font-label-md leading-tight">Subtitles should offer a gentle call to action.</span>
            </li>
          </ul>
        </div>

        {/* Main Form Area */}
        <div className="flex-1 bg-surface-container-lowest rounded-2xl p-6 sm:p-10 border border-surface-container shadow-sm shadow-amber-900/5">
          <form onSubmit={handleSubmit} className="space-y-10">

            {/* Banner Image Upload */}
            <div className="space-y-3">
              <label className="block text-[11px] font-bold text-on-surface-variant tracking-widest uppercase">
                Banner Image *
              </label>
              <div
                onClick={handleUploadClick}
                className={`relative w-full aspect-[16/9] sm:aspect-[2.5/1] rounded-xl border-2 border-dashed ${imagePreview ? 'border-primary' : 'border-outline-variant'} bg-surface-container-low flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container hover:border-primary transition-all group overflow-hidden ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}
                style={{ backgroundImage: imagePreview ? `url(${imagePreview})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                {!imagePreview && (
                  <div className="flex flex-col items-center text-center p-6">
                    <div className="w-16 h-16 bg-surface-container-lowest rounded-full flex items-center justify-center mb-5 text-primary shadow-sm">
                      <div className="relative">
                        <span className="material-symbols-outlined text-[28px]">image</span>
                        <div className="absolute -top-1 -right-1 bg-surface-container-lowest rounded-full p-0.5 border border-surface-container">
                          <span className="material-symbols-outlined text-[14px]">add</span>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xl font-heading font-bold text-on-surface mb-1">Click to Upload</h3>
                    <p className="text-on-surface-variant mb-6 text-sm">The banner image will appear here</p>
                    <span className="px-4 py-1.5 bg-surface-variant rounded-full text-[11px] font-bold text-on-surface-variant">
                      1920 x 1080px (Recommended)
                    </span>
                  </div>
                )}
                {imagePreview && !isUpdating && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-surface-container-lowest text-primary px-4 py-2 rounded-lg font-label-md shadow-lg flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      Change Image
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  disabled={isUpdating}
                />
              </div>
            </div>

            {/* Title Field */}
            <div className="space-y-3">
              <label className="block text-[11px] font-bold text-on-surface-variant tracking-widest uppercase">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Artisanal Autumn Glow"
                disabled={isUpdating}
                className="w-full px-6 py-4 rounded-xl border border-surface-variant bg-surface-container-lowest text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-on-surface-variant/50 transition-all shadow-sm disabled:opacity-50"
              />
            </div>

            {/* Sub Title Field */}
            <div className="space-y-3">
              <label className="block text-[11px] font-bold text-on-surface-variant tracking-widest uppercase">
                Sub Title
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Discover our limited edition seasonal scents"
                disabled={isUpdating}
                className="w-full px-6 py-4 rounded-xl border border-surface-variant bg-surface-container-lowest text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-on-surface-variant/50 transition-all shadow-sm disabled:opacity-50"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-4 border-t border-surface-container border-dashed">
              <button
                type="button"
                onClick={() => navigate('/banners')}
                disabled={isUpdating}
                className="w-full sm:w-auto px-8 py-3.5 border border-surface-variant text-on-surface-variant font-label-md rounded-xl hover:bg-surface-container hover:text-on-surface transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title || !imagePreview || isUpdating}
                className="w-full sm:w-auto px-8 py-3.5 bg-primary text-on-primary font-label-md rounded-xl flex items-center justify-center gap-2 hover:bg-primary-container transition-all shadow-sm shadow-amber-900/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {isUpdating ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-on-primary"></div>
                ) : (
                  <span className="material-symbols-outlined text-[20px]">save</span>
                )}
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default EditBanner;