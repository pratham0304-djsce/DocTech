import {
  Brain,
  FileImage,
  ClipboardList,
  UserCheck,
  Activity,
  Bell,
  ChevronRight,
  ArrowRight,
  Star,
  Stethoscope,
  Bone,
  Heart,
  Baby,
  Cpu,
} from 'lucide-react'

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────

const features = [
  {
    icon: Brain,
    title: 'AI Symptom Checker',
    desc: 'Describe your symptoms and let our AI identify possible conditions with clinical accuracy.',
  },
  {
    icon: FileImage,
    title: 'Upload Medical Reports',
    desc: 'Securely upload X-rays, MRIs, and CT scans for instant AI-powered analysis.',
  },
  {
    icon: ClipboardList,
    title: 'Electronic Health Records',
    desc: 'Store, organize, and access your complete medical history anytime, anywhere.',
  },
  {
    icon: UserCheck,
    title: 'Doctor Recommendations',
    desc: 'Get matched with verified specialists based on your symptoms and location.',
  },
  {
    icon: Activity,
    title: 'Health Tracking',
    desc: 'Track BMI, menstrual cycles, vitals, and health trends over time.',
  },
  {
    icon: Bell,
    title: 'Follow-up Reminders',
    desc: 'Never miss a medication dose or doctor appointment with smart reminders.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Enter Symptoms',
    desc: 'Tell us what you\'re experiencing in plain language — no medical jargon required.',
  },
  {
    number: '02',
    title: 'AI Analyzes Your Condition',
    desc: 'Our advanced AI cross-references thousands of medical datasets to understand your situation.',
  },
  {
    number: '03',
    title: 'Get Possible Diagnosis',
    desc: 'Receive a clear, prioritized list of possible conditions with explanations.',
  },
  {
    number: '04',
    title: 'Connect With Doctors',
    desc: 'Book a consultation with the right specialist at the right time, instantly.',
  },
]

const departments = [
  { icon: Stethoscope, name: 'General Medicine', desc: 'Comprehensive primary care for all ages.' },
  { icon: Bone, name: 'Orthopedics', desc: 'Expert care for bones, joints, and muscles.' },
  { icon: Heart, name: 'Cardiology', desc: 'Advanced diagnosis and heart health management.' },
  { icon: Baby, name: 'Gynecology', desc: 'Specialized women\'s health and maternity care.' },
  { icon: Cpu, name: 'Neurology', desc: 'Treatment for brain, spine, and nervous system.' },
]

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Patient, Mumbai',
    text: 'The AI symptom checker caught an early warning sign that I had been ignoring for weeks. My doctor confirmed the diagnosis. This platform may have saved my life.',
    rating: 5,
    initials: 'PS',
  },
  {
    name: 'Rajan Mehta',
    role: 'Patient, Pune',
    text: 'Booking a specialist used to take days. With DocTech I was connected to a cardiologist within minutes. The entire experience was seamless and professional.',
    rating: 5,
    initials: 'RM',
  },
  {
    name: 'Ananya Iyer',
    role: 'Patient, Bangalore',
    text: 'I love the health tracking features. Monitoring my menstrual cycle and BMI in one place alongside my medical records gives me complete control over my wellbeing.',
    rating: 5,
    initials: 'AI',
  },
]

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="group bg-white border border-primary-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
        <Icon className="w-6 h-6 text-primary-600" />
      </div>
      <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  )
}

