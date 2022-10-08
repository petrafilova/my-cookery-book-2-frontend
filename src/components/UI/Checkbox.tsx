import React, { useId } from 'react';
import { useField } from 'formik';
import { Form } from 'react-bootstrap';

type CheckboxProps = {
    label: string;
    name: string;
    required?: boolean;
    disabled?: boolean;
};

const Checkbox: React.FC<CheckboxProps> = (props) => {
    const id = useId();
    const [field, meta] = useField(props);

    return (
        <Form.Group className='mb-3' controlId={`${id}_${props.name}`}>
            <Form.Check
                {...field}
                required={props.required}
                label={props.label}
                feedback={meta.touched && meta.error ? meta.error : undefined}
                feedbackType='invalid'
            />
        </Form.Group>
    );
};

export default Checkbox;
