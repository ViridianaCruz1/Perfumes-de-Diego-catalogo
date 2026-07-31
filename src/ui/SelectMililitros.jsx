import CustomSelect from "./CustomSelect";
import { useParfums } from "../context/ParfumsContext";
import {
  getOpcionesMililitros,
  getPlaceholderMililitros,
} from "../functions/pricingDecant";

export default function SelectMililitros({
  value,
  onChange,
  parfum,
  direction = "down",
  variant = "default",
  pulse = false,
}) {
  const { bazarActivo, minDecantBazar } = useParfums();
  const opciones = getOpcionesMililitros(parfum, {
    bazarActivo,
    minDecant: minDecantBazar,
  });
  const placeholder = getPlaceholderMililitros(parfum);
  const esCta = variant === "cta";

  return (
    <CustomSelect
      label={esCta ? undefined : "Selecciona cantidad (ml)"}
      value={value}
      onChange={onChange}
      options={opciones}
      placeholder={esCta ? "🛒 Eligir mililitros" : placeholder}
      direction={direction}
      variant={variant}
      pulse={pulse}
    />
  );
}
