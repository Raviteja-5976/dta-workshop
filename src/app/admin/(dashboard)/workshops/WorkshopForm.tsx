"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  ArrowLeft, 
  Trash2, 
  Plus, 
  Save, 
  BookOpen,
  HelpCircle,
  Award,
  Sparkles,
  Rocket,
  Upload
} from 'lucide-react';
import Link from 'next/link';
import { NeoButton } from '@/components/UI/NeoButton';
import { NeoCard } from '@/components/UI/NeoCard';
import { TagInput } from '@/components/UI/TagInput';
import { createWorkshopAction, updateWorkshopAction, uploadWorkshopCoverAction } from '@/actions/workshops';
import { resolveCoverImage } from '@/lib/images';

const workshopSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  about_text: z.string().optional(),
  // Holds the uploaded Storage object path (or a legacy URL). Resolved for
  // display by resolveCoverImage() — not a raw URL the admin types anymore.
  cover_image: z.string().optional(),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  category: z.enum(['Frontend', 'Backend', 'AI', 'Career', 'Dev Tools', 'Portfolio']),
  default_instructor_id: z.string().optional(),
  is_published: z.boolean(),
  project_preview_url: z.string().url('Must be a valid URL').or(z.literal('')),
  project_preview_enabled: z.boolean(),
});

type WorkshopFormValues = z.infer<typeof workshopSchema>;

interface InstructorItem {
  id: string;
  name: string;
}

interface WorkshopFormProps {
  initialData?: any;
  instructors: InstructorItem[];
  isEdit?: boolean;
}