function StepCard({ number, title, desc, isLast }) {
  return (
    <div className="flex flex-col sm:flex-row lg:flex-col items-start gap-4 relative">
      <div className="flex items-center gap-4 lg:flex-col lg:items-start">
        <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center shrink-0 shadow-md">
          <span className="text-white font-bold text-lg">{number}</span>
        </div>
        {/* Connector line for desktop */}
        {!isLast && (
          <div className="hidden lg:block absolute top-7 left-14 w-[calc(100%-3.5rem)] h-0.5 bg-primary-100" />
        )}
      </div>
      <div>
        <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function DepartmentCard({ icon: Icon, name, desc }) {
  return (
    <div className="group flex items-start gap-4 bg-white border border-primary-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary-300 hover:-translate-y-0.5 transition-all duration-300">
      <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors">
        <Icon className="w-5 h-5 text-primary-600" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-800 text-sm">{name}</h3>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function TestimonialCard({ name, role, text, rating, initials }) {
  return (
    <div className="bg-white border border-primary-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-primary-400 text-primary-400" />
        ))}
      </div>
      <p className="text-sm text-gray-600 leading-relaxed mb-6">"{text}"</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-sm">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm">{name}</p>
          <p className="text-xs text-gray-400">{role}</p>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Hero Illustration (Pure SVG, no external deps)
// ─────────────────────────────────────────────
function HeroIllustration() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow ring */}
      <div className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-primary-50 border border-primary-100" />
      <div className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-primary-100 border border-primary-200 opacity-60" />

      {/* Central card */}
      <div className="relative z-10 bg-white rounded-3xl shadow-xl border border-primary-100 p-6 w-56 sm:w-64">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Health Score</p>
            <p className="text-lg font-bold text-primary-600">92 / 100</p>
          </div>
        </div>
        {/* Fake chart bars */}
        <div className="flex items-end gap-1.5 h-16 mb-3">
          {[40, 60, 50, 80, 65, 90, 75].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-md"
              style={{
                height: `${h}%`,
                backgroundColor: i === 5 ? '#238370' : '#9dd6cb',
              }}
            />
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center">Weekly vitals overview</p>
      </div>

      {/* Floating badge – top right */}
      <div className="absolute -top-2 -right-2 sm:top-4 sm:right-0 bg-white border border-primary-100 rounded-xl shadow-md px-3 py-2 flex items-center gap-2 z-20">
        <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
        <span className="text-xs font-semibold text-primary-700">AI Online</span>
      </div>

      {/* Floating badge – bottom left */}
      <div className="absolute -bottom-2 -left-2 sm:bottom-4 sm:left-0 bg-primary-500 rounded-xl shadow-md px-3 py-2 flex items-center gap-2 z-20">
        <UserCheck className="w-3.5 h-3.5 text-white" />
        <span className="text-xs font-semibold text-white">284 Doctors</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      {/* ── HERO ──────────────────────────────────────── */}
      <section id="home" className="section-padding bg-gradient-to-br from-white via-primary-50/40 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
            {/* Text */}
            <div className="flex-1 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                Powered by Advanced AI
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-5">
                Your Personal{' '}
                <span className="text-gradient">AI Doctor</span>{' '}
                Assistant
              </h1>
              <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                Analyze symptoms, store health records, and connect with doctors instantly. Healthcare intelligence, right in your hands.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <button className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-7 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button className="flex items-center justify-center gap-2 border-2 border-primary-200 text-primary-700 hover:bg-primary-50 font-semibold px-7 py-3.5 rounded-xl transition-all duration-200">
                  Talk to AI
                  <Brain className="w-4 h-4" />
                </button>
              </div>
              {/* Trust badges */}
              <div className="mt-10 flex flex-wrap items-center gap-6 justify-center lg:justify-start text-xs text-gray-400">
                {['HIPAA Compliant', '10,000+ Users', '99.9% Uptime'].map((b) => (
                  <span key={b} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Illustration */}
            <div className="flex-1 flex justify-center lg:justify-end">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────── */}
      <section id="features" className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-2 block">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Everything You Need for <span className="text-gradient">Smart Healthcare</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
              Our platform combines AI precision with clinical care to give you a complete health management experience.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────── */}
      <section id="how-it-works" className="section-padding bg-primary-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-2 block">Process</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
              From symptom input to specialist consultation — our streamlined 4-step process takes care of everything.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, i) => (
              <StepCard key={step.number} {...step} isLast={i === steps.length - 1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── DEPARTMENTS ───────────────────────────────── */}
      <section id="departments" className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-2 block">Specialties</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Our Medical <span className="text-gradient">Departments</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
              Explore our network of verified specialists across multiple medical disciplines.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {departments.map((d) => (
              <DepartmentCard key={d.name} {...d} />
            ))}
            {/* CTA card */}
            <div className="bg-primary-500 rounded-2xl p-5 flex items-center justify-between shadow-md cursor-pointer hover:bg-primary-600 transition-colors group">
              <div>
                <p className="font-semibold text-white text-sm">Explore All</p>
                <p className="text-xs text-primary-100 mt-0.5">20+ specialties available</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────── */}
      <section id="testimonials" className="section-padding bg-primary-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-2 block">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Trusted by <span className="text-gradient">Thousands</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
              Real stories from real patients who transformed their healthcare experience.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION ────────────────────────────── */}
      <section className="section-padding bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
            Start Your Smart Healthcare<br className="hidden sm:block" /> Journey Today
          </h2>
          <p className="text-primary-100 text-base mb-8 max-w-xl mx-auto">
            Join over 10,000 users already managing their health smarter with DocTech.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary-700 font-bold px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-colors shadow-md text-sm">
              Sign Up — It's Free
            </button>
            <button className="flex items-center justify-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors text-sm">
              <Brain className="w-4 h-4" />
              Talk to AI
            </button>
          </div>
          <p className="text-primary-200 text-xs mt-6">No credit card required · HIPAA compliant · Cancel anytime</p>
        </div>
      </section>
    </>
  )
}
