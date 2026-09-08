import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { PaletteId } from '@/lib/palettes'
import { debouncedLocalStorage } from '@/store/persistStorage'
import {
  createEmptyCv,
  type Availability,
  type Certification,
  type CvData,
  type Education,
  type Experience,
  type Language,
  type PersonalInfo,
  type Skills,
} from '@/types/cv'

export const CV_STORAGE_KEY = 'cv-generator:data'

type Draft<T> = Omit<T, 'id'>

interface CvState {
  data: CvData
  /** El usuario declaró explícitamente que aún no tiene experiencia laboral. */
  noExperience: boolean

  setPersonal: (personal: PersonalInfo) => void
  setProfile: (text: string) => void

  addExperience: (item: Draft<Experience>) => void
  updateExperience: (id: string, item: Draft<Experience>) => void
  removeExperience: (id: string) => void
  setNoExperience: (value: boolean) => void

  addEducation: (item: Draft<Education>) => void
  updateEducation: (id: string, item: Draft<Education>) => void
  removeEducation: (id: string) => void

  setSkills: (skills: Skills) => void

  addLanguage: (item: Draft<Language>) => void
  updateLanguage: (id: string, item: Draft<Language>) => void
  removeLanguage: (id: string) => void

  addCertification: (item: Draft<Certification>) => void
  updateCertification: (id: string, item: Draft<Certification>) => void
  removeCertification: (id: string) => void

  setAvailability: (availability: Availability) => void
  setReferencesOnRequest: (value: boolean) => void
  setPalette: (palette: PaletteId) => void

  loadCv: (data: CvData) => void
  reset: () => void
}

/** Devuelve el CV con la marca de tiempo actualizada. */
function touch(data: CvData, patch: Partial<CvData>): CvData {
  return {
    ...data,
    ...patch,
    meta: { ...data.meta, updatedAt: new Date().toISOString() },
  }
}

function replaceById<T extends { id: string }>(list: T[], id: string, item: Draft<T>): T[] {
  return list.map((entry) => (entry.id === id ? ({ ...item, id } as T) : entry))
}

export const useCvStore = create<CvState>()(
  persist(
    (set) => ({
      data: createEmptyCv(),
      noExperience: false,

      setPersonal: (personal) => set((state) => ({ data: touch(state.data, { personal }) })),
      setProfile: (text) => set((state) => ({ data: touch(state.data, { profile: { text } }) })),

      addExperience: (item) =>
        set((state) => ({
          data: touch(state.data, {
            experience: [...state.data.experience, { ...item, id: crypto.randomUUID() }],
          }),
          noExperience: false,
        })),
      updateExperience: (id, item) =>
        set((state) => ({
          data: touch(state.data, {
            experience: replaceById(state.data.experience, id, item),
          }),
        })),
      removeExperience: (id) =>
        set((state) => ({
          data: touch(state.data, {
            experience: state.data.experience.filter((entry) => entry.id !== id),
          }),
        })),
      setNoExperience: (value) =>
        set((state) => ({
          noExperience: value,
          data: value ? touch(state.data, { experience: [] }) : state.data,
        })),

      addEducation: (item) =>
        set((state) => ({
          data: touch(state.data, {
            education: [...state.data.education, { ...item, id: crypto.randomUUID() }],
          }),
        })),
      updateEducation: (id, item) =>
        set((state) => ({
          data: touch(state.data, { education: replaceById(state.data.education, id, item) }),
        })),
      removeEducation: (id) =>
        set((state) => ({
          data: touch(state.data, {
            education: state.data.education.filter((entry) => entry.id !== id),
          }),
        })),

      setSkills: (skills) => set((state) => ({ data: touch(state.data, { skills }) })),

      addLanguage: (item) =>
        set((state) => ({
          data: touch(state.data, {
            languages: [...state.data.languages, { ...item, id: crypto.randomUUID() }],
          }),
        })),
      updateLanguage: (id, item) =>
        set((state) => ({
          data: touch(state.data, { languages: replaceById(state.data.languages, id, item) }),
        })),
      removeLanguage: (id) =>
        set((state) => ({
          data: touch(state.data, {
            languages: state.data.languages.filter((entry) => entry.id !== id),
          }),
        })),

      addCertification: (item) =>
        set((state) => ({
          data: touch(state.data, {
            certifications: [
              ...state.data.certifications,
              { ...item, id: crypto.randomUUID() },
            ],
          }),
        })),
      updateCertification: (id, item) =>
        set((state) => ({
          data: touch(state.data, {
            certifications: replaceById(state.data.certifications, id, item),
          }),
        })),
      removeCertification: (id) =>
        set((state) => ({
          data: touch(state.data, {
            certifications: state.data.certifications.filter((entry) => entry.id !== id),
          }),
        })),

      setAvailability: (availability) =>
        set((state) => ({ data: touch(state.data, { availability }) })),
      setReferencesOnRequest: (value) =>
        set((state) => ({ data: touch(state.data, { referencesOnRequest: value }) })),
      setPalette: (palette) => set((state) => ({ data: touch(state.data, { palette }) })),

      loadCv: (data) => set({ data, noExperience: data.experience.length === 0 }),
      reset: () => set({ data: createEmptyCv(), noExperience: false }),
    }),
    {
      name: CV_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => debouncedLocalStorage),
      /**
       * Un localStorage a medio escribir (o de una versión anterior) no debe
       * dejar la app en blanco: se completa con el CV vacío antes de usarlo.
       */
      merge: (persisted, current) => {
        const saved = persisted as Partial<CvState> | undefined
        if (!saved?.data) return current
        return { ...current, ...saved, data: { ...createEmptyCv(), ...saved.data } }
      },
    },
  ),
)

/** True si hay algo escrito que valga la pena recuperar. */
export function hasSavedProgress(state: Pick<CvState, 'data'>): boolean {
  const { personal, profile, experience, education, skills } = state.data
  return Boolean(
    personal.fullName.trim() ||
      personal.targetRole.trim() ||
      profile.text.trim() ||
      experience.length ||
      education.length ||
      skills.technical.length ||
      skills.soft.length,
  )
}
