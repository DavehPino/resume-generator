import { Landing } from '@/components/landing/Landing'
import { Wizard } from '@/components/wizard/Wizard'
import { useWizardStore } from '@/store/wizardStore'

/**
 * Sin router: la vista vive en el store del wizard. La app es una sola
 * pantalla que va cambiando, y el progreso se restaura desde localStorage.
 */
export default function App() {
  const view = useWizardStore((state) => state.view)
  return view === 'landing' ? <Landing /> : <Wizard />
}
