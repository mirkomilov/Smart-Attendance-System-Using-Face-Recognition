import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Camera, CheckCircle2, ShieldCheck } from 'lucide-react'
import Card from '../../components/ui/Card'
import AuthLayout from '../../layouts/AuthLayout'
import { cn } from '../../lib/cn'

function FaceCapturePage() {
  const [step, setStep] = useState(0)
  const [capturing, setCapturing] = useState(false)
  const videoRef = useRef(null)
  const navigate = useNavigate()

  const steps = [
    { label: 'Front View', instruction: 'Look directly at the camera' },
    { label: 'Left View', instruction: 'Turn your head slightly to the left' },
    { label: 'Right View', instruction: 'Turn your head slightly to the right' },
  ]

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        console.error('Error accessing camera:', err)
      }
    }

    startCamera()
  }, [])

  const handleCapture = () => {
    setCapturing(true)

    setTimeout(() => {
      setCapturing(false)

      if (step < 2) {
        setStep(step + 1)
      } else {
        navigate('/student/dashboard')
      }
    }, 1200)
  }

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl">
        <Card className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Biometric Registration</h2>
            <p className="text-slate-500">Capture your face from three different angles</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border-4 border-slate-200">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />

                <div className="absolute inset-0 border-40 border-black/20 pointer-events-none">
                  <div className="w-full h-full border-2 border-dashed border-white/50 rounded-full flex items-center justify-center">
                    <div className="w-1/2 h-2/3 border-2 border-blue-400 rounded-[100px]" />
                  </div>
                </div>

                {capturing && (
                  <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="bg-white p-4 rounded-full shadow-xl"
                    >
                      <Camera size={32} className="text-blue-600" />
                    </motion.div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleCapture}
                  disabled={capturing}
                  className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
                >
                  <Camera size={24} />
                  {capturing ? 'Capturing...' : `Capture ${steps[step].label}`}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h4 className="font-semibold text-slate-900 mb-4">Instructions</h4>
                <div className="space-y-4">
                  {steps.map((s, i) => (
                    <div key={i} className="flex gap-3">
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                          step === i
                            ? 'bg-blue-600 text-white'
                            : i < step
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 text-slate-500'
                        )}
                      >
                        {i < step ? <CheckCircle2 size={14} /> : i + 1}
                      </div>

                      <div>
                        <p className={cn('text-sm font-medium', step === i ? 'text-slate-900' : 'text-slate-500')}>
                          {s.label}
                        </p>
                        {step === i && <p className="text-xs text-blue-600 mt-1">{s.instruction}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-3 text-blue-700 mb-2">
                  <ShieldCheck size={20} />
                  <span className="font-semibold">Privacy Note</span>
                </div>
                <p className="text-xs text-blue-600 leading-relaxed">
                  Your biometric data is encrypted and stored securely. It will only be used for attendance verification purposes.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </AuthLayout>
  )
}

export default FaceCapturePage