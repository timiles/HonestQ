export interface FormProps<T> {
    submitting?: boolean;
    submitted?: boolean;
    error?: string | null;
    submit?: (form: T) => void;
}
