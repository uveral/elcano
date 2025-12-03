import { useMemo, useState } from 'react'
import { supabase } from './supabaseClient'
import logo from './assets/armada-logo.png'
import './App.css'

type Stage = 'privacy' | 'demographics' | 'pss' | 'dass' | 'review' | 'completed'
type Scale = 'oficial' | 'suboficial' | 'tropa' | 'guardiamarina'
type Severity = 'Normal' | 'Suave' | 'Moderado' | 'Grave' | 'Extremadamente severo'

type Question = {
  id: string
  text: string
}

type Option = {
  value: number
  label: string
  helper?: string
}

type ManualLink = {
  id: string
  title: string
  href?: string
  note?: string
  thumb?: string
}

const pssOptions: Option[] = [
  { value: 0, label: 'Nunca' },
  { value: 1, label: 'Casi nunca' },
  { value: 2, label: 'De vez en cuando' },
  { value: 3, label: 'A menudo' },
  { value: 4, label: 'Muy a menudo' },
]

const pssQuestions: Question[] = [
  { id: 'pss1', text: 'En el último mes, ¿con qué frecuencia ha estado afectado por algo que ha ocurrido inesperadamente?' },
  { id: 'pss2', text: 'En el último mes, ¿con qué frecuencia se ha sentido incapaz de controlar las cosas importantes en su vida?' },
  { id: 'pss3', text: 'En el último mes, ¿con qué frecuencia se ha sentido nervioso o estresado?' },
  { id: 'pss4', text: 'En el último mes, ¿con qué frecuencia ha manejado con éxito los pequeños problemas irritantes de la vida?' },
  { id: 'pss5', text: 'En el último mes, ¿con qué frecuencia ha sentido que ha afrontado efectivamente los cambios importantes que han estado ocurriendo en su vida?' },
  { id: 'pss6', text: 'En el último mes, ¿con qué frecuencia ha estado seguro sobre su capacidad para manejar sus problemas personales?' },
  { id: 'pss7', text: 'En el último mes, ¿con qué frecuencia ha sentido que las cosas le van bien?' },
  { id: 'pss8', text: 'En el último mes, ¿con qué frecuencia ha sentido que no podía afrontar todas las cosas que tenía que hacer?' },
  { id: 'pss9', text: 'En el último mes, ¿con qué frecuencia ha podido controlar las dificultades de su vida?' },
  { id: 'pss10', text: 'En el último mes, ¿con qué frecuencia se ha sentido que tenía todo bajo control?' },
  { id: 'pss11', text: 'En el último mes, ¿con qué frecuencia ha estado enfadado porque las cosas que le han ocurrido estaban fuera de su control?' },
  { id: 'pss12', text: 'En el último mes, ¿con qué frecuencia ha pensado sobre las cosas que le quedan por hacer?' },
  { id: 'pss13', text: 'En el último mes, ¿con qué frecuencia ha podido controlar la forma de pasar el tiempo?' },
  { id: 'pss14', text: 'En el último mes, ¿con qué frecuencia ha sentido que las dificultades se acumulan tanto que no puede superarlas?' },
]

const dassOptions: Option[] = [
  { value: 0, label: '0', helper: 'Nunca' },
  { value: 1, label: '1', helper: 'A veces' },
  { value: 2, label: '2', helper: 'A menudo' },
  { value: 3, label: '3', helper: 'Casi siempre' },
]