// JSONB columns (highlights / learning_outcomes / faq) can come back from
// Supabase either already-parsed as arrays or as raw JSON strings, depending on
// how the row was written. Normalize to an array so the repeatable-field editors
// below never call `.map` on a string. Mirrors safeJsonParse in
// src/lib/data/workshops.ts.
function toArray<T>(val: any): T[] {
  if (Array.isArray(val)) return val as T[];
  if (typeof val === 'string' && val.trim()) {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export const WorkshopForm: React.FC<WorkshopFormProps> = ({
  initialData,
  instructors = [],
  isEdit = false
}) => {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // JSONB fields managed via state (normalized in case Supabase returns them as
  // JSON strings rather than parsed arrays).
  const [highlights, setHighlights] = useState<string[]>(toArray<string>(initialData?.highlights));
  const [learningOutcomes, setLearningOutcomes] = useState<Array<{ title: string; desc: string }>>(
    toArray<{ title: string; desc: string }>(initialData?.learning_outcomes)
  );
  const [faq, setFaq] = useState<Array<{ q: string; a: string }>>(
    toArray<{ q: string; a: string }>(initialData?.faq)
  );

  // Cover image upload (stored in the Supabase bucket, previewed here and shown
  // identically on the public/user pages via resolveCoverImage).
  const [coverPreview, setCoverPreview] = useState<string | undefined>(
    resolveCoverImage(initialData?.cover_image)
  );
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<WorkshopFormValues>({
    resolver: zodResolver(workshopSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      about_text: initialData?.about_text || '',
      cover_image: initialData?.cover_image || '',
      difficulty: initialData?.difficulty || 'Beginner',
      category: initialData?.category || 'Portfolio',
      default_instructor_id: initialData?.default_instructor_id || '',
      is_published: initialData?.is_published !== false,
      project_preview_url: initialData?.project_preview_url || '',
      project_preview_enabled: initialData?.project_preview_enabled === true,
    },
  });

  // Repeatable learning outcomes helpers
  const addOutcome = () => {
    setLearningOutcomes([...learningOutcomes, { title: '', desc: '' }]);
  };
  
  const updateOutcome = (idx: number, field: 'title' | 'desc', val: string) => {
    const updated = [...learningOutcomes];
    updated[idx][field] = val;
    setLearningOutcomes(updated);
  };

  const removeOutcome = (idx: number) => {
    setLearningOutcomes(learningOutcomes.filter((_, i) => i !== idx));
  };

  // Repeatable FAQ helpers
  const addFaq = () => {
    setFaq([...faq, { q: '', a: '' }]);
  };
  
  const updateFaq = (idx: number, field: 'q' | 'a', val: string) => {
    const updated = [...faq];
    updated[idx][field] = val;
    setFaq(updated);
  };

  const removeFaq = (idx: number) => {
    setFaq(faq.filter((_, i) => i !== idx));
  };

  // Upload the chosen file to the storage bucket, then store its path in the form.
  const handleCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverError(null);

    const localUrl = URL.createObjectURL(file);
    setCoverPreview(localUrl);          // instant local preview while uploading
    setUploadingCover(true);

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await uploadWorkshopCoverAction(fd);
      if (res.success && res.path) {
        setValue('cover_image', res.path, { shouldDirty: true });
        setCoverPreview(resolveCoverImage(res.path));
      } else {
        setCoverError(res.error || 'Upload failed.');
        setCoverPreview(resolveCoverImage(initialData?.cover_image));
      }
    } catch {
      setCoverError('Upload failed. Please try again.');
      setCoverPreview(resolveCoverImage(initialData?.cover_image));
    } finally {
      setUploadingCover(false);
      URL.revokeObjectURL(localUrl);
      e.target.value = '';              // allow re-selecting the same file
    }
  };

  const onSubmit = async (values: WorkshopFormValues) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = {
      ...values,
      highlights,
      learning_outcomes: learningOutcomes.filter(o => o.title.trim()),
      faq: faq.filter(f => f.q.trim()),
    };

    try {
      if (isEdit) {
        const res = await updateWorkshopAction(initialData.id, payload);
        if (res.success) {
          setSuccessMsg('Workshop updated successfully!');
          setTimeout(() => {
            router.push('/admin/workshops');
            router.refresh();
          }, 1000);
        } else {
          setErrorMsg(res.error || 'Failed to update workshop.');
        }
      } else {
        const res = await createWorkshopAction(payload);
        if (res.success) {
          setSuccessMsg('Workshop created successfully!');
          setTimeout(() => {
            router.push(`/admin/workshops/${res.id}/batches`);
            router.refresh();
          }, 1000);
        } else {
          setErrorMsg(res.error || 'Failed to create workshop.');
        }
      }
    } catch (e: any) {
      setErrorMsg('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back button and title */}
      <div className="flex items-center justify-between border-b-2 border-deep-navy/10 pb-4">
        <div className="flex items-center gap-3 text-left">
          <Link href="/admin/workshops">
            <button className="p-2 border-2 border-deep-navy bg-white hover:bg-bg-cream rounded-xl shadow-[2px_2px_0px_0px_#1B1F3B] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer">
              <ArrowLeft size={16} className="text-deep-navy" />
            </button>
          </Link>
          <div>
            <span className="text-[10px] font-display font-black tracking-widest text-deep-navy/50 uppercase block">
              {isEdit ? 'Modify Existing' : 'Create New'}
            </span>
            <h2 className="font-display font-black text-3xl text-deep-navy leading-none uppercase">
              {isEdit ? 'Edit Workshop' : 'New Workshop'}
            </h2>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-coral/10 border-2 border-coral rounded-xl text-coral text-sm font-bold">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-mint/10 border-2 border-mint rounded-xl text-deep-navy text-sm font-bold">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 text-left">
        {/* Core Info */}
        <NeoCard variant="white" className="p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2 border-b-2 border-deep-navy/10 pb-3 mb-2">
            <BookOpen className="w-5 h-5 text-deep-navy" />
            <h3 className="font-display font-black text-lg uppercase">Core Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="font-display font-black text-xs uppercase text-deep-navy">Workshop Title</label>
              <input
                type="text"
                placeholder="e.g. Build Your Portfolio Website Using AI"
                className="w-full border-3 border-deep-navy rounded-xl bg-bg-cream font-semibold px-4 py-3 shadow-neo-inset focus:bg-white focus:outline-none text-deep-navy"
                {...register('title')}
              />
              {errors.title && <p className="text-coral font-bold text-xs">{errors.title.message}</p>}
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <label className="font-display font-black text-xs uppercase text-deep-navy">Custom Slug (Optional)</label>
              <input
                type="text"
                placeholder="e.g. build-your-portfolio"
                className="w-full border-3 border-deep-navy rounded-xl bg-bg-cream font-semibold px-4 py-3 shadow-neo-inset focus:bg-white focus:outline-none text-deep-navy"
                {...register('slug')}
              />
              <span className="text-[10px] font-bold text-deep-navy/40">Leave blank to auto-generate from Title.</span>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="font-display font-black text-xs uppercase text-deep-navy">Category</label>
              <select
                className="w-full border-3 border-deep-navy rounded-xl bg-bg-cream font-semibold px-4 py-3 shadow-neo-inset focus:bg-white focus:outline-none text-deep-navy cursor-pointer"
                {...register('category')}
              >
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="AI">AI</option>
                <option value="Career">Career</option>
                <option value="Dev Tools">Dev Tools</option>
                <option value="Portfolio">Portfolio</option>
              </select>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <label className="font-display font-black text-xs uppercase text-deep-navy">Difficulty Level</label>
              <select
                className="w-full border-3 border-deep-navy rounded-xl bg-bg-cream font-semibold px-4 py-3 shadow-neo-inset focus:bg-white focus:outline-none text-deep-navy cursor-pointer"
                {...register('difficulty')}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* Default Instructor */}
            <div className="space-y-2">
              <label className="font-display font-black text-xs uppercase text-deep-navy">Default Instructor</label>
              <select
                className="w-full border-3 border-deep-navy rounded-xl bg-bg-cream font-semibold px-4 py-3 shadow-neo-inset focus:bg-white focus:outline-none text-deep-navy cursor-pointer"
                {...register('default_instructor_id')}
              >
                <option value="">Select Instructor...</option>
                {instructors.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
              </select>
            </div>

            {/* Cover Image Upload */}
            <div className="space-y-2 md:col-span-2">
              <label className="font-display font-black text-xs uppercase text-deep-navy">Cover Image</label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {/* Live preview */}
                <div className="w-full sm:w-48 h-32 shrink-0 border-3 border-deep-navy rounded-xl overflow-hidden bg-bg-cream shadow-neo-inset flex items-center justify-center">
                  {coverPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-deep-navy/40 uppercase text-center px-2">No image yet</span>
                  )}
                </div>

                {/* Upload control */}
                <div className="flex-1 space-y-2">
                  <label className={`inline-flex items-center gap-2 px-4 py-2.5 border-3 border-deep-navy bg-yellow rounded-xl font-display font-black text-xs uppercase text-deep-navy shadow-[2px_2px_0px_0px_#1B1F3B] transition-all w-fit ${uploadingCover ? 'opacity-60 cursor-wait' : 'hover:-translate-y-0.5 active:translate-y-0 cursor-pointer'}`}>
                    <Upload size={14} />
                    {uploadingCover ? 'Uploading...' : coverPreview ? 'Replace Image' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverSelect}
                      disabled={uploadingCover}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] font-bold text-deep-navy/50 leading-relaxed">
                    Stored in your Supabase storage bucket and shown as the thumbnail on the catalog,
                    home page and workshop page. PNG / JPG / WEBP, up to 5MB.
                  </p>
                  {coverError && <p className="text-coral font-bold text-xs">{coverError}</p>}
                </div>
              </div>
              {/* Holds the uploaded object path submitted with the form. */}
              <input type="hidden" {...register('cover_image')} />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="font-display font-black text-xs uppercase text-deep-navy">Short Card Description</label>
            <textarea
              rows={3}
              placeholder="Provide a short description showing on the workshop catalog cards..."
              className="w-full border-3 border-deep-navy rounded-xl bg-bg-cream font-semibold px-4 py-3 shadow-neo-inset focus:bg-white focus:outline-none text-deep-navy"
              {...register('description')}
            />
            {errors.description && <p className="text-coral font-bold text-xs">{errors.description.message}</p>}
          </div>

          {/* About Text */}
          <div className="space-y-2">
            <label className="font-display font-black text-xs uppercase text-deep-navy">Long About Text (Markdown Supported)</label>
            <textarea
              rows={6}
              placeholder="Describe the workshop, its requirements, outcomes, schedule overview, and detail what the student gets..."
              className="w-full border-3 border-deep-navy rounded-xl bg-bg-cream font-semibold px-4 py-3 shadow-neo-inset focus:bg-white focus:outline-none text-deep-navy"
              {...register('about_text')}
            />
          </div>

          {/* Publish Switch */}
          <div className="flex items-center gap-3 bg-bg-cream/40 border-2 border-dashed border-deep-navy/20 rounded-xl p-4">
            <input
              type="checkbox"
              id="is_published"
              className="w-5 h-5 accent-mint cursor-pointer"
              {...register('is_published')}
            />
            <label htmlFor="is_published" className="font-display font-black text-sm uppercase text-deep-navy cursor-pointer">
              Publish directly to the student portal catalog
            </label>
          </div>
        </NeoCard>

        {/* Project Preview */}
        <NeoCard variant="white" className="p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2 border-b-2 border-deep-navy/10 pb-3 mb-2">
            <Rocket className="w-5 h-5 text-deep-navy" />
            <h3 className="font-display font-black text-lg uppercase">Project Preview</h3>
          </div>

          <p className="text-xs text-deep-navy/60 font-semibold">
            Link to a live preview of the project students build by the end of this
            workshop. When enabled, the public workshop page shows a
            <span className="font-black text-deep-navy"> &ldquo;What you build by the end of Workshop&rdquo; </span>
            button that opens this link.
          </p>

          {/* Enable toggle */}
          <div className="flex items-center gap-3 bg-bg-cream/40 border-2 border-dashed border-deep-navy/20 rounded-xl p-4">
            <input
              type="checkbox"
              id="project_preview_enabled"
              className="w-5 h-5 accent-mint cursor-pointer"
              {...register('project_preview_enabled')}
            />
            <label htmlFor="project_preview_enabled" className="font-display font-black text-sm uppercase text-deep-navy cursor-pointer">
              Show project preview on the workshop page
            </label>
          </div>

          {/* Preview URL */}
          <div className="space-y-2">
            <label className="font-display font-black text-xs uppercase text-deep-navy">Project Preview Link</label>
            <input
              type="text"
              placeholder="https://your-live-project-demo.com"
              className="w-full border-3 border-deep-navy rounded-xl bg-bg-cream font-semibold px-4 py-3 shadow-neo-inset focus:bg-white focus:outline-none text-deep-navy"
              {...register('project_preview_url')}
            />
            {errors.project_preview_url && <p className="text-coral font-bold text-xs">{errors.project_preview_url.message}</p>}
          </div>
        </NeoCard>

        {/* Highlights & outcomes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Highlights TagInput */}
          <NeoCard variant="white" className="p-6 space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-deep-navy/10 pb-3">
              <Sparkles className="w-5 h-5 text-deep-navy" />
              <h3 className="font-display font-black text-base uppercase">Highlights</h3>
            </div>
            <p className="text-xs text-deep-navy/60 font-semibold">List key features shown on cards (e.g. "4 Live Sessions", "Slack Access").</p>
            <TagInput
              tags={highlights}
              onChange={setHighlights}
              placeholder="Type highlight and press Enter..."
            />
          </NeoCard>

          {/* Learning Outcomes repeatable */}
          <NeoCard variant="white" className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-deep-navy/10 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-deep-navy" />
                <h3 className="font-display font-black text-base uppercase">Outcomes</h3>
              </div>
              <button
                type="button"
                onClick={addOutcome}
                className="p-1.5 border-2 border-deep-navy bg-mint rounded-lg shadow-[2px_2px_0px_0px_#1B1F3B] hover:-translate-y-0.5 active:translate-y-0 text-deep-navy font-bold text-xs uppercase cursor-pointer inline-flex items-center gap-1"
              >
                <Plus size={12} /> Add
              </button>
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {learningOutcomes.length === 0 ? (
                <p className="text-center text-xs text-deep-navy/40 font-bold py-6">No learning outcomes added yet.</p>
              ) : (
                learningOutcomes.map((outcome, idx) => (
                  <div key={idx} className="border border-deep-navy/10 bg-bg-cream/30 p-3 rounded-xl space-y-2 relative">
                    <button
                      type="button"
                      onClick={() => removeOutcome(idx)}
                      className="absolute top-2 right-2 text-coral hover:text-coral/80 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="space-y-1.5 pr-6">
                      <input
                        type="text"
                        placeholder="Outcome Title (e.g. Deploy Live Site)"
                        value={outcome.title}
                        onChange={(e) => updateOutcome(idx, 'title', e.target.value)}
                        className="w-full border-2 border-deep-navy rounded-lg bg-white font-bold text-xs px-2.5 py-1.5 focus:outline-none text-deep-navy"
                      />
                      <input
                        type="text"
                        placeholder="Short outcome detail/description..."
                        value={outcome.desc}
                        onChange={(e) => updateOutcome(idx, 'desc', e.target.value)}
                        className="w-full border-2 border-deep-navy rounded-lg bg-white font-semibold text-xs px-2.5 py-1.5 focus:outline-none text-deep-navy"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </NeoCard>
        </div>

        {/* FAQ repeatable */}
        <NeoCard variant="white" className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-deep-navy/10 pb-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-deep-navy" />
              <h3 className="font-display font-black text-base uppercase">Frequently Asked Questions</h3>
            </div>
            <button
              type="button"
              onClick={addFaq}
              className="p-1.5 border-2 border-deep-navy bg-mint rounded-lg shadow-[2px_2px_0px_0px_#1B1F3B] hover:-translate-y-0.5 active:translate-y-0 text-deep-navy font-bold text-xs uppercase cursor-pointer inline-flex items-center gap-1"
            >
              <Plus size={12} /> Add FAQ
            </button>
          </div>

          <div className="space-y-4">
            {faq.length === 0 ? (
              <p className="text-center text-xs text-deep-navy/40 font-bold py-6">No FAQs added yet.</p>
            ) : (
              faq.map((item, idx) => (
                <div key={idx} className="border-2 border-deep-navy p-4 bg-bg-cream/20 rounded-xl space-y-3 relative">
                  <button
                    type="button"
                    onClick={() => removeFaq(idx)}
                    className="absolute top-3 right-3 text-coral hover:text-coral/80 cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-1 gap-3 pr-6">
                    <input
                      type="text"
                      placeholder="Question (e.g. Do I need coding experience?)"
                      value={item.q}
                      onChange={(e) => updateFaq(idx, 'q', e.target.value)}
                      className="w-full border-2 border-deep-navy rounded-lg bg-white font-bold text-sm px-3 py-2 focus:outline-none text-deep-navy"
                    />
                    <textarea
                      rows={2}
                      placeholder="Answer..."
                      value={item.a}
                      onChange={(e) => updateFaq(idx, 'a', e.target.value)}
                      className="w-full border-2 border-deep-navy rounded-lg bg-white font-semibold text-sm px-3 py-2 focus:outline-none text-deep-navy"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </NeoCard>

        {/* Action Button */}
        <NeoButton
          variant="orange"
          size="md"
          type="submit"
          disabled={loading}
          className="w-full md:w-auto"
        >
          <Save size={16} className="mr-1" />
          {loading ? 'Saving Workshop...' : isEdit ? 'Update Workshop' : 'Create Workshop'}
        </NeoButton>
      </form>
    </div>
  );
};
export default WorkshopForm;
