import {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
  useCallback,
  useState,
} from "react";

export const BasicUIButton: React.FC<
  ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, ...rest }) => {
  return (
    <button
      className="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600 active:scale-95 active:bg-blue-700 "
      {...rest}
    >
      {children}
    </button>
  );
};

export function Slider({
  label = "slider value",
  unit = "",
  value = 0,
  onChange,
  min = 0,
  max = 100,
  step = 1,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div className="flex items-center gap-4 mb-2 w-full justify-between">
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-1/2" // Tailwind utility class for half width
      />
      <FlexRow>
        <label className="font-semibold">{label}</label>
        <span>{`${value.toFixed(2)} ${unit}`}</span>
      </FlexRow>
    </div>
  );
}

export const UIButton: React.FC<
  { copyText?: string } & ButtonHTMLAttributes<HTMLButtonElement>
> = ({
  className,
  disabled,
  copyText,

  ...rest
}) => {
  const color = disabled ? "bg-blue-200" : "bg-blue-600";
  const hoverColor = disabled ? "bg-blue-200" : "bg-blue-700";

  const buttonClasses = combineClassNames(
    `${color} hover:${hoverColor} text-white font-bold py-2 px-4 rounded`,
    className || ""
  );

  const [loading, setLoading] = useState(false);
  const [textCopiedIndicator, setTextCopiedIndicator] = useState(false);

  const onClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (e: any) => {
      if (copyText) {
        navigator.clipboard.writeText(copyText);
        setTextCopiedIndicator(true);
        setTimeout(() => {
          setTextCopiedIndicator(false);
        }, 700);
      }

      //check if rest.onClick is an async function
      if (rest.onClick && typeof rest.onClick === "function") {
        setLoading(true);
        await rest.onClick(e);
        setLoading(false);
      }
    },
    [rest, copyText]
  );

  return (
    <button
      className={buttonClasses}
      disabled={disabled}
      style={{
        cursor: loading ? "wait" : "pointer",
        position: "relative",
      }}
      {...rest}
      onClick={onClick}
    >
      <FlexRow className="relative">
        {loading && <LoadingSpinner />}
        {rest.children}
      </FlexRow>

      {/* Tiny animated floating toast above button saying text is copied */}
      {textCopiedIndicator && (
        <>
          <div
            className="absolute top-0 left-0 w-full h-full "
            style={{
              animation: "floatUp 3s ease-in-out forwards",
            }}
          >
            <FlexRow>
              <div
                className="bg-white text-black p-2 rounded-md shadow-lg"
                style={{
                  animation: "floatUp 3s ease-in-out forwards",
                }}
              >
                Text Copied!
              </div>
            </FlexRow>
          </div>
          <style jsx>{`
            @keyframes floatUp {
              0% {
                opacity: 1;
                transform: translateY(0);
              }
              100% {
                opacity: 0;
                transform: translateY(-200px);
              }
            }
          `}</style>
        </>
      )}
    </button>
  );
};

export const FlexRow: React.FC<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  HTMLAttributes<HTMLDivElement> & { ref?: any }
> = ({ className, children, ...rest }) => {
  const combined = combineClassNames(
    "flex flex-row justify-center items-center gap-4",
    className || ""
  );

  return (
    <div className={combined} {...rest}>
      {children}
    </div>
  );
};

export const FlexCol: React.FC<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  HTMLAttributes<HTMLDivElement> & { ref?: any }
> = ({ className, children, ...rest }) => {
  const combined = combineClassNames(
    "flex flex-col justify-center items-center gap-4",
    className || ""
  );
  return (
    <div className={combined} {...rest}>
      {children}
    </div>
  );
};

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

const ToggleSwitch: React.FC<
  ToggleSwitchProps & { className?: string; children?: ReactNode }
> = ({
  enabled,
  onChange,
  className,
  children,
  ...rest
}: ToggleSwitchProps & { className?: string; children?: ReactNode }) => {
  const color = enabled ? "bg-blue-500" : "bg-gray-300";
  const bgClass = `absolute cursor-pointer top-0 left-0 right-0 bottom-0 transition duration-300 ease-in-out rounded-full ${color}`;

  return (
    <div className={`relative inline-block  w-14 h-8   ${className}`} {...rest}>
      <span className={bgClass} />
      <span
        className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ease-in-out  pointer-events-none ${
          enabled ? "transform translate-x-6" : ""
        }`}
      ></span>
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => {
          onChange(e.target.checked);
        }}
        className="opacity-0 w-full h-full"
      />
      {children}
    </div>
  );
};

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="w-4 h-4 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
    </div>
  );
};

function combineClassNames(base: string, override: string) {
  const baseWords = base.split(" ");
  const overrideWords = override.split(" ");

  for (let i = 0; i < overrideWords.length; i++) {
    let overridePrefix = "";

    if (overrideWords[i].includes(":")) {
      overridePrefix = overrideWords[i].split(":")[0];
    } else {
      overridePrefix = overrideWords[i].split("-")[0];
    }

    let found = false;

    for (let j = 0; j < baseWords.length; j++) {
      let basePrefix = "";
      if (baseWords[j].includes(":")) {
        basePrefix = baseWords[j].split(":")[0];
      } else {
        basePrefix = baseWords[j].split("-")[0];
      }

      if (basePrefix === overridePrefix) {
        baseWords[j] = overrideWords[i];
        found = true;
        break;
      }
    }

    if (!found) {
      baseWords.push(overrideWords[i]);
    }
  }

  return baseWords.join(" ");
}

export default ToggleSwitch;