const dassQuestions: Question[] = [
  { id: 'dass1', text: 'En el último mes, me costó mucho relajarme' },
  { id: 'dass2', text: 'En el último mes, me di cuenta de que tenía la boca seca' },
  { id: 'dass3', text: 'En el último mes, no podía sentir ningún sentimiento positivo' },
  { id: 'dass4', text: 'En el último mes, se me hizo difícil respirar' },
  { id: 'dass5', text: 'En el último mes, se me hizo difícil tomar la iniciativa para hacer cosas' },
  { id: 'dass6', text: 'En el último mes, reaccioné exageradamente en ciertas situaciones' },
  { id: 'dass7', text: 'En el último mes, sentí que mis manos temblaban' },
  { id: 'dass8', text: 'En el último mes, sentí que tenía muchos nervios' },
  { id: 'dass9', text: 'En el último mes, estaba preocupado por situaciones en las cuales podía tener pánico o en las que podría hacer el ridículo' },
  { id: 'dass10', text: 'En el último mes, sentí que no tenía nada por lo que vivir' },
  { id: 'dass11', text: 'En el último mes, noté que me agitaba' },
  { id: 'dass12', text: 'En el último mes, se me hizo difícil relajarme' },
  { id: 'dass13', text: 'En el último mes, me sentí triste y deprimido' },
  { id: 'dass14', text: 'En el último mes, no toleré nada que no me permitiera continuar con lo que estaba haciendo' },
  { id: 'dass15', text: 'En el último mes, sentí que estaba a punto de sufrir un ataque de pánico' },
  { id: 'dass16', text: 'En el último mes, no me pude entusiasmar por nada' },
  { id: 'dass17', text: 'En el último mes, sentí que valía muy poco como persona' },
  { id: 'dass18', text: 'En el último mes, sentí que estaba muy irritable' },
  { id: 'dass19', text: 'En el último mes, sentí los latidos de mi corazón a pesar de no haber hecho ningún esfuerzo físico' },
  { id: 'dass20', text: 'En el último mes, tuve miedo sin razón' },
  { id: 'dass21', text: 'En el último mes, sentí que la vida no tenía ningún sentido' },
]

const manualLinks: ManualLink[] = [
  { id: 'general', title: 'Manual General', href: 'https://github.com/uveral/elcano/releases/download/manual/General.pdf', thumb: '/manuales/general.png' },
  { id: 'breve', title: 'Manual Breve', href: 'https://github.com/uveral/elcano/releases/download/manual/Breve.pdf', thumb: '/manuales/breve.png' },
  { id: 'parejas', title: 'Manual Parejas', href: 'https://github.com/uveral/elcano/releases/download/manual/Parejas.pdf', thumb: '/manuales/parejas.png' },
  { id: 'ninos', title: 'Manual Niños', href: 'https://github.com/uveral/elcano/releases/download/manual/Ninos.pdf', thumb: '/manuales/ninos.png' },
  { id: 'suicidio', title: 'Manual Suicidio', href: 'https://github.com/uveral/elcano/releases/download/manual/Suicidio.pdf', thumb: '/manuales/suicidio.png' },
]

const buildEmptyAnswers = (questions: Question[]) =>
  questions.reduce<Record<string, number | null>>((acc, q) => ({ ...acc, [q.id]: null }), {})

const pssDirect = new Set(['pss1', 'pss2', 'pss3', 'pss8', 'pss11', 'pss12', 'pss14'])

const computePssScore = (answers: Record<string, number | null>) => {
  const anyMissing = Object.values(answers).some((v) => v === null)
  if (anyMissing) return null

  const recode = (id: string, value: number) => (pssDirect.has(id) ? value : 4 - value)
  const total = pssQuestions.reduce((sum, q) => sum + recode(q.id, answers[q.id] ?? 0), 0)
  return { total }
}

const dassGrouping = {
  depresion: ['dass3', 'dass5', 'dass10', 'dass13', 'dass16', 'dass17', 'dass21'],
  ansiedad: ['dass2', 'dass4', 'dass7', 'dass9', 'dass15', 'dass19', 'dass20'],
  estres: ['dass1', 'dass6', 'dass8', 'dass11', 'dass12', 'dass14', 'dass18'],
} as const

const dassCutoffs: Record<keyof typeof dassGrouping, { limit: number; label: Severity }[]> = {
  depresion: [
    { limit: 4, label: 'Normal' },
    { limit: 6, label: 'Suave' },
    { limit: 10, label: 'Moderado' },
    { limit: 13, label: 'Grave' },
    { limit: Infinity, label: 'Extremadamente severo' },
  ],
  ansiedad: [
    { limit: 3, label: 'Normal' },
    { limit: 5, label: 'Suave' },
    { limit: 7, label: 'Moderado' },
    { limit: 9, label: 'Grave' },
    { limit: Infinity, label: 'Extremadamente severo' },
  ],
  estres: [
    { limit: 7, label: 'Normal' },
    { limit: 9, label: 'Suave' },
    { limit: 12, label: 'Moderado' },
    { limit: 16, label: 'Grave' },
    { limit: Infinity, label: 'Extremadamente severo' },
  ],
}

