import type { DetailHTMLAttributes, InputHTMLAttributes } from "react";

type MdButtonProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
  disabled?: boolean;
  class?: string;
};

type MdOutlinedTextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  rows?: number;
  type?: string;
  maxlength?: number;
  class?: string;
  "onInput"?: (event: InputEvent) => void;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "md-filled-button": MdButtonProps;
      "md-outlined-button": MdButtonProps;
      "md-text-button": MdButtonProps;
      "md-outlined-text-field": MdOutlinedTextFieldProps;
    }
  }
}

export type { DetailHTMLAttributes };
