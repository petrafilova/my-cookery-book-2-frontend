import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import * as yup from 'yup';

import { tagApi } from '../../utils/apiWrapper';
import { Api } from '../../openapi';
import Input from '../UI/Input';
import Modal from '../UI/Modal';
import { formatErrorMessage } from '../../utils/errorMessages';
import Spinner from '../UI/Spinner';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

type TagForm = Api.CreateTag | Api.UpdateTag;

const schema = yup.object({
    name: yup
        .string()
        .trim()
        .min(1, 'Musí byť minimálne 1 znak')
        .max(80, 'Musí byť maximálne 80 znakov')
        .required('Povinná položka'),
});

const Tag: React.FC = () => {
    const [error, setError] = useState<string>();
    const navigate = useNavigate();
    const params = useParams();

    const methods = useForm<TagForm>({
        resolver: yupResolver(schema),
    });

    const {
        formState: { isSubmitting },
    } = methods;

    useEffect(() => {
        if (params.id) {
            const paramsNumber = params?.id;
            (async () => {
                const data = await tagApi.getTag(parseInt(paramsNumber));
                methods.reset(data);
            })();
        }
    }, [params.id, methods]);

    const cancelHandler = () => {
        navigate('/tags');
    };

    const submitHandler: SubmitHandler<TagForm> = async (data: TagForm) => {
        console.log(data);
        try {
            if (params.id) {
                await tagApi.updatetag(parseInt(params.id), data);
                navigate('/tags');
            } else {
                await tagApi.createTag(data);
                navigate('/tags');
            }
        } catch (err) {
            formatErrorMessage(err).then((message) => setError(message));
        }
    };

    return (
        <div className='row justify-content-center'>
            <div className='col-lg-6 pt-3'>
                <h1>Značka</h1>
                <FormProvider {...methods}>
                    <Form noValidate onSubmit={methods.handleSubmit(submitHandler)}>
                        <Input name='name' label='Značka' />
                        <Button variant='primary' type='submit'>
                            {params.id ? 'Zmeniť značku' : 'Vytvoriť značku'}
                        </Button>{' '}
                        <Button
                            variant='warning'
                            type='button'
                            onClick={cancelHandler}
                        >
                            Zrušiť
                        </Button>
                        {isSubmitting && <Spinner />}
                    </Form>
                </FormProvider>
            </div>
            <Modal
                show={!!error}
                message={error}
                type='error'
                onClose={() => {
                    setError(undefined);
                }}
            />
        </div>
    );
};

export default Tag;