const computeDassScores = (answers: Record<string, number | null>) => {
  const anyMissing = Object.values(answers).some((v) => v === null)
  if (anyMissing) return null

  const scores: Record<keyof typeof dassGrouping, number> = {
    depresion: 0,
    ansiedad: 0,
    estres: 0,
  }

  ;(Object.keys(dassGrouping) as (keyof typeof dassGrouping)[]).forEach((scaleKey) => {
    scores[scaleKey] = dassGrouping[scaleKey].reduce<number>(
      (sum, qid) => sum + (answers[qid] ?? 0),
      0,
    )
  })

  const categorize = (key: keyof typeof dassGrouping): Severity =>
    dassCutoffs[key].find((range) => scores[key] <= range.limit)!.label

  return {
    depresion: { puntuacion: scores.depresion, severidad: categorize('depresion') },
    ansiedad: { puntuacion: scores.ansiedad, severidad: categorize('ansiedad') },
    estres: { puntuacion: scores.estres, severidad: categorize('estres') },
  }
}

const ManualCard = ({ manual }: { manual: ManualLink }) => {
  return (
    <a
      href={manual.href || '#'}
      className={`manual-card ${!manual.href ? 'disabled' : ''}`}
      download={Boolean(manual.href)}
      target={manual.href ? '_blank' : undefined}
      rel="noreferrer"
    >
      <div className="manual-thumb">
        {manual.thumb ? <img src={manual.thumb} alt={manual.title} /> : <img src={logo} alt={manual.title} />}
      </div>
      <div className="manual-info">
        <span>{manual.title}</span>
        {!manual.href && <small>{manual.note}</small>}
      </div>
    </a>
  )
}

