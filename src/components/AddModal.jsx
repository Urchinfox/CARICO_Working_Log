import { useState } from "react"
import supabase from "../supabase";
import { useForm } from "react-hook-form";

export default function AddModal({ closeModal, getUser }) {

    const [signUpForm, setSignUpForm] = useState({
        name: '',
        role: '',
        email: '',
        password: ''
    });

    const {
        register,
        handleSubmit: addUserSubmit,
        formState: { errors },

    } = useForm({
        mode: 'onBlur',
    });




    const handleChange = (e) => {
        const { name, value } = e.target
        setSignUpForm((prev) => ({
            ...prev,
            [name]: value
        }))

    }

    // insert userData to users 
    const insertUserData = async (userId, userData) => {
        const { name, role, email } = userData;

        try {
            const { data, error } = await supabase
                .from('users')
                .insert([
                    {
                        user_id: userId,  // user.id return signUp
                        name: name,
                        role: role,
                        email: email
                    }
                ]);

            if (error) throw error;
            console.log('succeed to insert user data', data);
            closeModal('add')
            getUser();

        } catch (error) {
            console.error('failed to insert user data', error);
        }
    };

    const handleSubmit = async (data) => {
        console.log(data);
        setSignUpForm(data);

        try {
            // signUp
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password
            });

            if (authError) {
                console.log('failed to signUp', authError.message);
                throw authError;
            }

            // insert 'users form' after signUp
            await insertUserData(authData.user.id, data);  //  user.id and form 

        } catch (error) {
            console.error('發生錯誤：', error);
        }
    };

    const Input = ({ name, label, type, placeholder, register, errors, rules, title }) => {
        return (<>
            <label htmlFor={label} className="form-label">{title}</label>
            <input type={type} className={`form-control ${errors?.[name] && 'is-invalid'}`} name={name} id={label} placeholder={placeholder}  {...register(name, rules)} />
            {
                errors?.[name] && <div className="invalid-feedback">{errors?.[name].message}</div>
            }
        </>)
    }

    const CheckBox = ({ name, label, type, register, errors, rules, value }) => {
        return (<>
            <input className={`form-check-input ${errors?.[name] && 'is-invalid'}`} type={type} name={name} id={label} value={value} {...register(name, rules)} />
            <label className="form-check-label" htmlFor={label}>
                {value}
            </label>
            {
                errors?.[name] && (<div className="invalid-feedback">{errors?.[name].message}</div>)
            }
        </>)
    }



    return (<>
        <div className="modal fade" id="addStaffModal">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Modal title</h5>
                        <button type="button" className="btn-close" onClick={() => closeModal('add')}></button>
                    </div>
                    <div className="modal-body">
                        {JSON.stringify(signUpForm)}
                        <form onSubmit={addUserSubmit(handleSubmit)}>
                            <div className="mb-3">
                                <Input label='staffName' name='name' type="text" placeholder='馮迪索' errors={errors} register={register} rules={{ required: { value: true, message: '請填寫員工姓名' } }} title='員工姓名' />

                            </div>
                            <div className="mb-3">
                                <Input label='staffEmail' name='email' type="email" placeholder='example.com' errors={errors} register={register} rules={{
                                    required: {
                                        value: true,
                                        message: 'Email必填唷',
                                    },
                                    validate: (value) => {
                                        if (value.length === 0) return 'Email必填唷';
                                        if (!/^\S+@\S+\.\S+$/.test(value)) return 'Email格式不正確唷';
                                        return true;
                                    }
                                }} title='員工帳號' />

                            </div>
                            <div className="mb-3">
                                <Input label='userPassword' name='password' type="password" placeholder='' errors={errors} register={register} rules={{
                                    required: {
                                        value: true,
                                        message: '請輸入密碼',
                                    },
                                    minLength: {
                                        value: 3,
                                        message: '密碼至少三個字'
                                    }
                                }} title='員工密碼' />


                            </div>
                            <div className="form-check">
                                <CheckBox label='role_admin' name='role' register={register} errors={errors} value='admin' type='radio' rules={{ required: true }} />

                            </div>
                            <div className="form-check">
                                <CheckBox label='role_staff' name='role' register={register} errors={errors} value='staff' type='radio' rules={{ required: { value: true, message: '請選擇權限' } }} />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => closeModal('add')}>Close</button>
                                <button type="submit" className="btn btn-primary">確認</button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>


    </>)
}