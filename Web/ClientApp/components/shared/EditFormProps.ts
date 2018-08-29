import { FormProps } from './FormProps';

export interface EditFormProps<T> extends FormProps<T> {
    loading?: boolean;
}