function App() {
  const [stage, setStage] = useState<Stage>('privacy')
  const [consentAccepted, setConsentAccepted] = useState(false)
  const [scale, setScale] = useState<Scale | ''>('')
  const [destination, setDestination] = useState('')
  const [fatherSecondSurname, setFatherSecondSurname] = useState('')
  const [motherSecondSurname, setMotherSecondSurname] = useState('')
  const [birthDay, setBirthDay] = useState('')
  const [mobilePhone, setMobilePhone] = useState('')

  const [pssAnswers, setPssAnswers] = useState<Record<string, number | null>>(buildEmptyAnswers(pssQuestions))
  const [dassAnswers, setDassAnswers] = useState<Record<string, number | null>>(buildEmptyAnswers(dassQuestions))
  const [pssIndex, setPssIndex] = useState(0)
  const [dassIndex, setDassIndex] = useState(0)
  const [contactOptIn, setContactOptIn] = useState(false)
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitOk, setSubmitOk] = useState(false)

  const identifier = useMemo(() => {
    const fatherLetter = fatherSecondSurname.trim().charAt(0).toUpperCase()
    const motherLetter = motherSecondSurname.trim().charAt(0).toUpperCase()
    const day = birthDay ? Number(birthDay).toString().padStart(2, '0') : ''
    const phoneDigits = mobilePhone.replace(/\D/g, '')
    const last3 = phoneDigits.slice(-3)
    const numbers = `${day}${last3}`
    const letters = `${fatherLetter}${motherLetter}`
    return numbers || letters ? `${numbers}${letters}` : ''
  }, [fatherSecondSurname, motherSecondSurname, birthDay, mobilePhone])

  const pssCompletedCount = useMemo(() => Object.values(pssAnswers).filter((v) => v !== null).length, [pssAnswers])
  const dassCompletedCount = useMemo(() => Object.values(dassAnswers).filter((v) => v !== null).length, [dassAnswers])

  const demographicsValid =
    consentAccepted &&
    scale !== '' &&
    destination !== '' &&
    fatherSecondSurname.trim() !== '' &&
    motherSecondSurname.trim() !== '' &&
    birthDay !== '' &&
    mobilePhone.trim() !== ''

  const handleAnswerPss = (id: string, value: number) => {
    setPssAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const handleAnswerDass = (id: string, value: number) => {
    setDassAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const allPssAnswered = pssCompletedCount === pssQuestions.length
  const allDassAnswered = dassCompletedCount === dassQuestions.length
  const supabaseReady = Boolean(supabase)
  const pssScore = useMemo(() => computePssScore(pssAnswers), [pssAnswers])
  const dassScores = useMemo(() => computeDassScores(dassAnswers), [dassAnswers])
  const contactValid = !contactOptIn || [contactName, contactPhone, contactEmail].some((v) => v.trim() !== '')

const handleSubmit = async () => {
    setSubmitError(null)
    setSubmitOk(false)

    if (!supabaseReady) {
      setSubmitError('Configura las variables de conexión (URL y clave) para poder enviar los datos.')
      return
    }

    setSubmitting(true)
    const payload = {
      status: 'draft',
      scale,
      destination,
      identifier,
      pss_responses: pssQuestions.map((q) => ({ id: q.id, text: q.text, value: pssAnswers[q.id] })),
      pss_score: pssScore,
      dass_responses: dassQuestions.map((q) => ({ id: q.id, text: q.text, value: dassAnswers[q.id] })),
      dass_scores: dassScores,
      contact_request: contactOptIn,
      contact_name: contactOptIn ? contactName.trim() : null,
      contact_phone: contactOptIn ? contactPhone.trim() : null,
      contact_email: contactOptIn ? contactEmail.trim() : null,
      submitted_at: new Date().toISOString(),
    }

    const { error } = await supabase!.from('test_responses').insert(payload)

    if (error) {
      setSubmitError(error.message)
    } else {
      setSubmitOk(true)
      setStage('completed')
    }

    setSubmitting(false)
  }

  const renderPrivacy = () => (
    <div className="panel">
      <div className="badge">Aviso de privacidad</div>
      <h1>Protección de datos</h1>
      <p className="lead">
        Tus respuestas son confidenciales y se emplearán únicamente para fines de investigación y mejora operativa, con base jurídica en tu consentimiento.
      </p>
      <ul className="list">
        <li>Cumplimiento RGPD/Ley Orgánica de Protección de Datos: no se recogen datos identificativos directos.</li>
        <li>Identificación seudónima: identificador = día + últimos 3 dígitos del móvil + inicial del segundo apellido del padre y de la madre.</li>
        <li>Transmisión segura: las respuestas viajan cifradas vía HTTPS/SSL hacia una base de datos segura y cifrada.</li>
        <li>Acceso restringido: solo personal autorizado del servicio de psicología puede consultar estos datos.</li>
        <li>Derechos: puedes solicitar acceso, rectificación o supresión a través del servicio de psicología.</li>
        <li>Puedes abandonar el cuestionario en cualquier momento; los resultados se guardarán inicialmente como borrador.</li>
      </ul>
      <div className="manuals">
        <span>Descarga de manuales en PDF:</span>
        <div className="manual-links">
          {manualLinks.map((manual) => (
            <ManualCard key={manual.id} manual={manual} />
          ))}
        </div>
      </div>
      <label className="checkbox">
        <input type="checkbox" checked={consentAccepted} onChange={(e) => setConsentAccepted(e.target.checked)} />
        <span>Acepto el aviso de privacidad y deseo continuar.</span>
      </label>
      <div className="actions">
        <button className="primary" onClick={() => setStage('demographics')} disabled={!consentAccepted}>
          Continuar
        </button>
      </div>
    </div>
  )

  const renderDemographics = () => (
    <div className="panel">
      <div className="badge">Datos previos</div>
      <h1>Datos demográficos</h1>
      <p className="lead">Usaremos estos datos para clasificar los resultados sin identificarte directamente.</p>
      <div className="form-grid">
        <label className="field">
          <span>Escala</span>
          <select value={scale} onChange={(e) => setScale(e.target.value as Scale)}>
            <option value="">Selecciona una opción</option>
            <option value="oficial">Oficiales</option>
            <option value="suboficial">Suboficiales</option>
            <option value="tropa">Tropa</option>
            <option value="guardiamarina">Guardiamarina</option>
          </select>
        </label>
        <label className="field">
          <span>Destino</span>
          <select value={destination} onChange={(e) => setDestination(e.target.value)}>
            <option value="">Selecciona una opción</option>
            <option value="control de buque">Control de buque</option>
            <option value="aprovisionamiento">Aprovisionamiento</option>
            <option value="maquinas">Máquinas</option>
            <option value="jefatura de estudios">Jefatura de estudios</option>
            <option value="sanidad">Sanidad</option>
            <option value="alumno enm">Alumno ENM</option>
          </select>
        </label>
        <label className="field">
          <span>Segundo apellido del padre</span>
          <input value={fatherSecondSurname} onChange={(e) => setFatherSecondSurname(e.target.value)} placeholder="Ej. García" />
        </label>
        <label className="field">
          <span>Segundo apellido de la madre</span>
          <input value={motherSecondSurname} onChange={(e) => setMotherSecondSurname(e.target.value)} placeholder="Ej. López" />
        </label>
        <label className="field">
          <span>Día de nacimiento</span>
          <input
            type="number"
            min="1"
            max="31"
            value={birthDay}
            onChange={(e) => setBirthDay(e.target.value)}
            placeholder="Ej. 07"
          />
        </label>
        <label className="field">
          <span>Teléfono móvil</span>
          <input value={mobilePhone} onChange={(e) => setMobilePhone(e.target.value)} placeholder="Últimos dígitos" />
        </label>
      </div>
      <div className="identifier">
        <span>Identificador generado</span>
        <strong>{identifier || 'Pendiente (rellena los campos)'}</strong>
        <small>Día + últimos 3 dígitos del móvil + inicial apellido 2º padre + inicial apellido 2º madre</small>
      </div>
      <div className="actions">
        <button onClick={() => setStage('privacy')}>Atrás</button>
        <button className="primary" onClick={() => setStage('pss')} disabled={!demographicsValid}>
          Ir al PSS-14
        </button>
      </div>
    </div>
  )

  const renderQuestion = (
    questions: Question[],
    options: Option[],
    answers: Record<string, number | null>,
    index: number,
    onChange: (id: string, value: number) => void,
    onPrev: () => void,
    onNext: () => void,
    endLabel: string,
    showEnd: boolean,
  ) => {
    const current = questions[index]
    const value = answers[current.id]
    const progress = Math.round(((index + 1) / questions.length) * 100)

    return (
      <div className="panel">
        <div className="badge">Pregunta {index + 1} de {questions.length}</div>
        <div className="progress">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <h1>{current.text}</h1>
        <div className="options">
          {options.map((opt) => (
            <button
              key={opt.value}
              className={`option ${value === opt.value ? 'selected' : ''}`}
              onClick={() => onChange(current.id, opt.value)}
            >
              <span className="option-label">{opt.label}</span>
              {opt.helper && <span className="option-helper">{opt.helper}</span>}
            </button>
          ))}
        </div>
        <div className="actions">
          <button onClick={onPrev}>Anterior</button>
          {index < questions.length - 1 ? (
            <button className="primary" onClick={onNext} disabled={value === null}>
              Siguiente
            </button>
          ) : showEnd ? (
            <button className="primary" onClick={onNext} disabled={value === null}>
              {endLabel}
            </button>
          ) : null}
        </div>
      </div>
    )
  }

  const renderPss = () =>
    renderQuestion(
      pssQuestions,
      pssOptions,
      pssAnswers,
      pssIndex,
      handleAnswerPss,
      () =>
        setPssIndex((i) => {
          if (i === 0) {
            setStage('demographics')
            return i
          }
          return i - 1
        }),
      () =>
        setPssIndex((i) => {
          const next = i + 1
          if (next >= pssQuestions.length) {
            setStage('dass')
            return i
          }
          return next
        }),
      'Pasar al DASS-21',
      pssIndex === pssQuestions.length - 1,
    )

  const renderDass = () =>
    renderQuestion(
      dassQuestions,
      dassOptions,
      dassAnswers,
      dassIndex,
      handleAnswerDass,
      () =>
        setDassIndex((i) => {
          if (i === 0) {
            setStage('pss')
            return i
          }
          return Math.max(i - 1, 0)
        }),
      () =>
        setDassIndex((i) => {
          const next = i + 1
          if (next >= dassQuestions.length) {
            setStage('review')
            return i
          }
          return next
        }),
      'Ver resumen y enviar',
      dassIndex === dassQuestions.length - 1,
    )

  const renderReview = () => (
    <div className="panel">
      <div className="badge">Resumen</div>
      <h1>Listo para enviar</h1>
      <p className="lead">Revisa que todas las preguntas estén respondidas. Al enviar, los datos se guardarán como borrador.</p>
      <div className="summary">
        <div>
          <span>Escala:</span>
          <strong>{scale}</strong>
        </div>
        <div>
          <span>Destino:</span>
          <strong>{destination || 'No indicado'}</strong>
        </div>
        <div>
          <span>Identificador:</span>
          <strong>{identifier || 'Pendiente (rellena los campos)'}</strong>
        </div>
        <div>
          <span>PSS-14 contestadas:</span>
          <strong>{pssCompletedCount}/{pssQuestions.length}</strong>
        </div>
        <div>
          <span>Solicitud de contacto:</span>
          <strong>{contactOptIn ? 'Sí' : 'No'}</strong>
        </div>
        <div>
          <span>DASS-21 contestadas:</span>
          <strong>{dassCompletedCount}/{dassQuestions.length}</strong>
        </div>
      </div>
      <div className="contact-block">
        <label className="checkbox">
          <input type="checkbox" checked={contactOptIn} onChange={(e) => setContactOptIn(e.target.checked)} />
          <span>Quiero que el servicio de psicología me contacte</span>
        </label>
        {contactOptIn && (
          <div className="form-grid">
            <label className="field">
              <span>Nombre</span>
              <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Nombre y apellidos" />
            </label>
            <label className="field">
              <span>Teléfono</span>
              <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Ej. +34 600 000 000" />
            </label>
            <label className="field">
              <span>Correo electrónico</span>
              <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="correo@ejemplo.com" />
            </label>
          </div>
        )}
        {contactOptIn && !contactValid && <p className="warning">Introduce al menos un dato de contacto.</p>}
      </div>
      {!supabaseReady && <p className="warning">Configura las variables de entorno para habilitar el envío.</p>}
      {submitError && <p className="error">{submitError}</p>}
      {submitOk && <p className="success">Respuestas guardadas como borrador.</p>}
      <div className="actions">
        <button onClick={() => setStage('dass')}>Volver</button>
        <button className="primary" onClick={handleSubmit} disabled={!allPssAnswered || !allDassAnswered || submitting || !contactValid}>
          {submitting ? 'Enviando...' : 'Enviar cuestionario'}
        </button>
      </div>
    </div>
  )

  const renderCompleted = () => (
    <div className="panel">
      <div className="badge">Enviado</div>
      <h1>Gracias por tu tiempo</h1>
      <p className="lead">Tus respuestas se han guardado con éxito. Puedes cerrar esta ventana con seguridad.</p>
      <div className="manuals">
        <span>Manual de apoyo (PDF):</span>
        <div className="manual-links large">
          {manualLinks.map((manual) => (
            <ManualCard key={manual.id} manual={manual} />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <img src={logo} alt="Armada Española" className="brand-logo" />
          <div>
            <strong>B.E. Juan Sebastián ElCano</strong>
          </div>
        </div>
      </header>
      <main>
        {stage === 'privacy' && renderPrivacy()}
        {stage === 'demographics' && renderDemographics()}
        {stage === 'pss' && renderPss()}
        {stage === 'dass' && renderDass()}
        {stage === 'review' && renderReview()}
        {stage === 'completed' && renderCompleted()}
      </main>
    </div>
  )
}

export default App
