import { motion } from 'framer-motion';
import { categories } from '../data/questions';
import { QuestionProgressDots } from '../components/ProgressBar';
import { useTranslation } from '../i18n/I18nContext';

export function QuestionIntroScreen({
  question,
  questionIndex,
  totalQuestions,
  onStart,
  answers
}) {
  const { t, tContent } = useTranslation();
  const category = question ? categories[question.category] : null;

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Fond avec effet de carte floutée */}
      <div
        className="absolute inset-0 bg-surface-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 30%, color-mix(in srgb, var(--accent) 10%, transparent) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, color-mix(in srgb, var(--warm) 10%, transparent) 0%, transparent 50%)
          `
        }}
      />

      {/* Grille décorative façon carte */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(color-mix(in srgb, var(--accent) 30%, transparent) 1px, transparent 1px),
              linear-gradient(90deg, color-mix(in srgb, var(--accent) 30%, transparent) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Contenu centré */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
        {/* Badge numéro de question */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-accent text-text-primary px-6 py-3 rounded-2xl font-black text-2xl shadow-lg shadow-accent/30">
                {t('common.question')} {questionIndex + 1}/{totalQuestions}
              </div>
              {category && (
                <div
                  className="px-5 py-3 rounded-2xl text-text-primary font-bold text-lg flex items-center gap-3"
                  style={{
                    backgroundColor: category.color + '30',
                    borderColor: category.color,
                    borderWidth: 2
                  }}
                >
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {tContent(category, 'name')}
                </div>
              )}
            </div>
            {/* Indicateur de progression */}
            <QuestionProgressDots
              current={questionIndex}
              total={totalQuestions}
              answers={answers}
            />
          </div>
        </motion.div>

        {/* Question principale */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-text-primary leading-tight">
            {tContent(question, 'question')}
          </h1>
        </motion.div>

        {/* Indicateur de cible */}
        {question?.target?.name && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-12"
          >
            <div className="bg-surface-1/80 backdrop-blur-sm border border-accent/30 rounded-xl px-6 py-3 shadow-lg">
              <span className="text-accent text-lg font-medium">
                {t('questionIntro.locateOnMap')}
              </span>
            </div>
          </motion.div>
        )}

        {/* Bouton lancer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <button
            onClick={onStart}
            className="px-10 py-5 bg-accent hover:brightness-110 text-text-primary font-bold text-xl rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-accent/30 flex items-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('questionIntro.startTimer')}
          </button>
        </motion.div>

        {/* Instruction */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-8 text-text-muted text-lg"
        >
          {t('questionIntro.readQuestion')}
        </motion.p>
      </div>

      {/* Décoration coins */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-4 border-t-4 border-accent/20 rounded-tl-3xl" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r-4 border-t-4 border-accent/20 rounded-tr-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-4 border-b-4 border-accent/20 rounded-bl-3xl" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-4 border-b-4 border-accent/20 rounded-br-3xl" />
    </div>
  );
}

export default QuestionIntroScreen;
