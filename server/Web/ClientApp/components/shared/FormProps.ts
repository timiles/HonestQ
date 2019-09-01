export interface FormProps<T> {
  initialState?: T;
  submitting?: boolean;
  submitted?: boolean;
  error?: string | null;
  submit?: (form: T) => void;
}
