import CustomImage from '@/shared/components/CustomImage';
import SubjectBookGreenIcon from '@/assets/icons/SubjectBookGreen16.svg';
import SubjectCalculatorGreenIcon from '@/assets/icons/SubjectCalculatorGreen16.svg';
import SubjectFlaskAmberIcon from '@/assets/icons/SubjectFlaskAmber16.svg';
import SubjectFlaskBlueIcon from '@/assets/icons/SubjectFlaskBlue16.svg';
import SubjectLeafBlueIcon from '@/assets/icons/SubjectLeafBlue16.svg';
import SubjectWorldAmberIcon from '@/assets/icons/SubjectWorldAmber16.svg';

const ICON_NAME_RULES: [string[], string][] = [
  [['chem'], SubjectFlaskBlueIcon],
  [['biolog'], SubjectLeafBlueIcon],
  [['phys', 'science'], SubjectFlaskAmberIcon],
  [['math', 'number', 'statistic', 'algebra', 'geometr', 'calcul'], SubjectCalculatorGreenIcon],
  [['econom', 'social', 'geograph', 'histor', 'civic'], SubjectWorldAmberIcon],
];

const CATEGORY_ICONS: Record<string, string> = {
  math: SubjectCalculatorGreenIcon,
  sci: SubjectFlaskAmberIcon,
  soc: SubjectWorldAmberIcon,
};

type SubjectIconProps = {
  iconName?: string | null;
  categoryCode?: string | null;
};

export default function SubjectIcon({ iconName, categoryCode }: SubjectIconProps) {
  const normalizedIconName = iconName?.toLowerCase() ?? '';
  const icon =
    ICON_NAME_RULES.find(([keywords]) =>
      keywords.some((keyword) => normalizedIconName.includes(keyword))
    )?.[1] ??
    (categoryCode ? CATEGORY_ICONS[categoryCode.toLowerCase()] : undefined) ??
    SubjectBookGreenIcon;

  return <CustomImage src={icon} alt="" className="shrink-0" />;
}
