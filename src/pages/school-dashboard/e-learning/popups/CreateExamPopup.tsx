import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Modal from '@/shared/popups/Modal';
import CustomImage from '@/shared/components/CustomImage';
import ClockIcon from '@gradex/assets/icons/ClockYellow.svg';
import CheckIcon from '@gradex/assets/icons/CheckLight.svg';
import SparklesIcon from '@gradex/assets/icons/Sparkles.svg';
import IdeaIcon from '@gradex/assets/icons/Idea.svg';
import WritingIcon from '@gradex/assets/icons/Writing.svg';

type ExamMethod = 'ai' | 'questionBank' | 'manual';

type MethodConfig = {
  key: ExamMethod;
  icon: string;
  color: string;
  boxClass: string;
};

const METHODS: MethodConfig[] = [
  { key: 'manual', icon: WritingIcon, color: '#00512E', boxClass: 'bg-[#00512E]/[0.12]' },
  { key: 'questionBank', icon: IdeaIcon, color: '#A353DD', boxClass: 'bg-[#A353DD]/[0.12]' },
  { key: 'ai', icon: SparklesIcon, color: '#117BD7', boxClass: 'bg-[#117BD7]/[0.12]' },
];

function MaskIcon({ src, color }: { src: string; color: string }) {
  return (
    <span
      aria-hidden
      className="h-4 w-4 shrink-0"
      style={{
        backgroundColor: color,
        maskImage: `url("${src}")`,
        WebkitMaskImage: `url("${src}")`,
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
      }}
    />
  );
}

type CreateExamPopupProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CreateExamPopup({ isOpen, onClose }: CreateExamPopupProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSelectMethod = (method: ExamMethod) => {
    if (method === 'ai') {
      onClose();
      navigate('/lms/online-exams/create/ai');
    } else if (method === 'questionBank') {
      onClose();
      navigate('/lms/online-exams/create/question-bank');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('eLearning.onlineExams.createNew')} size="md">
      <div className="flex flex-col gap-4 sm:flex-row">
        {METHODS.map((method) => {
          const base = `eLearning.onlineExams.popup.methods.${method.key}`;
          const features = ['f1', 'f2', 'f3'];

          return (
            <button
              key={method.key}
              type="button"
              onClick={() => handleSelectMethod(method.key)}
              className="flex flex-1 flex-col items-start gap-6 rounded-3xl border border-[#DDE0E0] p-6 text-start transition-colors hover:bg-gray-50"
            >
              <div className="flex flex-col items-start gap-3 self-stretch">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${method.boxClass}`}
                >
                  <CustomImage src={method.icon} alt="" className="h-6 w-6" />
                </div>
                <span className="text-base font-medium text-[#0E1F1F]">{t(`${base}.title`)}</span>
                <span className="text-sm font-normal text-[#3A3A3A]">{t(`${base}.subtitle`)}</span>
              </div>

              <div className="flex items-center gap-2.5 self-stretch">
                <MaskIcon src={ClockIcon} color={method.color} />
                <span className="flex-1 text-sm font-normal" style={{ color: method.color }}>
                  {t(`${base}.time`)}
                </span>
              </div>

              <div className="flex flex-col items-start gap-3 self-stretch">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2.5 self-stretch">
                    <MaskIcon src={CheckIcon} color={method.color} />
                    <span className="flex-1 text-sm font-normal text-[#646969]">
                      {t(`${base}.${feature}`)}
                    </span>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
