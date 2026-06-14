import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import gsap from 'gsap';
// 👉 1. Import our new TanStack hooks
import { useGetBanner, useUpdateBanner } from '../hooks/useBanners';

import { ArrowLeft, CheckCircle2, Image, Plus, Pencil, Save } from 'lucide-react';

const EditBanner = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 👉 2. Initialize TanStack Queries & Mutations
  const { data: banner, isLoading: isFetching } = useGetBanner(id);
  const { mutateAsync: updateBanner, isPending: isUpdating } = useUpdateBanner();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [desktopPreview, setDesktopPreview] = useState(null);
  const [mobilePreview, setMobilePreview] = useState(null);
  const [desktopFile, setDesktopFile] = useState(null); // Tracks NEW uploaded files
  const [mobileFile, setMobileFile] = useState(null); // Tracks NEW uploaded files

  const desktopInputRef = useRef(null);
  const mobileInputRef = useRef(null);
  const containerRef = useRef(null);

  // 👉 3. Pre-fill data when the query finishes loading
  useEffect(() => {
    if (banner) {
      setTitle(banner.title);
      setSubtitle(banner.subtitle || '');
      setDesktopPreview(banner.desktopImage?.url);
      setMobilePreview(banner.mobileImage?.url);

      // Trigger GSAP animation only AFTER data is loaded and injected
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
  }, [banner]);

  const handleDesktopFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDesktopFile(file); // Save the actual file for the API payload
      const reader = new FileReader();
      reader.onloadend = () => setDesktopPreview(reader.result); // Show new preview
      reader.readAsDataURL(file);
    }
  };

  const handleMobileFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMobileFile(file); // Save the actual file for the API payload
      const reader = new FileReader();
      reader.onloadend = () => setMobilePreview(reader.result); // Show new preview
      reader.readAsDataURL(file);
    }
  };

  const handleDesktopUploadClick = () => desktopInputRef.current?.click();
  const handleMobileUploadClick = () => mobileInputRef.current?.click();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !desktopPreview || !mobilePreview) return; // Basic validation

    // 👉 4. Construct FormData
    const formData = new FormData();
    formData.append('title', title);
    if (subtitle) formData.append('subtitle', subtitle);

    // ONLY append the image if the user actually selected a NEW file!
    if (desktopFile) {
      formData.append('desktopImage', desktopFile);
    }
    if (mobileFile) {
      formData.append('mobileImage', mobileFile);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-6 md:p-margin-page max-w-container-max mx-auto w-full">
      <div className="mb-stack-lg">
        <button
          onClick={() => navigate('/banners')}
          className="flex items-center gap-2 text-text-muted hover:text-brand-primary transition-colors font-label-md text-label-md mb-4 cursor-pointer"
        >
          <ArrowLeft className=" text-[20px]" />
          Back to Banners
        </button>
        <h2 className="font-heading text-headline-lg text-text-base mb-2">Edit Banner</h2>
        <p className="font-body-md text-body-md text-text-muted max-w-2xl">
          Update the visual or messaging for this banner. Ensure your imagery reflects the tactile warmth and premium quality of our handcrafted candles.
        </p>
      </div>

      <div ref={containerRef} className="flex flex-col lg:flex-row gap-8 opacity-0">
        {/* Sidebar - Artisanal Visuals */}
        <div className="w-full lg:w-[320px] bg-bg-canvas rounded-2xl p-8 border border-bg-muted self-start">
          <h2 className="text-[24px] font-heading font-bold text-brand-primary mb-4">Artisanal Visuals</h2>
          <p className="text-text-muted leading-relaxed mb-8 font-body-md">
            Banners are the heartbeat of Lumière. Maintain clear space for the text overlay.
          </p>

          <ul className="space-y-6">
            <li className="flex gap-3 items-start">
              <CheckCircle2 className=" text-brand-primary shrink-0 mt-0.5 text-[20px]" />
              <span className="text-text-base font-label-md leading-tight">Use high-resolution photography with natural lighting.</span>
            </li>
            <li className="flex gap-3 items-start">
              <CheckCircle2 className=" text-brand-primary shrink-0 mt-0.5 text-[20px]" />
              <span className="text-text-base font-label-md leading-tight">Maintain clear space for the text overlay.</span>
            </li>
            <li className="flex gap-3 items-start">
              <CheckCircle2 className=" text-brand-primary shrink-0 mt-0.5 text-[20px]" />
              <span className="text-text-base font-label-md leading-tight">Subtitles should offer a gentle call to action.</span>
            </li>
          </ul>
        </div>

        {/* Main Form Area */}
        <div className="flex-1 bg-bg-surface rounded-2xl p-6 sm:p-10 border border-bg-muted shadow-sm shadow-orange-900/5">
          <form onSubmit={handleSubmit} className="space-y-10">

            {/* Banner Image Uploads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Desktop Banner Image */}
              <div className="space-y-3">
                <label className="block text-[11px] font-bold text-text-muted tracking-widest uppercase">
                  Desktop Banner (16:9) *
                </label>
                <div
                  onClick={handleDesktopUploadClick}
                  className={`relative w-full aspect-[16/9] rounded-xl border-2 border-dashed ${desktopPreview ? 'border-brand-primary' : 'border-bg-muted'} bg-bg-canvas flex flex-col items-center justify-center cursor-pointer hover:bg-bg-muted hover:border-brand-primary transition-all group overflow-hidden ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}
                  style={{ backgroundImage: desktopPreview ? `url(${desktopPreview})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  {!desktopPreview && (
                    <div className="flex flex-col items-center text-center p-6">
                      <div className="w-16 h-16 bg-bg-surface rounded-full flex items-center justify-center mb-5 text-brand-primary shadow-sm">
                        <div className="relative">
                          <Image className=" text-[28px]" />
                          <div className="absolute -top-1 -right-1 bg-bg-surface rounded-full p-0.5 border border-bg-muted">
                            <Plus className=" text-[14px]" />
                          </div>
                        </div>
                      </div>
                      <h3 className="text-xl font-heading font-bold text-text-base mb-1">Upload Desktop</h3>
                      <span className="px-4 py-1.5 bg-bg-muted rounded-full text-[11px] font-bold text-text-muted">
                        1920 x 1080px (Recommended)
                      </span>
                    </div>
                  )}
                  {desktopPreview && !isUpdating && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-bg-surface text-brand-primary px-4 py-2 rounded-lg font-label-md shadow-lg flex items-center gap-2">
                        <Pencil className=" text-[18px]" />
                        Change Desktop
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={desktopInputRef}
                    onChange={handleDesktopFileChange}
                    accept="image/*"
                    className="hidden"
                    disabled={isUpdating}
                  />
                </div>
              </div>

              {/* Mobile Banner Image */}
              <div className="space-y-3">
                <label className="block text-[11px] font-bold text-text-muted tracking-widest uppercase">
                  Mobile Banner (3:4) *
                </label>
                <div
                  onClick={handleMobileUploadClick}
                  className={`relative w-full aspect-[4/5] sm:aspect-[4/5] rounded-xl border-2 border-dashed ${mobilePreview ? 'border-brand-primary' : 'border-bg-muted'} bg-bg-canvas flex flex-col items-center justify-center cursor-pointer hover:bg-bg-muted hover:border-brand-primary transition-all group overflow-hidden ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}
                  style={{ backgroundImage: mobilePreview ? `url(${mobilePreview})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  {!mobilePreview && (
                    <div className="flex flex-col items-center text-center p-6">
                      <div className="w-16 h-16 bg-bg-surface rounded-full flex items-center justify-center mb-5 text-brand-primary shadow-sm">
                        <div className="relative">
                          <Image className=" text-[28px]" />
                          <div className="absolute -top-1 -right-1 bg-bg-surface rounded-full p-0.5 border border-bg-muted">
                            <Plus className=" text-[14px]" />
                          </div>
                        </div>
                      </div>
                      <h3 className="text-xl font-heading font-bold text-text-base mb-1">Upload Mobile</h3>
                      <span className="px-4 py-1.5 bg-bg-muted rounded-full text-[11px] font-bold text-text-muted">
                        1080 x 1350px (Recommended)
                      </span>
                    </div>
                  )}
                  {mobilePreview && !isUpdating && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-bg-surface text-brand-primary px-4 py-2 rounded-lg font-label-md shadow-lg flex items-center gap-2">
                        <Pencil className=" text-[18px]" />
                        Change Mobile
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={mobileInputRef}
                    onChange={handleMobileFileChange}
                    accept="image/*"
                    className="hidden"
                    disabled={isUpdating}
                  />
                </div>
              </div>
            </div>

            {/* Title Field */}
            <div className="space-y-3">
              <label className="block text-[11px] font-bold text-text-muted tracking-widest uppercase">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Artisanal Autumn Glow"
                disabled={isUpdating}
                className="w-full px-6 py-4 rounded-xl border border-bg-muted bg-bg-surface text-text-base font-body-md focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary placeholder:text-text-muted/50 transition-all shadow-sm disabled:opacity-50"
              />
            </div>

            {/* Sub Title Field */}
            <div className="space-y-3">
              <label className="block text-[11px] font-bold text-text-muted tracking-widest uppercase">
                Sub Title
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Discover our limited edition seasonal scents"
                disabled={isUpdating}
                className="w-full px-6 py-4 rounded-xl border border-bg-muted bg-bg-surface text-text-base font-body-md focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary placeholder:text-text-muted/50 transition-all shadow-sm disabled:opacity-50"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-4 border-t border-bg-muted border-dashed">
              <button
                type="button"
                onClick={() => navigate('/banners')}
                disabled={isUpdating}
                className="w-full sm:w-auto px-8 py-3.5 border border-bg-muted text-text-muted font-label-md rounded-xl hover:bg-bg-muted hover:text-text-base transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title || !desktopPreview || !mobilePreview || isUpdating}
                className="w-full sm:w-auto px-8 py-3.5 bg-brand-primary text-text-on-brand font-label-md rounded-xl flex items-center justify-center gap-2 hover:bg-coffee-800 transition-all shadow-sm shadow-orange-900/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {isUpdating ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-text-on-brand"></div>
                ) : (
                  <Save className=" text-[20px]" />
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